import { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/auth";
import { supabaseAdmin } from "../db/supabase";

const router = Router();

function paramId(req: Request): string {
  return req.params.id as string;
}

// GET /api/v1/accounts
router.get("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .eq("user_id", req.user!.userId)
      .order("created_at", { ascending: false });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ accounts: data || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// POST /api/v1/accounts
router.post("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { account_name, account_type, bank_name, account_number, balance, ifsc } = req.body;

    if (!account_type || !bank_name) {
      res.status(400).json({ error: "account_type and bank_name are required" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("accounts")
      .insert({
        user_id: req.user!.userId,
        account_name: account_name || bank_name,
        bank_name,
        account_number: account_number || "XXXX",
        account_type,
        balance: balance || 0,
        ifsc: ifsc || null,
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ account: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

// PATCH /api/v1/accounts/:id
router.patch("/:id", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { balance, account_name, bank_name, ifsc } = req.body;

    const updates: Record<string, unknown> = {};
    if (balance !== undefined) updates.balance = balance;
    if (account_name !== undefined) updates.account_name = account_name;
    if (bank_name !== undefined) updates.bank_name = bank_name;
    if (ifsc !== undefined) updates.ifsc = ifsc;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("accounts")
      .update(updates)
      .eq("id", paramId(req))
      .eq("user_id", req.user!.userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ account: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update account" });
  }
});

// DELETE /api/v1/accounts/:id
router.delete("/:id", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin
      .from("accounts")
      .delete()
      .eq("id", paramId(req))
      .eq("user_id", req.user!.userId);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
