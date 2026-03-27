# ansmall-auth-system

Small learning project: **register**, **login**, **logout**, and a protected **`GET /api/me`** using **sessions + cookies** (not JWT). Passwords are hashed with **bcrypt**. Users are stored in **SQLite** (`data/app.db`). Sessions are kept **in memory** (they reset when the server restarts).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use the form, or call the JSON API with a client that sends cookies (e.g. `credentials: "include"` in `fetch`).

Optional: copy `.env.example` to `.env` and set `SESSION_SECRET` (required if `NODE_ENV=production`).

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Body: `{ "email", "password" }` — creates user and logs in |
| POST | `/api/login` | Body: `{ "email", "password" }` |
| POST | `/api/logout` | Ends session |
| GET | `/api/me` | Returns current user if logged in (401 otherwise) |

Rate limit: **50 requests per 15 minutes** per IP on `/api/register` and `/api/login`.

## Layout

- `src/server.ts` — Express app, session middleware, static files
- `src/db.ts` — SQLite users table and queries
- `src/routes/auth.ts` — auth handlers
- `src/middleware/requireAuth.ts` — guard for logged-in routes
- `public/` — demo page (`index.html`, `app.js`)
