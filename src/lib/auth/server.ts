import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

type NeonAuth = ReturnType<typeof createNeonAuth>;
let instance: NeonAuth | undefined;

// Created on first use, not at import, so `next build` doesn't need the auth env vars.
export function getAuth(): NeonAuth {
  if (!instance) {
    const baseUrl = process.env.NEON_AUTH_BASE_URL;
    const secret = process.env.NEON_AUTH_COOKIE_SECRET;
    if (!baseUrl || !secret) throw new Error("Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET (32+ characters).");
    instance = createNeonAuth({ baseUrl, cookies: { secret } });
  }
  return instance;
}

export type SessionUser = { id: string; name: string; email: string; image: string | null };

export async function getUser(): Promise<SessionUser | null> {
  const { data: session } = await getAuth().getSession();
  const user = session?.user;
  if (!user) return null;
  return { id: user.id, name: user.name || user.email, email: user.email, image: user.image ?? null };
}
