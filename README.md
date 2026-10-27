# CountIQ

Finance dashboard for small teams: income and expenses, invoices, vendor payments, company cards with daily limits, customers, analytics and an inbox. Built with Next.js 16 (App Router) on Neon Postgres.

## Setup

Requires Node 20+ and the [Neon CLI](https://neon.com/docs/cli) (`npm i -g neon`).

```bash
npm install
neon env pull          # writes DATABASE_URL, DATABASE_URL_UNPOOLED and NEON_AUTH_BASE_URL to .env.local
echo "NEON_AUTH_COOKIE_SECRET=$(openssl rand -base64 32)" >> .env.local
npm run db:migrate     # applies db/migrations/*.sql
npm run db:seed        # optional: 12 months of sample data (skips if data exists)
npm run dev
```

`npm run db:seed -- --reset` deletes all app data and reseeds. Don't run it against a database with real data.

Everyone who signs in shares one workspace (the company in Settings). Sign-up is open; turn it off with `neon neon-auth config email-password` once your team has accounts.

## How it fits together

| Path | What it does |
| --- | --- |
| `db/migrations/` | SQL schema, applied in order by `scripts/migrate.mjs` over the direct (unpooled) connection |
| `src/lib/db.ts` | `pg` pool on the pooled `DATABASE_URL`, registered with `attachDatabasePool` for Vercel Fluid compute |
| `src/lib/queries.ts` | All reads, used by server components |
| `src/app/actions.ts` | All writes, as server actions with zod validation |
| `src/app/api/` | Search, insights and CSV export endpoints |
| `src/lib/auth/` | Neon Auth (Managed Better Auth): server instance and browser client |
| `src/proxy.ts` | Sends signed-out visitors to `/auth/sign-in` |
| `src/app/auth/` | Sign in, sign up and password reset (emailed 6-digit code) |

Money rules enforced on the server:
- Card spends (transfers, card payments, card expenses) lock the card row and check balance, frozen status and the daily limit in one transaction.
- Marking an invoice paid books an income transaction. Paid invoices are locked.
- Paying a scheduled payment books an expense and can't run twice.

## Deploying

On Vercel, set `DATABASE_URL` (pooled), `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` in the project's environment variables, add the production origin with `neon neon-auth domain add https://your-app.vercel.app`, and run `npm run db:migrate` with `DATABASE_URL_UNPOOLED` set whenever a new migration is added.
