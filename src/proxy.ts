import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

let middleware: ((request: NextRequest) => Promise<Response>) | undefined;

export default function proxy(request: NextRequest) {
  middleware ??= getAuth().middleware({ loginUrl: "/auth/sign-in" });
  return middleware(request);
}

// Every app page needs a session. Sign-in pages, the auth API and static files stay public.
// API routes and server actions check the session themselves.
export const config = {
  matcher: [
    "/",
    "/(dashboard|payments|customers|analytics|cards|invoices|transactions|inbox|settings|help)/:path*",
    "/(dashboard|payments|customers|analytics|cards|invoices|transactions|inbox|settings|help)",
  ],
};
