import { Router, Request, Response } from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import pdfParse from "pdf-parse";
import { authenticateUser } from "../middleware/auth";
import { supabaseAdmin } from "../db/supabase";
import { Database } from "../db/types";

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionRowShape = {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  reference: string | null;
};

const router = Router();
const paramId = (req: Request) => req.params.id as string;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// GET /api/v1/transactions
router.get("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const accountId = req.query.account_id as string | undefined;
    const category = req.query.category as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = from || thirtyDaysAgo.toISOString();
    const toDate = to || new Date().toISOString();

    let query = supabaseAdmin
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .gte("transaction_date", fromDate)
      .lte("transaction_date", toDate)
      .order("transaction_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (accountId) query = query.eq("account_id", accountId);
    if (category) query = query.eq("category", category);

    const { data, error, count } = await query;

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ transactions: data || [], total: count || 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// GET /api/v1/transactions/summary
router.get("/summary", authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const monthYear = (req.query.month_year as string) || formatMonthYear(new Date());
    const [year, month] = monthYear.split("-").map(Number);

    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59)).toISOString();

    // Fetch transactions for the month
    const { data: txns, error: txnError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate);

    if (txnError) {
      res.status(400).json({ error: txnError.message });
      return;
    }

    const transactions = txns || [];

    // Compute aggregates in JS
    let totalSpend = 0;
    let totalIncome = 0;
    const categoryMap = new Map<string, { amount: number; count: number; emoji: string }>();
    const merchantMap = new Map<string, { amount: number; count: number }>();
    const dailyMap = new Map<string, number>();

    for (const tx of transactions) {
      const amt = Math.abs(tx.amount);
      if (tx.amount < 0) {
        totalSpend += amt;

        const cat = tx.category || "Uncategorized";
        const existing = categoryMap.get(cat) || { amount: 0, count: 0, emoji: tx.emoji || "📦" };
        existing.amount += amt;
        existing.count++;
        categoryMap.set(cat, existing);

        if (tx.merchant_name) {
          const m = merchantMap.get(tx.merchant_name) || { amount: 0, count: 0 };
          m.amount += amt;
          m.count++;
          merchantMap.set(tx.merchant_name, m);
        }

        const day = tx.transaction_date.slice(0, 10);
        dailyMap.set(day, (dailyMap.get(day) || 0) + amt);
      } else {
        totalIncome += amt;
      }
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.amount - a.amount);

    const topMerchants = Array.from(merchantMap.entries())
      .map(([merchant_name, v]) => ({ merchant_name, ...v }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const dailySpend = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fetch budgets for this month
    const { data: budgets } = await supabaseAdmin
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", monthYear);

    const budgetStatus = (budgets || []).map((b) => {
      const catSpend = categoryMap.get(b.category)?.amount || 0;
      return {
        category: b.category,
        limit: b.limit_amount,
        spent: catSpend,
        remaining: Math.max(0, b.limit_amount - catSpend),
      };
    });

    res.json({
      total_spend: totalSpend,
      total_income: totalIncome,
      by_category: byCategory,
      top_merchants: topMerchants,
      daily_spend: dailySpend,
      budget_status: budgetStatus,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// POST /api/v1/transactions/upload-csv
router.post(
  "/upload-csv",
  authenticateUser,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const userId = req.user!.userId;
      const accountId = (req.body.account_id as string | undefined) || null;
      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname.toLowerCase();
      const mimeType = req.file.mimetype || "";

      let rawRows: Record<string, string>[] = [];

      // Excel: .xlsx / .xls
      if (
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls") ||
        mimeType.includes("spreadsheet") ||
        mimeType.includes("excel")
      ) {
        const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, string>[];
      }
      // PDF
      else if (fileName.endsWith(".pdf") || mimeType.includes("pdf")) {
        const pdfData = (await (pdfParse as any)(fileBuffer)) as { text: string };
        const lines = pdfData.text
          .split("\n")
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);
        rawRows = parsePDFLines(lines);
      }
      // CSV (default)
      else {
        const text = fileBuffer.toString("utf-8");
        rawRows = parseCSVText(text);
      }

      const normalizedRows: TransactionRowShape[] = rawRows
        .map((row) => normalizeRow(row))
        .filter((r): r is TransactionRowShape => r !== null);

      const parsed = normalizedRows
        .map((r): { date: string; amount: number; description: string; referenceId?: string } | null => {
          const credit = r.credit ?? 0;
          const debit = r.debit ?? 0;
          const amount = credit > 0 ? credit : debit > 0 ? -debit : 0;
          if (amount === 0) return null;
          return {
            date: r.date,
            amount,
            description: r.description,
            referenceId: r.reference ?? undefined,
          };
        })
        .filter(
          (r): r is { date: string; amount: number; description: string; referenceId?: string } =>
            r !== null
        );

      if (parsed.length === 0) {
        res.json({ imported: 0, skipped: 0, errors: ["No valid transactions found"] });
        return;
      }

      const { data: existing, error: existingError } = await supabaseAdmin
        .from("transactions")
        .select("id, transaction_date, amount, description")
        .eq("user_id", userId)
        .gte("transaction_date", parsed[parsed.length - 1].date)
        .lte("transaction_date", parsed[0].date);

      if (existingError) {
        res.status(400).json({ error: existingError.message });
        return;
      }

      const existingSet = new Set(
        (existing || []).map(
          (t) => `${t.transaction_date}::${t.amount}::${t.description.toLowerCase()}`
        )
      );

      const toInsert: TransactionInsert[] = [];
      let imported = 0;
      let skipped = 0;

      for (const row of parsed) {
        const key = `${row.date}::${row.amount}::${row.description.toLowerCase()}`;
        if (existingSet.has(key)) {
          skipped += 1;
          continue;
        }

        const insert: TransactionInsert = {
          user_id: userId,
          account_id: accountId,
          amount: row.amount,
          currency: "INR",
          description: row.description,
          transaction_date: row.date,
          reference_id: row.referenceId || null,
          mode: "OTHER",
          is_recurring: false,
          is_income: row.amount > 0,
          is_salary: false,
          is_emi: false,
          enriched: false,
          enrichment_source: "pending",
        };

        toInsert.push(insert);
        imported += 1;
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from("transactions")
          .insert(toInsert);

        if (insertError) {
          res.status(400).json({ error: insertError.message });
          return;
        }
      }

      res.json({ imported, skipped });
    } catch (err) {
      console.error("Failed to process statement upload", err);
      res.status(500).json({ error: "Failed to process file" });
    }
  }
);

// PATCH /api/v1/transactions/:id
router.patch("/:id", authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { notes, category } = req.body;

    const updates: Record<string, unknown> = {};
    if (notes !== undefined) updates.notes = notes;
    if (category !== undefined) {
      updates.category = category;
      updates.enrichment_source = "manual";
      updates.enriched = true;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .update(updates)
      .eq("id", paramId(req))
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ transaction: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// POST /api/v1/transactions/sync-sms
router.post(
  "/sync-sms",
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const body = req.body as {
        transactions?: Array<{
          amount: number;
          type: "DEBIT" | "CREDIT";
          account: string | null;
          upiId: string | null;
          merchantName: string | null;
          date: string | Date;
          balance: number | null;
          bank: string | null;
          rawSMS: string;
        }>;
      };

      const txns = body.transactions || [];
      if (txns.length === 0) {
        res.json({ synced: 0, skipped: 0 });
        return;
      }

      const firstDate = new Date(
        txns.reduce(
          (min, t) => Math.min(min, new Date(t.date).getTime()),
          Date.now()
        )
      ).toISOString();
      const lastDate = new Date(
        txns.reduce(
          (max, t) => Math.max(max, new Date(t.date).getTime()),
          0
        )
      ).toISOString();

      const { data: existing, error: existingError } = await supabaseAdmin
        .from("transactions")
        .select("id, transaction_date, amount, description, reference_id")
        .eq("user_id", userId)
        .gte("transaction_date", firstDate)
        .lte("transaction_date", lastDate);

      if (existingError) {
        res.status(400).json({ error: existingError.message });
        return;
      }

      const existingSet = new Set(
        (existing || []).map(
          (t) =>
            `${t.transaction_date}::${t.amount}::${(t.reference_id || "").toLowerCase()}`
        )
      );

      const inserts: TransactionInsert[] = [];
      let synced = 0;
      let skipped = 0;

      for (const t of txns) {
        const dt = new Date(t.date);
        const iso = dt.toISOString();
        const amount = t.type === "CREDIT" ? Math.abs(t.amount) : -Math.abs(t.amount);
        const refKey = (t.account || "").toLowerCase();
        const dupKey = `${iso}::${amount}::${refKey}`;

        if (existingSet.has(dupKey)) {
          skipped += 1;
          continue;
        }

        const insert: TransactionInsert = {
          user_id: userId,
          account_id: null,
          amount,
          currency: "INR",
          description: t.rawSMS.slice(0, 500),
          merchant_name: t.merchantName,
          transaction_date: iso,
          reference_id: refKey || null,
          mode: t.upiId ? "UPI" : "OTHER",
          is_recurring: false,
          is_income: amount > 0,
          is_salary: false,
          is_emi: false,
          enriched: false,
          enrichment_source: "pending",
          notes: null,
        };

        inserts.push(insert);
        synced += 1;
      }

      if (inserts.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from("transactions")
          .insert(inserts);
        if (insertError) {
          res.status(400).json({ error: insertError.message });
          return;
        }
      }

      res.json({ synced, skipped });
    } catch (err) {
      console.error("Failed to sync SMS transactions", err);
      res.status(500).json({ error: "Failed to sync SMS transactions" });
    }
  }
);

// --- Helpers ---

function formatMonthYear(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Parse CSV text into row objects (header-based)
function parseCSVText(text: string): Record<string, string>[] {
  if (!text.trim()) return [];
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
}

function normalizeRow(row: Record<string, string>): TransactionRowShape | null {
  const parsed = parseCSVRow(row);
  if (!parsed) return null;

  const debit = parsed.amount < 0 ? Math.abs(parsed.amount) : 0;
  const credit = parsed.amount > 0 ? parsed.amount : 0;

  return {
    date: parsed.date,
    description: parsed.description,
    debit: debit || null,
    credit: credit || null,
    reference: parsed.referenceId ?? null,
  };
}

// PDF line parser — detect transaction rows from text lines
function parsePDFLines(lines: string[]): Record<string, string>[] {
  const rows: Record<string, string>[] = [];

  const datePattern = /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i;
  const amountPattern = /([₹]?\s*\d[\d,]*\.?\d*)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!datePattern.test(trimmed)) continue;
    if (!amountPattern.test(trimmed)) continue;

    const parts = trimmed.split(/\s{2,}|\t/).filter((p) => p.trim().length > 0);
    if (parts.length < 2) continue;

    const dateMatch = trimmed.match(datePattern);
    const dateStr = dateMatch ? dateMatch[1] : parts[0];

    let description = trimmed.replace(datePattern, "").trim();

    let debit = "";
    let credit = "";

    const debitRegex = /(debit|dr)[^0-9₹]*([₹]?\s*\d[\d,]*\.?\d*)/i;
    const creditRegex = /(credit|cr)[^0-9₹]*([₹]?\s*\d[\d,]*\.?\d*)/i;

    const debitMatch = trimmed.match(debitRegex);
    const creditMatch = trimmed.match(creditRegex);

    if (debitMatch && debitMatch[2]) {
      debit = debitMatch[2];
    }
    if (creditMatch && creditMatch[2]) {
      credit = creditMatch[2];
    }

    if (!debit && !credit) {
      const amtMatch = trimmed.match(amountPattern);
      if (amtMatch && amtMatch[1]) {
        debit = amtMatch[1];
      }
    }

    rows.push({
      Date: dateStr,
      Description: description,
      Debit: debit,
      Credit: credit,
      Reference: "",
    });
  }

  return rows;
}

// Map common Indian bank CSV column names to our fields
const DATE_COLS = ["date", "txn date", "transaction date", "value date", "posting date"];
const DESC_COLS = ["description", "narration", "particulars", "details", "transaction details"];
const DEBIT_COLS = ["debit", "withdrawal", "dr", "debit amount", "withdrawal amt"];
const CREDIT_COLS = ["credit", "deposit", "cr", "credit amount", "deposit amt"];
const REF_COLS = ["reference", "ref no", "utr", "reference no", "transaction id", "txn ref"];

function findColumn(row: Record<string, string>, candidates: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const found = keys.find((k) => k.toLowerCase().trim() === candidate);
    if (found) return row[found];
  }
  return undefined;
}

