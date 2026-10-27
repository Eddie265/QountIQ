"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { deleteCustomer, saveCustomer } from "@/app/actions";
import { LocalDate } from "@/components/LocalDate";
import { EmptyState, Field, FormActions, FormError, Modal, StatusBadge, useAction, useFormAction } from "@/components/ui";
import { formatCurrency, initials } from "@/lib/format";
import type { CustomerWithStats } from "@/types";

export function CustomersView({
  customers,
  currency,
  q,
  startOpen,
}: {
  customers: CustomerWithStats[];
  currency: string;
  q: string;
  startOpen: boolean;
}) {
  const [editing, setEditing] = useState<CustomerWithStats | "new" | null>(startOpen ? "new" : null);
  const { run } = useAction();
  const totalRevenue = customers.reduce((s, c) => s + c.revenue, 0);
  const active = customers.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted">
            {active} active · {formatCurrency(totalRevenue, currency, { cents: false })} lifetime revenue
          </p>
        </div>
        <button className="btn-primary" onClick={() => setEditing("new")}>
          <Plus className="size-4" /> Add customer
        </button>
      </div>

      <form className="panel flex gap-2 p-3" role="search">
        <input name="q" defaultValue={q} placeholder="Search by name, email or company" className="input" aria-label="Search customers" />
        <button className="btn-secondary">Search</button>
        {q && <Link href="/customers" className="btn-ghost">Clear</Link>}
      </form>

      {customers.length === 0 ? (
        <section className="panel">
          <EmptyState
            title={q ? `No customers match “${q}”` : "No customers yet"}
            hint="Customers let you send invoices and track revenue per client."
            action={<button className="btn-primary" onClick={() => setEditing("new")}>Add customer</button>}
          />
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {customers.map((c) => (
            <article key={c.id} className="panel flex flex-col p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted">{c.company ?? "Individual"}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-muted">
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 truncate hover:text-ink">
                  <Mail className="size-3.5 shrink-0" /> {c.email}
                </a>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:text-ink">
                    <Phone className="size-3.5 shrink-0" /> {c.phone}
                  </a>
                )}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-muted p-3 text-xs">
                <div>
                  <dt className="text-muted">Revenue</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">{formatCurrency(c.revenue, currency, { compact: true })}</dd>
                </div>
                <div>
                  <dt className="text-muted">Open inv.</dt>
                  <dd className="mt-0.5 font-semibold">{c.open_invoices}</dd>
                </div>
                <div>
                  <dt className="text-muted">Last active</dt>
                  <dd className="mt-0.5 font-semibold">{c.last_activity ? <LocalDate value={c.last_activity} /> : "—"}</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Link href={`/invoices?new=1&customer=${c.id}`} className="btn-secondary btn-sm flex-1">
                  New invoice
                </Link>
                <button className="icon-btn size-8" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}>
                  <Pencil className="size-3.5" />
                </button>
                <button
                  className="icon-btn size-8 hover:text-danger"
                  aria-label={`Delete ${c.name}`}
                  onClick={() => confirm(`Delete ${c.name}?`) && run(() => deleteCustomer(c.id))}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add customer" : "Edit customer"}>
        {editing && <CustomerForm customer={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function CustomerForm({ customer, onDone }: { customer: CustomerWithStats | null; onDone: () => void }) {
  const { onSubmit, pending, error } = useFormAction(saveCustomer, onDone);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <Field label="Full name">
        <input name="name" required maxLength={120} defaultValue={customer?.name} className="input" />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required defaultValue={customer?.email} className="input" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company">
          <input name="company" maxLength={120} defaultValue={customer?.company ?? ""} className="input" />
        </Field>
        <Field label="Phone">
          <input name="phone" type="tel" maxLength={40} defaultValue={customer?.phone ?? ""} className="input" />
        </Field>
      </div>
      <Field label="Status">
        <select name="status" defaultValue={customer?.status ?? "active"} className="input">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>
      <FormError error={error} />
      <FormActions pending={pending} onCancel={onDone} submitLabel={customer ? "Save changes" : "Add customer"} />
    </form>
  );
}
