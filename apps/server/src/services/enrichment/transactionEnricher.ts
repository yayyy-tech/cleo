import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "../../db/supabase";
import { lookupMerchant } from "./merchantDB";
import { DIME_ENRICHMENT_SYSTEM_PROMPT } from "../ai/dimeBrain";

const anthropic = new Anthropic();

/**
 * Enrich a single transaction with merchant, category, and flags.
 */
export async function enrichTransaction(
  transactionId: string,
  rawDescription: string,
  amount: number,
  userId: string
): Promise<void> {
  const lower = rawDescription.toLowerCase();

  // Special-case flags
  const isSalary = /salary|payroll|wages|stipend/.test(lower);
  const isEmi = /emi|loan repay|lic premium/.test(lower);
  const isIncome = isSalary || amount > 0;

  // 1. Try local merchant DB first
  const match = lookupMerchant(rawDescription);

  if (match) {
    await supabaseAdmin
      .from("transactions")
      .update({
        merchant_name: match.merchant,
        category: match.category,
        subcategory: match.subcategory,
        emoji: match.emoji,
        is_recurring: match.is_recurring || false,
        is_income: isIncome,
        is_salary: isSalary,
        is_emi: isEmi,
        enriched: true,
        enrichment_source: "merchant_db",
      })
      .eq("id", transactionId)
      .eq("user_id", userId);

    // Update recurring_charges if needed
    if (match.is_recurring) {
      await upsertRecurringCharge(userId, match.merchant, Math.abs(amount), match.category);
    }

    return;
  }

  // 2. Fall back to AI enrichment via Haiku
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: DIME_ENRICHMENT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Categorize this Indian bank transaction:\nDescription: "${rawDescription}"\nAmount: ₹${(Math.abs(amount) / 100).toFixed(2)} (${amount < 0 ? "debit" : "credit"})\n\nRespond with JSON only: { "merchant": string, "category": string, "subcategory": string, "emoji": string, "is_recurring": boolean }`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        merchant: string;
        category: string;
        subcategory: string;
        emoji: string;
        is_recurring: boolean;
      };

      await supabaseAdmin
        .from("transactions")
        .update({
          merchant_name: parsed.merchant,
          category: parsed.category,
          subcategory: parsed.subcategory,
          emoji: parsed.emoji,
          is_recurring: parsed.is_recurring || false,
          is_income: isIncome,
          is_salary: isSalary,
          is_emi: isEmi,
          enriched: true,
          enrichment_source: "ai",
        })
        .eq("id", transactionId)
        .eq("user_id", userId);

      if (parsed.is_recurring) {
        await upsertRecurringCharge(userId, parsed.merchant, Math.abs(amount), parsed.category);
      }

      return;
    }
  } catch (err) {
    console.error(`AI enrichment failed for txn ${transactionId}:`, err);
  }

  // 3. Fallback: at least set flags
  await supabaseAdmin
    .from("transactions")
    .update({
      is_income: isIncome,
      is_salary: isSalary,
      is_emi: isEmi,
      enriched: true,
      enrichment_source: "ai",
      category: isIncome ? "Income" : "Uncategorized",
      emoji: isIncome ? "💵" : "📦",
    })
    .eq("id", transactionId)
    .eq("user_id", userId);
}

/**
 * Enrich all pending transactions for a user.
 * Runs with a 100ms delay between calls to avoid rate limiting.
 */
export async function enrichPendingTransactions(userId: string): Promise<void> {
  const { data: pending, error } = await supabaseAdmin
    .from("transactions")
    .select("id, description, amount")
    .eq("user_id", userId)
    .eq("enrichment_source", "pending")
    .order("transaction_date", { ascending: false })
    .limit(100);

  if (error || !pending || pending.length === 0) return;

  console.log(`Enriching ${pending.length} pending transactions for user ${userId}`);

  for (const tx of pending) {
    await enrichTransaction(tx.id, tx.description, tx.amount, userId);
    await sleep(100);
  }
}

async function upsertRecurringCharge(
  userId: string,
  merchantName: string,
  amount: number,
  category: string
): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from("recurring_charges")
    .select("id")
    .eq("user_id", userId)
    .eq("merchant_name", merchantName)
    .limit(1);

  if (existing && existing.length > 0) {
    await supabaseAdmin
      .from("recurring_charges")
      .update({ amount, last_charged_at: new Date().toISOString(), is_active: true })
      .eq("id", existing[0].id);
  } else {
    await supabaseAdmin.from("recurring_charges").insert({
      user_id: userId,
      merchant_name: merchantName,
      amount,
      frequency: "monthly",
      category,
      last_charged_at: new Date().toISOString(),
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