function parseCSVRow(
  row: Record<string, string>
): { date: string; amount: number; description: string; referenceId?: string } | null {
  const rawDate = findColumn(row, DATE_COLS);
  const rawDesc = findColumn(row, DESC_COLS);
  const rawDebit = findColumn(row, DEBIT_COLS);
  const rawCredit = findColumn(row, CREDIT_COLS);
  const rawRef = findColumn(row, REF_COLS);

  if (!rawDate || !rawDesc) return null;

  const date = parseIndianDate(rawDate.trim());
  if (!date) return null;

  const debit = parseAmount(rawDebit);
  const credit = parseAmount(rawCredit);

  // If both are 0 / empty, skip
  if (debit === 0 && credit === 0) return null;

  // Debit = negative, Credit = positive (amounts stored in paise)
  const amount = credit > 0 ? credit : -debit;

  return {
    date,
    amount,
    description: rawDesc.trim(),
    referenceId: rawRef?.trim() || undefined,
  };
}

function parseAmount(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[₹,\s]/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === "") return 0;
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return Math.round(num * 100); // Convert to paise
}

function parseIndianDate(raw: string): string | null {
  // Common Indian formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const slashMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00Z`;
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00Z`;
  }

  // Try JS Date parse as fallback
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return null;
}

export default router;
