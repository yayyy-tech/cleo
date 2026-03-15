import { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/auth";
import { supabaseAdmin } from "../db/supabase";

const router = Router();
const paramId = (req: Request) => req.params.id as string;

// GET /api/v1/insights
router.get("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 20;

    const { data, error } = await supabaseAdmin
      .from("insights")
      .select("*")
      .eq("user_id", req.user!.userId)
      .order("read", { ascending: true })       // unread first
      .order("created_at", { ascending: false }) // then newest
      .limit(limit);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ insights: data || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

// PATCH /api/v1/insights/:id/read
router.patch("/:id/read", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("insights")
      .update({ read: true })
      .eq("id", paramId(req))
      .eq("user_id", req.user!.userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ insight: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark insight as read" });
  }
});

export default router;
