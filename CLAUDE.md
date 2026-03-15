# CLAUDE.md — Dime Project

## What This Is
Dime is an AI-powered personal finance companion for India.
Indian equivalent of Cleo. Builds to Android Play Store.

## Stack
- Mobile: Expo React Native + TypeScript + NativeWind + Expo Router + Zustand
- Backend: Node.js + Express + TypeScript + Supabase
- AI: Anthropic (claude-sonnet-4-5 chat, claude-opus-4-5 deep dive, claude-haiku-4-5 enrichment)
- Voice: ElevenLabs TTS + OpenAI Whisper ASR
- Bank Data: Finvu Account Aggregator
- DB: Supabase (PostgreSQL + pgvector)

## Key Rules
- TypeScript strict mode everywhere
- All money stored in paise (integer), displayed as ₹
- Dates stored UTC, displayed IST (Asia/Kolkata)
- Never hardcode API keys — always from process.env
- All AI personality/brain in apps/server/src/services/ai/dimeBrain.ts
- Never modify dimeBrain.ts without explicit instruction

## Commands
npm run dev:server    → start backend
npm run dev:mobile    → start Expo dev server

## Backend Routes (all at /api/v1/)
POST   /auth/verify
GET    /transactions
POST   /transactions/upload-csv
GET    /transactions/summary
POST   /chat/message         (SSE streaming)
GET    /insights
POST   /accounts/connect
GET    /goals
POST   /goals
WS     /voice

## Database
Supabase. Schema in apps/server/src/db/schema.sql
