import { Router, Request, Response } from "express";

const router = Router();

// WebSocket voice handler — built in Step 14
// REST endpoint for voice status
router.get("/status", (_req: Request, res: Response) => {
  res.json({ voice: "available" });
});

export default router;
