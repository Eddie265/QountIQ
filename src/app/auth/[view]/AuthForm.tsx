"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Mail, User } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export type AuthView = "sign-in" | "sign-up" | "forgot-password";

const copy: Record<AuthView, { title: string; subtitle: string }> = {
  "sign-in": { title: "Welcome back", subtitle: "Please enter your details." },
  "sign-up": { title: "Create your account", subtitle: "Start tracking your team's money in minutes." },
  "forgot-password": { title: "Reset your password", subtitle: "We'll email you a 6-digit code." },
};

const field =
  "h-11 w-full rounded-full border border-[#dfe2ea] bg-white pl-5 pr-12 text-sm text-[#16181d] outline-none transition placeholder:text-[#9aa1ad] focus:border-[#1f34c6] focus:ring-4 focus:ring-[#1f34c6]/10";
const primary =
  "flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1f34c6] text-sm font-medium text-white transition hover:bg-[#1a2ca9] disabled:opacity-60";

type Result = { error?: { message?: string; code?: string } | null };

function errorText(res: Result, fallback: string) {
  const e = res.error;
  if (!e) return null;
  if (e.code === "INVALID_EMAIL_OR_PASSWORD") return "That email and password don't match.";
  if (e.code === "USER_ALREADY_EXISTS" || e.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") return "An account with this email already exists.";
  return e.message || fallback;
}

export function AuthForm({ view }: { view: AuthView }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // Reset flow: request a code, then enter it with the new password.
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? codeSentTo ?? "").trim();
    const password = String(fd.get("password") ?? "");
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      if (view === "sign-in") {
        const res = await authClient.signIn.email({ email, password, rememberMe: fd.get("remember") === "on" });
        const msg = errorText(res, "Couldn't sign you in.");
        if (msg) return setError(msg);
        return finish();
      }
      if (view === "sign-up") {
        const res = await authClient.signUp.email({ name: String(fd.get("name") ?? "").trim(), email, password });
        const msg = errorText(res, "Couldn't create your account.");
        if (msg) return setError(msg);
        return finish();
      }
      if (!codeSentTo) {
        const res = await authClient.emailOtp.sendVerificationOtp({ email, type: "forget-password" });
        const msg = errorText(res, "Couldn't send the code.");
        if (msg) return setError(msg);
        setCodeSentTo(email);
        return setNotice(`If ${email} has an account, a code is on its way.`);
      }
      const res = await authClient.emailOtp.resetPassword({ email: codeSentTo, otp: String(fd.get("otp") ?? "").trim(), password });
      const msg = errorText(res, "That code didn't work.");
      if (msg) return setError(msg);
      const signedIn = await authClient.signIn.email({ email: codeSentTo, password });
      if (signedIn.error) return router.replace("/auth/sign-in");
      return finish();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  function finish() {
    router.replace("/dashboard");
    router.refresh();
  }

  async function google() {
    setError(null);
    setPending(true);
    try {
      const res = await authClient.signIn.social({ provider: "google", callbackURL: `${window.location.origin}/dashboard` });
      const msg = errorText(res, "Google sign-in is unavailable right now.");
      if (msg) setError(msg);
    } catch {
      setError("Google sign-in is unavailable right now.");
    } finally {
      setPending(false);
    }
  }

  const passwordInput = (name: string, placeholder: string, autoComplete: string) => (
    <div className="relative">
      <input
        name={name}
        type={showPassword ? "text" : "password"}
        required
        minLength={8}
        maxLength={128}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={placeholder}
        className={field}
      />
      <button
        type="button"
        onClick={() => setShowPassword((s) => !s)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa1ad] hover:text-[#16181d]"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );

  const { title, subtitle } = copy[view];
  const resetStep2 = view === "forgot-password" && codeSentTo;

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="mb-7 text-center">
        <Image src="/countiq-logo.webp" alt="CountIQ" width={360} height={296} priority className="mx-auto mb-4 h-16 w-auto" />
        <h1 className="text-[1.75rem] font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-[#6b7280]">{subtitle}</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {view === "sign-up" && (
          <div className="relative">
            <input name="name" required maxLength={80} autoComplete="name" placeholder="Full name" aria-label="Full name" className={field} />
            <User className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#9aa1ad]" />
          </div>
        )}

        {!resetStep2 && (
          <div className="relative">
            <input name="email" type="email" required autoComplete="email" placeholder="Email" aria-label="Email" className={field} />
            <Mail className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#9aa1ad]" />
          </div>
        )}

        {resetStep2 && (
          <div className="relative">
            <input
              name="otp"
              required
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="6-digit code"
              aria-label="6-digit code"
              className={`${field} tracking-[0.3em]`}
            />
            <KeyRound className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#9aa1ad]" />
          </div>
        )}

        {view === "sign-in" && passwordInput("password", "Password", "current-password")}
        {view === "sign-up" && passwordInput("password", "Password (8+ characters)", "new-password")}
        {resetStep2 && passwordInput("password", "New password (8+ characters)", "new-password")}

        {view === "sign-in" && (
          <div className="flex items-center justify-between px-1 pt-1 text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-[#16181d]">
              <input type="checkbox" name="remember" defaultChecked className="size-3.5 rounded accent-[#1f34c6]" />
              Remember for 30 days
            </label>
            <Link href="/auth/forgot-password" className="text-[#6b7280] hover:text-[#1f34c6]">
              Forgot password?
            </Link>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-2xl bg-[#fdecec] px-4 py-2.5 text-sm text-[#b42318]">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-2xl bg-[#eceefe] px-4 py-2.5 text-sm text-[#1f34c6]">
            {notice}
          </p>
        )}

        <div className="pt-3">
          <button type="submit" disabled={pending} className={primary}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {view === "sign-in" ? "Login" : view === "sign-up" ? "Create account" : resetStep2 ? "Reset password" : "Send code"}
          </button>
        </div>
      </form>

      {view !== "forgot-password" && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-[#9aa1ad]">
            <span className="h-px flex-1 bg-[#eceef2]" />
            or
            <span className="h-px flex-1 bg-[#eceef2]" />
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={google}
              disabled={pending}
              aria-label="Continue with Google"
              title="Continue with Google"
              className="flex size-11 items-center justify-center rounded-full border border-[#dfe2ea] bg-white transition hover:border-[#c7cbd6] hover:shadow-sm disabled:opacity-60"
            >
              <GoogleIcon />
            </button>
          </div>
        </>
      )}

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        {view === "sign-in" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="font-medium text-[#1f34c6] hover:underline">Sign up</Link>
          </>
        ) : view === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-medium text-[#1f34c6] hover:underline">Log in</Link>
          </>
        ) : (
          <>
            {resetStep2 && (
              <button type="button" onClick={() => (setCodeSentTo(null), setNotice(null))} className="mr-3 hover:text-[#1f34c6]">
                Use a different email
              </button>
            )}
            <Link href="/auth/sign-in" className="font-medium text-[#1f34c6] hover:underline">Back to login</Link>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.1 3.57-5.18 3.57-8.65Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3a7.2 7.2 0 0 1-10.73-3.78H1.33v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.33 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.33a12 12 0 0 0 0 10.84l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.43-3.44A12 12 0 0 0 1.33 6.58l4 3.1A7.15 7.15 0 0 1 12 4.77Z" />
    </svg>
  );
}
