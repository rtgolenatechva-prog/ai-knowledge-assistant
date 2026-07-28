# AI Knowledge Assistant

A full-stack web app where users register, log in, and chat with an AI assistant. Conversations are saved, listable, resumable, and deletable.

**Live demo:** https://frontend-ochre-kappa-54.vercel.app
**Backend API:** https://ai-knowledge-assistant-backend-aeoc.onrender.com
**Repo:** https://github.com/rtgolenatechva-prog/ai-knowledge-assistant

> Note: the backend is on Render's free tier and spins down after inactivity — the first request after idling can take up to ~50 seconds to respond while it wakes up.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| Backend | Express + TypeScript (separate REST API) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Custom JWT (bcrypt password hashing + jsonwebtoken) |
| AI | OpenRouter API (free model) |

## Architecture

```
/backend   Express REST API — auth, conversations, messages, OpenRouter integration
/frontend  Next.js app — register/login, chat UI, conversation sidebar
```

- Auth is stateless JWT (2h expiry) sent as `Authorization: Bearer <token>` on every protected request. The frontend stores the token in `localStorage` and attaches it via a small `api.ts` fetch wrapper.
- Passwords are hashed with bcrypt (10 salt rounds) before storage — plaintext passwords are never persisted.
- Deleting a conversation cascades to its messages via Prisma's `onDelete: Cascade`.
- Sending a message replays the conversation's message history to OpenRouter for context, then persists both the user message and the AI reply.

## Local Setup

### Prerequisites
- Node.js 20+
- A Supabase project (free tier) for Postgres
- An OpenRouter API key (free tier)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY
npx prisma migrate dev
npm run dev             # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL if backend isn't on localhost:4000
npm run dev              # http://localhost:3000
```

Open http://localhost:3000, register an account, and start chatting.

## Environment Variables

**backend/.env**
| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (Supabase — use the **Transaction pooler** or **Session pooler** URI, not the direct connection, for IPv4 compatibility) |
| `JWT_SECRET` | Long random string for signing JWTs |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_MODEL` | Free model slug (default: `openai/gpt-oss-20b:free` — OpenRouter's free model lineup changes over time, verify availability at https://openrouter.ai/models) |
| `PORT` | Backend port (default 4000) |
| `FRONTEND_URL` | Used for CORS |

**frontend/.env.local**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL |

## Known Limitations

- Auth is stateless JWT with no refresh token or server-side blacklist — logout just discards the client-side token. Acceptable for a 2-hour access token in this scope.
- AI responses are simple request/response (not streamed).
- No automated test suite — verified manually and via a Playwright smoke run through the full user flow (register → login → chat → history → delete → logout).
