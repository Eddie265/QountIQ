import "server-only";
import pg, { Pool, type PoolClient, type QueryResultRow } from "pg";
import { attachDatabasePool } from "@vercel/functions";

// Postgres returns numeric/bigint as strings; money columns are numeric(14,2),
// which fit safely in a JS number.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => parseFloat(v));
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => parseInt(v, 10));
// Keep calendar dates as YYYY-MM-DD strings so they don't shift with the server timezone.
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

const globalForDb = globalThis as unknown as { pgPool?: Pool };

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Run `neon env pull` to create .env.local.");
  }
  // node-postgres already treats sslmode=require as verify-full; saying so explicitly
  // keeps that behavior in pg v9 and silences its deprecation warning.
  const connectionString = url.replace(/sslmode=require\b/, "sslmode=verify-full");
  const pool = new Pool({
    connectionString,
    max: 10,
    // Opening a TLS connection costs several round trips, so keep idle clients
    // around instead of reconnecting on every page view.
    idleTimeoutMillis: 5 * 60_000,
    // A stalled handshake fails fast and is retried by connect() below.
    connectionTimeoutMillis: 10_000,
  });
  // An idle client can be dropped by the server (e.g. scale-to-zero). Without a
  // listener, that error would crash the process.
  pool.on("error", (err) => console.error("Idle Postgres client error:", err.message));
  // Lets Vercel Fluid compute close idle clients before a function instance is suspended.
  attachDatabasePool(pool);
  return pool;
}

export function getPool() {
  // Reuse one pool across hot reloads in dev and across requests in production.
  globalForDb.pgPool ??= createPool();
  return globalForDb.pgPool;
}

/**
 * Acquires a client, retrying connection failures (cold starts, network blips).
 * Only the connect step is retried, so no statement can ever run twice.
 */
async function connect(attempts = 3): Promise<PoolClient> {
  for (let i = 1; ; i++) {
    try {
      return await getPool().connect();
    } catch (err) {
      if (i >= attempts) throw err;
      await new Promise((r) => setTimeout(r, 250 * i));
    }
  }
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const client = await connect();
  try {
    const result = await client.query<T>(text, params);
    client.release();
    return result.rows;
  } catch (err) {
    // Destroy the client if the connection itself broke, so it isn't reused.
    client.release(isConnectionError(err) ? (err as Error) : undefined);
    throw err;
  }
}

export async function queryOne<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await connect();
  let broken: Error | undefined;
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    if (isConnectionError(err)) broken = err as Error;
    else await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release(broken);
  }
}

function isConnectionError(err: unknown) {
  // SQL errors carry a 5-character SQLSTATE; anything else is a transport failure.
  const code = (err as { code?: string })?.code;
  return !(typeof code === "string" && /^[0-9A-Z]{5}$/.test(code));
}
