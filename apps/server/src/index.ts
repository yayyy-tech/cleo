import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import transactionsRoutes from "./routes/transactions";
import insightsRoutes from "./routes/insights";
import accountsRoutes from "./routes/accounts";
import goalsRoutes from "./routes/goals";
import budgetsRoutes from "./routes/budgets";
import voiceRoutes from "./routes/voice";
import finvuRoutes from "./routes/finvu";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";

// CORS
app.use(
  cors({
    origin: isDev
      ? "*"
      : [
          "http://localhost:8081",
          "exp://localhost:8081",
          /https:\/\/.*\.railway\.app$/,
        ],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/transactions", transactionsRoutes);
app.use("/api/v1/insights", insightsRoutes);
app.use("/api/v1/accounts", accountsRoutes);
app.use("/api/v1/goals", goalsRoutes);
app.use("/api/v1/budgets", budgetsRoutes);
app.use("/api/v1/voice", voiceRoutes);
app.use("/api/v1/finvu", finvuRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// HTTP server
const server = http.createServer(app);

// WebSocket server for voice
const wss = new WebSocketServer({ server, path: "/api/v1/voice/ws" });

wss.on("connection", (ws) => {
  console.log("Voice WebSocket client connected");
  ws.on("message", (_data) => {
    // TODO: Handle voice messages — built in Step 14
  });
  ws.on("close", () => {
    console.log("Voice WebSocket client disconnected");
  });
});

// Start
server.listen(PORT, () => {
  console.log(`\u{1FA99} Dime server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down gracefully...");
  wss.close(() => {
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
