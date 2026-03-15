import { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/auth";

const router = Router();

// POST /api/v1/chat/message — SSE streaming chat with Dime AI
// Placeholder — fully built in Step 8
router.post("/message", authenticateUser, async (_req: Request, res: Response) => {
  res.status(501).json({ error: "Chat agent coming in Step 8" });
});

export default router;
