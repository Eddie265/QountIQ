import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/auth/sign-in" });

// Every app page needs a session. Sign-in pages, the auth API and static files stay public.
// API routes and server actions check the session themselves.
export const config = {
  matcher: [
    "/",
    "/(dashboard|payments|customers|analytics|cards|invoices|transactions|inbox|settings|help)/:path*",
    "/(dashboard|payments|customers|analytics|cards|invoices|transactions|inbox|settings|help)",
  ],
};
