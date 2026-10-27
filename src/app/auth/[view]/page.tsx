import { notFound } from "next/navigation";
import { AuthForm, type AuthView } from "./AuthForm";

const titles: Record<AuthView, string> = {
  "sign-in": "Sign in",
  "sign-up": "Create account",
  "forgot-password": "Reset password",
};

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  return { title: titles[view as AuthView] ?? "Sign in" };
}

export default async function AuthPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!(view in titles)) notFound();
  return <AuthForm view={view as AuthView} />;
}
