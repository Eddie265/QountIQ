import { getProfile } from "@/lib/queries";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await getProfile();
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">Your profile and workspace preferences.</p>
      </div>
      <SettingsForm profile={profile} />
    </div>
  );
}
