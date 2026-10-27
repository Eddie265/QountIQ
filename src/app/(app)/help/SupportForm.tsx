"use client";

import { useRef } from "react";
import { createSupportTicket } from "@/app/actions";
import { Field, FormError, useFormAction } from "@/components/ui";

export function SupportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { onSubmit, pending, error } = useFormAction(createSupportTicket, () => formRef.current?.reset());
  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <Field label="Subject">
        <input name="subject" required maxLength={120} className="input" />
      </Field>
      <Field label="How can we help?">
        <textarea name="body" required rows={5} maxLength={4000} className="input" />
      </Field>
      <FormError error={error} />
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
