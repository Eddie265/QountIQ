import { getAuth } from "@/lib/auth/server";

type Handlers = ReturnType<ReturnType<typeof getAuth>["handler"]>;
type Context = Parameters<Handlers["GET"]>[1];

// Resolved per request so the auth env vars are only needed at runtime, not during `next build`.
const forward = (method: keyof Handlers) => (request: Request, context: Context) =>
  getAuth().handler()[method](request, context);

export const GET = forward("GET");
export const POST = forward("POST");
export const PUT = forward("PUT");
export const DELETE = forward("DELETE");
export const PATCH = forward("PATCH");
