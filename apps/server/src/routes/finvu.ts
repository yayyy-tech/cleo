import { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/auth";

const router = Router();

// All Finvu AA endpoints — built in Step 7

router.post("/register", authenticateUser, async (_req: Request, res: Response) => {
  res.status(501).json({ error: "Finvu integration built in Step 7" });
});

router.post("/consent", authenticateUser, async (_req: Request, res: Response) => {
  res.status(501).json({ error: "Finvu integration built in Step 7" });
});

router.get("/consent-status", authenticateUser, async (_req: Request, res: Response) => {
  res.status(501).json({ error: "Finvu integration built in Step 7" });
});

router.post("/fetch-data", authenticateUser, async (_req: Request, res: Response) => {
  res.status(501).json({ error: "Finvu integration built in Step 7" });
});

export default router;
