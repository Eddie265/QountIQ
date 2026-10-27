import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (await getUser()) redirect("/dashboard");

  return (
    // The card always fits the viewport; only the form column scrolls on very short screens.
    <div className="auth-backdrop flex h-dvh items-center justify-center p-3 sm:p-5 lg:p-8">
      <div className="grid h-full max-h-[780px] w-full max-w-6xl gap-3 rounded-[2rem] bg-white p-3 text-[#16181d] shadow-2xl shadow-black/20 lg:grid-cols-2 lg:rounded-[2.5rem]">
        <div className="flex min-h-0 overflow-y-auto px-5 sm:px-10">
          <div className="m-auto w-full py-6">{children}</div>
        </div>
        <AuthArt />
      </div>
    </div>
  );
}

// Flowing blue shapes, drawn with gradients and blur only.
function AuthArt() {
  return (
    <div aria-hidden className="relative hidden overflow-hidden rounded-[2.25rem] bg-[#1b2cc4] lg:block">
      <svg className="absolute inset-0 size-full" viewBox="0 0 600 760" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="auth-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0b1aa8" />
            <stop offset="0.55" stopColor="#2337e0" />
            <stop offset="1" stopColor="#3d63ff" />
          </linearGradient>
          <radialGradient id="auth-arc" cx="0.15" cy="0.25" r="0.9">
            <stop offset="0.55" stopColor="#3046f0" />
            <stop offset="0.86" stopColor="#5a4fe8" />
            <stop offset="0.97" stopColor="#d8c8ff" />
            <stop offset="1" stopColor="#f1e9ff" />
          </radialGradient>
          <linearGradient id="auth-wave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9b6ff" />
            <stop offset="0.08" stopColor="#5d5df0" />
            <stop offset="0.45" stopColor="#1b2bc9" />
            <stop offset="1" stopColor="#0a1590" />
          </linearGradient>
          <filter id="auth-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="auth-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <rect width="600" height="760" fill="url(#auth-base)" />
        <circle cx="520" cy="120" r="160" fill="#5a7bff" opacity="0.45" filter="url(#auth-blur)" />
        <circle cx="80" cy="700" r="200" fill="#0a118a" opacity="0.7" filter="url(#auth-blur)" />
        <ellipse cx="-60" cy="250" rx="380" ry="520" fill="url(#auth-arc)" filter="url(#auth-soft)" />
        <path
          d="M-40 840 L-40 630 C70 570 150 470 230 400 C300 340 360 300 420 380 C470 445 530 500 640 455 L640 840 Z"
          fill="url(#auth-wave)"
          filter="url(#auth-soft)"
        />
        <path
          d="M-80 900 L-80 700 C120 650 200 600 300 640 C400 680 500 640 680 590 L680 900 Z"
          fill="#4b6dff"
          opacity="0.35"
          filter="url(#auth-blur)"
        />
      </svg>
    </div>
  );
}
