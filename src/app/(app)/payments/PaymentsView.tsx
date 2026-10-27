"use client";

import { useState } from "react";
import { CalendarClock, CircleAlert, CircleCheck, Plus } from "lucide-react";
import { cancelPayment, createPayment, payNow } from "@/app/actions";
import { EmptyState, Field, FormActions, FormError, Modal, StatusBadge, useAction, useFormAction } from "@/components/ui";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import type { Card, Payment } from "@/types";

export function PaymentsView({ payments, cards, currency, startNew }: { payments: Payment[]; cards: Card[]; currency: string; startNew: boolean }) {
  const [creating, setCreating] = useState(startNew);
  const { run, pending } = useAction();

  const scheduled = payments.filter((p) => p.status === "scheduled");
  const failed = payments.filter((p) => p.status === "failed");
  const completed = payments.filter((p) => p.status === "completed");
  const total = (ps: Payment[]) => ps.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Payments</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Schedule payment
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary icon={<CalendarClock className="size-4 text-warning" />} label="Scheduled" count={scheduled.length} amount={total(scheduled)} currency={currency} />
        <Summary icon={<CircleAlert className="size-4 text-danger" />} label="Needs attention" count={failed.length} amount={total(failed)} currency={currency} />
        <Summary icon={<CircleCheck className="size-4 text-success" />} label="Paid" count={completed.length} amount={total(completed)} currency={currency} />
      </div>

      <section className="panel">
        {payments.length === 0 ? (
          <EmptyState title="No payments yet" hint="Schedule vendor bills and pay them from here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table min-w-[760px]">
              <thead>
                <tr>
                  <th>Payee</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const actionable = p.status === "scheduled" || p.status === "failed";
                  return (
                    <tr key={p.id}>
                      <td>
                        <p className="font-medium">{p.payee}</p>
                        <p className="text-xs text-muted">
                          {p.category}
                          {p.reference && ` · ${p.reference}`}
                        </p>
                      </td>
                      <td className="whitespace-nowrap text-muted">{formatDate(p.scheduled_for)}</td>
                      <td className="whitespace-nowrap">
                        {p.method}
                        {p.card_last4 && <span className="text-muted"> •••• {p.card_last4}</span>}
                      </td>
                      <td className="text-right font-medium tabular-nums">{formatCurrency(p.amount, currency)}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="text-right">
                        {actionable ? (
                          <div className="flex justify-end gap-2">
                            <button className="btn-ghost btn-sm" disabled={pending} onClick={() => confirm(`Cancel payment to ${p.payee}?`) && run(() => cancelPayment(p.id))}>
                              Cancel
                            </button>
                            <button
                              className="btn-primary btn-sm"
                              disabled={pending}
                              onClick={() => confirm(`Pay ${formatCurrency(p.amount, currency)} to ${p.payee} now?`) && run(() => payNow(p.id))}
                            >
                              {p.status === "failed" ? "Retry" : "Pay now"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-faint">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={creating} onClose={() => setCreating(false)} title="Schedule a payment">
        {creating && <PaymentForm cards={cards} onDone={() => setCreating(false)} />}
      </Modal>
    </div>
  );
}

function Summary({ icon, label, count, amount, currency }: { icon: React.ReactNode; label: string; count: number; amount: number; currency: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{formatCurrency(amount, currency)}</p>
      <p className="mt-1 text-xs text-muted">
        {count} payment{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function PaymentForm({ cards, onDone }: { cards: Card[]; onDone: () => void }) {
  const { onSubmit, pending, error } = useFormAction(createPayment, onDone);
  const [method, setMethod] = useState("ACH");
  const activeCards = cards.filter((c) => c.status === "active");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Payee">
        <input name="payee" required maxLength={120} className="input" placeholder="Vendor or person" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount">
          <input name="amount" type="number" step="0.01" min="0.01" required className="input" placeholder="0.00" />
        </Field>
        <Field label="Pay on">
          <input name="scheduled_for" type="date" required defaultValue={todayISO()} className="input" />
        </Field>
        <Field label="Method">
          <select name="method" value={method} onChange={(e) => setMethod(e.target.value)} className="input">
            <option>ACH</option>
            <option>Wire</option>
            <option>Card</option>
            <option>Check</option>
          </select>
        </Field>
        <Field label="Category">
          <input name="category" required maxLength={60} className="input" placeholder="Rent" />
        </Field>
      </div>
      {method === "Card" && (
        <Field label="Card">
          <select name="card_id" required className="input">
            {activeCards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nickname} •••• {c.last4}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Reference (optional)">
        <input name="reference" maxLength={60} className="input" placeholder="Invoice or PO number" />
      </Field>
      <FormError error={error} />
      <FormActions pending={pending} onCancel={onDone} submitLabel="Schedule" />
    </form>
  );
}
