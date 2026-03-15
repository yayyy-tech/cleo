import { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/auth";
import { supabaseAdmin } from "../db/supabase";

const router = Router();
const paramId = (req: Request) => req.params.id as string;

// GET /api/v1/goals
router.get("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("savings_goals")
      .select("*")
      .eq("user_id", req.user!.userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ goals: data || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// POST /api/v1/goals
router.post("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { goal_name, target_amount, target_date, auto_save_amount, auto_save_frequency, emoji } =
      req.body;

    if (!goal_name || !target_amount) {
      res.status(400).json({ error: "goal_name and target_amount are required" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("savings_goals")
      .insert({
        user_id: req.user!.userId,
        name: goal_name,
        target_amount,
        deadline: target_date || null,
        auto_save_amount: auto_save_amount || null,
        auto_save_frequency: auto_save_frequency || null,
        emoji: emoji || "🎯",
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// PATCH /api/v1/goals/:id
router.patch("/:id", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { name, target_amount, current_amount, deadline, auto_save_amount, auto_save_frequency, emoji } =
      req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (target_amount !== undefined) updates.target_amount = target_amount;
    if (current_amount !== undefined) updates.current_amount = current_amount;
    if (deadline !== undefined) updates.deadline = deadline;
    if (auto_save_amount !== undefined) updates.auto_save_amount = auto_save_amount;
    if (auto_save_frequency !== undefined) updates.auto_save_frequency = auto_save_frequency;
    if (emoji !== undefined) updates.emoji = emoji;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("savings_goals")
      .update(updates)
      .eq("id", paramId(req))
      .eq("user_id", req.user!.userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// DELETE /api/v1/goals/:id — soft delete
router.delete("/:id", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("savings_goals")
      .update({ is_active: false })
      .eq("id", paramId(req))
      .eq("user_id", req.user!.userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

export default router;
