import { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/auth";
import { supabaseAdmin } from "../db/supabase";

const router = Router();

// POST /api/v1/auth/sync-user — Create or update user record
router.post("/sync-user", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { name, email, occupation, city, monthly_income } = req.body;
    const userId = req.user!.supabaseAuthId;
    const phone = req.user!.phone;

    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id: userId,
          phone,
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(occupation !== undefined && { occupation }),
          ...(city !== undefined && { city }),
          ...(monthly_income !== undefined && { monthly_income }),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// GET /api/v1/auth/me — Get current user profile
router.get("/me", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", req.user!.userId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH /api/v1/auth/me — Update user profile
router.patch("/me", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { name, email, occupation, city, monthly_income, avatar_url, onboarding_complete } =
      req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (occupation !== undefined) updates.occupation = occupation;
    if (city !== undefined) updates.city = city;
    if (monthly_income !== undefined) updates.monthly_income = monthly_income;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (onboarding_complete !== undefined) updates.onboarding_complete = onboarding_complete;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", req.user!.userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
