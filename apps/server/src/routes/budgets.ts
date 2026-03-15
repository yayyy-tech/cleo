import { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/auth";
import { supabaseAdmin } from "../db/supabase";

const router = Router();

function currentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// GET /api/v1/budgets
router.get("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const monthYear = (req.query.month_year as string) || currentMonthYear();
    const userId = req.user!.userId;

    // Fetch budgets
    const { data: budgets, error } = await supabaseAdmin
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", monthYear);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Calculate actual spend per category for this month
    const [year, month] = monthYear.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59)).toISOString();

    const { data: txns } = await supabaseAdmin
      .from("transactions")
      .select("category, amount")
      .eq("user_id", userId)
      .lt("amount", 0) // debits only
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate);

    const spendByCategory = new Map<string, number>();
    for (const tx of txns || []) {
      if (tx.category) {
        spendByCategory.set(
          tx.category,
          (spendByCategory.get(tx.category) || 0) + Math.abs(tx.amount)
        );
      }
    }

    const enriched = (budgets || []).map((b) => ({
      ...b,
      current_spend: spendByCategory.get(b.category) || 0,
      remaining: Math.max(0, b.limit_amount - (spendByCategory.get(b.category) || 0)),
    }));

    res.json({ budgets: enriched });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

// POST /api/v1/budgets — upsert
router.post("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { category, monthly_limit, month_year } = req.body;

    if (!category || !monthly_limit) {
      res.status(400).json({ error: "category and monthly_limit are required" });
      return;
    }

    const targetMonth = month_year || currentMonthYear();

    const { data, error } = await supabaseAdmin
      .from("budgets")
      .upsert(
        {
          user_id: req.user!.userId,
          category,
          limit_amount: monthly_limit,
          month_year: targetMonth,
        },
        { onConflict: "user_id,category,month_year" }
      )
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ budget: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to create/update budget" });
  }
});

export default router;
