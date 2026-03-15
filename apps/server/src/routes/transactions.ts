import { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/auth";
import { supabaseAdmin } from "../db/supabase";
import multer from "multer";
import { parse } from "csv-parse/sync";

const router = Router();
const paramId = (req: Request) => req.params.id as string;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

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
  import * as XLSX from 'xlsx'
import pdfParse from 'pdf-parse'

// Inside the upload route handler:
router.post('/upload-csv', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const { userId } = req.user!
    const fileBuffer = req.file.buffer
    const fileName = req.file.originalname.toLowerCase()
    const mimeType = req.file.mimetype

    let rows: any[] = []

    // ── EXCEL (.xls / .xlsx) ──────────────────────────────
    if (
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('excel')
    ) {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    }

    // ── PDF ───────────────────────────────────────────────
    else if (fileName.endsWith('.pdf') || mimeType.includes('pdf')) {
      const pdfData = await pdfParse(fileBuffer)
      const lines = pdfData.text.split('\n').filter((l: string) => l.trim())
      // Convert PDF lines to row objects
      rows = parsePDFLines(lines)
    }

    // ── CSV (fallback) ────────────────────────────────────
    else {
      const text = fileBuffer.toString('utf-8')
      rows = await parseCSVText(text)
    }

    // Normalize and insert transactions
    const results = await processRows(rows, userId, req.body.account_id)

    res.json({
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors
    })

  } catch (err: any) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Failed to process file', details: err.message })
  }
})

// PDF line parser — handles common Indian bank PDF statement formats
function parsePDFLines(lines: string[]): any[] {
  const rows: any[] = []
  // Pattern: date, description, debit, credit, balance
  const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/
  
  for (const line of lines) {
    if (!datePattern.test(line)) continue
    const parts = line.trim().split(/\s{2,}|\t/)
    if (parts.length < 3) continue
    rows.push({
      Date: parts[0],
      Description: parts[1],
      Debit: parts[2],
      Credit: parts[3] || '',
      Balance: parts[4] || ''
    })
  }
  return rows
}

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

// --- Helpers ---

function formatMonthYear(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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
