"use client";

import { saveProfile } from "@/app/actions";
import { Field, FormError, useFormAction } from "@/components/ui";
import type { Profile } from "@/types";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "ZAR", "KES", "NGN", "MWK", "INR", "JPY"];

export function SettingsForm({ profile }: { profile: Profile }) {
  const { onSubmit, pending, error } = useFormAction(saveProfile);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="panel space-y-4 p-5">
        <h2 className="text-base font-semibold">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input name="full_name" required maxLength={80} defaultValue={profile.full_name} className="input" />
          </Field>
          <Field label="Role">
            <input name="role" required maxLength={60} defaultValue={profile.role} className="input" />
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <input name="email" type="email" required defaultValue={profile.email} className="input" />
          </Field>
        </div>
      </section>

      <section className="panel space-y-4 p-5">
        <h2 className="text-base font-semibold">Workspace</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <input name="company" required maxLength={120} defaultValue={profile.company} className="input" />
          </Field>
          <Field label="Display currency">
            <select name="currency" defaultValue={profile.currency} className="input">
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <p className="text-xs text-muted">
          The currency changes how amounts are displayed. It doesn&apos;t convert existing values.
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="text-base font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted">Use the Appearance switch in the sidebar to cycle between system, light and dark themes.</p>
      </section>

      <FormError error={error} />
      <div className="flex justify-end">
        <button className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
