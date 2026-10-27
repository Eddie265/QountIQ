"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Printer, Trash2, X } from "lucide-react";
import { createInvoice, deleteInvoice, setInvoiceStatus } from "@/app/actions";
import { EmptyState, Field, FormActions, FormError, Modal, StatusBadge, useAction, useFormAction } from "@/components/ui";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import type { Customer, Invoice } from "@/types";

type Option = Pick<Customer, "id" | "name">;
const TABS = ["all", "draft", "sent", "overdue", "paid", "void"] as const;

const displayStatus = (i: Invoice) => (i.status === "sent" && i.due_date < todayISO() ? "overdue" : i.status);

export function InvoicesView({
  invoices,
  customers,
  currency,
  company,
  nextNumber,
  initialTab,
  startNew,
  presetCustomer,
  openId,
}: {
  invoices: Invoice[];
  customers: Option[];
  currency: string;
  company: string;
  nextNumber: string;
  initialTab: string;
  startNew: boolean;
  presetCustomer?: string;
  openId?: string;
}) {
  const [tab, setTab] = useState<string>(TABS.includes(initialTab as never) ? initialTab : "all");
  const [creating, setCreating] = useState(startNew);
  const [viewId, setViewId] = useState<string | null>(openId ?? null);
  const viewing = invoices.find((i) => i.id === viewId) ?? null;

  const shown = invoices.filter((i) => tab === "all" || displayStatus(i) === tab || (tab === "sent" && i.status === "sent"));
  const sum = (pred: (i: Invoice) => boolean) => invoices.filter(pred).reduce((s, i) => s + i.total, 0);
  const outstanding = sum((i) => i.status === "sent");
  const overdue = sum((i) => displayStatus(i) === "overdue");
  const paid = sum((i) => i.status === "paid");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New invoice
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Outstanding", outstanding, "text-ink"],
          ["Overdue", overdue, overdue > 0 ? "text-danger" : "text-ink"],
          ["Collected", paid, "text-success"],
        ].map(([label, value, cls]) => (
          <div key={label as string} className="panel p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className={`mt-2 text-2xl font-semibold tabular-nums ${cls}`}>{formatCurrency(value as number, currency)}</p>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-2" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm capitalize ${tab === t ? "border-primary font-medium text-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <EmptyState title={tab === "all" ? "No invoices yet" : `No ${tab} invoices`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table min-w-[640px]">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((i) => (
                  <tr key={i.id} onClick={() => setViewId(i.id)} className="cursor-pointer hover:bg-surface-muted/60">
                    <td>
                      <button className="font-medium hover:text-primary" onClick={() => setViewId(i.id)}>
                        {i.number}
                      </button>
                    </td>
                    <td>{i.customer_name}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(i.issue_date)}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(i.due_date)}</td>
                    <td className="text-right font-medium tabular-nums">{formatCurrency(i.total, currency)}</td>
                    <td className="text-right">
                      <StatusBadge status={displayStatus(i)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={creating} onClose={() => setCreating(false)} title="New invoice" wide>
        {creating &&
          (customers.length === 0 ? (
            <p className="text-sm text-muted">
              You need a customer first. <Link href="/customers?new=1" className="text-primary underline">Add a customer</Link>
            </p>
          ) : (
            <InvoiceForm customers={customers} currency={currency} nextNumber={nextNumber} presetCustomer={presetCustomer} onDone={() => setCreating(false)} />
          ))}
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewId(null)} title={viewing ? `Invoice ${viewing.number}` : ""} wide>
        {viewing && <InvoiceDetail invoice={viewing} currency={currency} company={company} onClose={() => setViewId(null)} />}
      </Modal>
    </div>
  );
}

type Line = { key: number; description: string; quantity: string; unit_price: string };

function InvoiceForm({
  customers,
  currency,
  nextNumber,
  presetCustomer,
  onDone,
}: {
  customers: Option[];
  currency: string;
  nextNumber: string;
  presetCustomer?: string;
  onDone: () => void;
}) {
  const { onSubmit, pending, error } = useFormAction(createInvoice, onDone);
  const [lines, setLines] = useState<Line[]>([{ key: 1, description: "", quantity: "1", unit_price: "" }]);
  const [dueISO] = useState(() => {
    const due = new Date(Date.now() + 14 * 86400000);
    return `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
  });
  const total = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0);
  const update = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="lines" value={JSON.stringify(lines.map(({ description, quantity, unit_price }) => ({ description, quantity, unit_price })))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Invoice number">
          <input name="number" required defaultValue={nextNumber} maxLength={40} className="input" />
        </Field>
        <Field label="Customer">
          <select name="customer_id" required defaultValue={presetCustomer ?? customers[0]?.id} className="input">
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Issue date">
          <input name="issue_date" type="date" required defaultValue={todayISO()} className="input" />
        </Field>
        <Field label="Due date">
          <input name="due_date" type="date" required defaultValue={dueISO} className="input" />
        </Field>
      </div>

      <div>
        <p className="label">Line items</p>
        <div className="space-y-2">
          {lines.map((l) => (
            <div key={l.key} className="grid grid-cols-[1fr_70px_100px_32px] gap-2">
              <input aria-label="Description" required placeholder="Description" value={l.description} onChange={(e) => update(l.key, { description: e.target.value })} className="input" />
              <input aria-label="Quantity" required type="number" min="0.01" step="0.01" value={l.quantity} onChange={(e) => update(l.key, { quantity: e.target.value })} className="input px-2" />
              <input aria-label="Unit price" required type="number" min="0" step="0.01" placeholder="Price" value={l.unit_price} onChange={(e) => update(l.key, { unit_price: e.target.value })} className="input px-2" />
              <button
                type="button"
                className="btn-ghost size-10 px-0"
                aria-label="Remove line"
                disabled={lines.length === 1}
                onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setLines((ls) => [...ls, { key: Date.now(), description: "", quantity: "1", unit_price: "" }])}>
            <Plus className="size-3.5" /> Add line
          </button>
          <p className="text-sm">
            Total <span className="font-semibold tabular-nums">{formatCurrency(total, currency)}</span>
          </p>
        </div>
      </div>

      <Field label="Notes (optional)">
        <textarea name="notes" rows={2} maxLength={1000} className="input" placeholder="Payment terms, bank details…" />
      </Field>
      <Field label="Save as">
        <select name="status" defaultValue="sent" className="input">
          <option value="sent">Sent (awaiting payment)</option>
          <option value="draft">Draft</option>
        </select>
      </Field>
      <FormError error={error} />
      <FormActions pending={pending} onCancel={onDone} submitLabel="Create invoice" />
    </form>
  );
}

function InvoiceDetail({ invoice: i, currency, company, onClose }: { invoice: Invoice; currency: string; company: string; onClose: () => void }) {
  const { run, pending } = useAction();
  const status = displayStatus(i);

  const print = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
    w.document.write(`<!doctype html><html><head><title>${esc(i.number)}</title><style>
      body{font-family:system-ui,sans-serif;color:#16181d;padding:48px;max-width:720px;margin:auto}
      h1{font-size:28px;margin:0}table{width:100%;border-collapse:collapse;margin-top:32px}
      th,td{padding:10px 0;border-bottom:1px solid #e7e9ee;text-align:left}td.r,th.r{text-align:right}
      .muted{color:#6b7280}.total{font-size:20px;font-weight:600;text-align:right;margin-top:16px}
    </style></head><body>
      <div style="display:flex;justify-content:space-between"><div><h1>Invoice</h1><p class="muted">${esc(i.number)}</p></div>
      <div style="text-align:right"><strong>${esc(company)}</strong></div></div>
      <p><strong>Bill to:</strong> ${esc(i.customer_name)}<br><span class="muted">${esc(i.customer_email)}</span></p>
      <p class="muted">Issued ${formatDate(i.issue_date)} · Due ${formatDate(i.due_date)}</p>
      <table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead><tbody>
      ${i.lines.map((l) => `<tr><td>${esc(l.description)}</td><td class="r">${l.quantity}</td><td class="r">${formatCurrency(l.unit_price, currency)}</td><td class="r">${formatCurrency(l.quantity * l.unit_price, currency)}</td></tr>`).join("")}
      </tbody></table><p class="total">Total ${formatCurrency(i.total, currency)}</p>
      ${i.notes ? `<p class="muted">${esc(i.notes)}</p>` : ""}
      <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{i.customer_name}</p>
          <p className="text-sm text-muted">{i.customer_email}</p>
        </div>
        <div className="text-right text-sm">
          <StatusBadge status={status} />
          <p className="mt-1 text-muted">
            Issued {formatDate(i.issue_date)} · Due {formatDate(i.due_date)}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {i.lines.map((l) => (
              <tr key={l.id}>
                <td>{l.description}</td>
                <td className="text-right tabular-nums">{l.quantity}</td>
                <td className="text-right tabular-nums">{formatCurrency(l.unit_price, currency)}</td>
                <td className="text-right tabular-nums">{formatCurrency(l.quantity * l.unit_price, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-right text-lg font-semibold tabular-nums">Total {formatCurrency(i.total, currency)}</p>
      {i.notes && <p className="rounded-lg bg-surface-muted p-3 text-sm text-muted">{i.notes}</p>}

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        <button className="btn-secondary mr-auto" onClick={print}>
          <Printer className="size-4" /> Print / PDF
        </button>
        {(i.status === "draft" || i.status === "void") && (
          <button className="btn-ghost text-danger" disabled={pending} onClick={() => confirm(`Delete ${i.number}?`) && run(() => deleteInvoice(i.id), onClose)}>
            <Trash2 className="size-4" /> Delete
          </button>
        )}
        {(i.status === "draft" || i.status === "sent") && (
          <button className="btn-secondary" disabled={pending} onClick={() => confirm(`Void ${i.number}?`) && run(() => setInvoiceStatus(i.id, "void"))}>
            Void
          </button>
        )}
        {i.status === "draft" && (
          <button className="btn-secondary" disabled={pending} onClick={() => run(() => setInvoiceStatus(i.id, "sent"))}>
            Mark as sent
          </button>
        )}
        {(i.status === "draft" || i.status === "sent") && (
          <button className="btn-primary" disabled={pending} onClick={() => run(() => setInvoiceStatus(i.id, "paid"))}>
            Mark as paid
          </button>
        )}
      </div>
    </div>
  );
}
