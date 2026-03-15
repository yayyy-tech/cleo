# Dime — AI-Powered Personal Finance Companion for India

Dime is the Indian equivalent of [Cleo](https://meetcleo.com) — an AI-powered personal finance companion that helps users track spending, save money, and build better financial habits.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo React Native, TypeScript, NativeWind, Expo Router, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + pgvector) |
| AI | Anthropic Claude (Sonnet, Opus, Haiku) |
| Voice | ElevenLabs TTS, OpenAI Whisper ASR |
| Bank Data | Finvu Account Aggregator |

## Project Structure

```
dime/
├── apps/
│   ├── mobile/          Expo React Native app
│   └── server/          Express.js backend
├── packages/
│   └── shared/          Shared types and constants
├── CLAUDE.md
└── package.json         Monorepo root
```

## Getting Started

```bash
# Install all dependencies
npm install

# Start backend
npm run dev:server

# Start mobile app
npm run dev:mobile
```

## Key Conventions

- All money values stored in **paise** (integer), displayed as ₹
- Dates stored in UTC, displayed in IST (Asia/Kolkata)
- TypeScript strict mode everywhere
- API keys always from environment variables
