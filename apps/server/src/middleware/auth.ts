import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../db/supabase";

// Extend Express Request globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        supabaseAuthId: string;
        userId: string;
        phone: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT with Supabase Auth
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Look up our users table (id = auth.users.id in our schema)
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from("users")
      .select("id, phone")
      .eq("id", authUser.id)
      .single();

    if (dbError || !dbUser) {
      // User exists in auth but not yet in our users table — allow through
      // with auth info so sync-user endpoint can create the record
      req.user = {
        supabaseAuthId: authUser.id,
        userId: authUser.id,
        phone: authUser.phone || "",
      };
      next();
      return;
    }

    req.user = {
      supabaseAuthId: authUser.id,
      userId: dbUser.id,
      phone: dbUser.phone,
    };

    next();
  } catch (_err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
