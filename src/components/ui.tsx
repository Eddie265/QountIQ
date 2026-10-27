"use client";

import { X } from "lucide-react";
import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  startTransition,
  type ReactNode,
} from "react";
import type { ActionResult } from "@/types";

/* ---------- Modal (native <dialog>) ---------- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl border border-line bg-surface p-0 text-ink`}
    >
      {open && (
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button type="button" onClick={onClose} className="btn-ghost -mr-2 -mt-1 size-8 px-0" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

/* ---------- Toasts ---------- */

type Toast = { id: number; text: string; tone: "success" | "error" };
const ToastContext = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
              t.tone === "error" ? "bg-danger text-white" : "bg-ink text-surface"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/** Runs a server action from a button and reports the result as a toast. */
export function useAction() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const run = useCallback(
    (fn: () => Promise<ActionResult>, onSuccess?: () => void) =>
      startTransition(async () => {
        const res = await fn();
        if (res.ok) {
          if (res.message) toast(res.message);
          onSuccess?.();
        } else toast(res.error, "error");
      }),
    [toast]
  );
  return { run, pending };
}

/** useActionState wrapper for forms: toasts on success and calls onSuccess (e.g. close a modal). */
export function useFormAction(
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>,
  onSuccess?: () => void
) {
  const toast = useToast();
  const [state, formAction, pending] = useActionState(async (prev: ActionResult | null, fd: FormData) => {
    const res = await action(prev, fd);
    if (res.ok) {
      if (res.message) toast(res.message);
      onSuccess?.();
    }
    return res;
  }, null);
  const error = state && !state.ok ? state.error : null;
  // Submit via onSubmit rather than the form's `action` prop: React resets forms after an
  // action completes, which would wipe the user's input when validation fails.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };
  return { onSubmit, pending, error };
}

/* ---------- Form bits ---------- */

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
      {error}
    </p>
  );
}

export function FormActions({ pending, onCancel, submitLabel }: { pending: boolean; onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" className="btn-secondary" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}

/* ---------- Status badge ---------- */

const tones: Record<string, string> = {
  completed: "bg-success-soft text-success",
  paid: "bg-success-soft text-success",
  active: "bg-success-soft text-success",
  failed: "bg-danger-soft text-danger",
  overdue: "bg-danger-soft text-danger",
  frozen: "bg-primary-soft text-primary",
  pending: "bg-warning-soft text-warning",
  scheduled: "bg-warning-soft text-warning",
  sent: "bg-primary-soft text-primary",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${tones[status] ?? "bg-surface-muted text-muted"}`}>{status}</span>;
}

/* ---------- Empty state ---------- */

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
