"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, CircleCheck, DollarSign, FileText, MoreHorizontal, Receipt } from "lucide-react";
import { deleteTransaction, setTransactionStatus } from "@/app/actions";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/types";
import { LocalDate } from "./LocalDate";
import { StatusBadge, useAction } from "./ui";

export function TransactionTable({ rows, currency, actions = false }: { rows: Transaction[]; currency: string; actions?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="table min-w-[720px]">
        <thead>
          <tr>
            <th><span className="inline-flex items-center gap-1.5"><Receipt className="size-3.5" />Transaction</span></th>
            <th><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />Date &amp; Time</span></th>
            <th><span className="inline-flex items-center gap-1.5"><DollarSign className="size-3.5" />Amount</span></th>
            <th><span className="inline-flex items-center gap-1.5"><FileText className="size-3.5" />Note</span></th>
            <th className="text-right"><span className="inline-flex items-center gap-1.5"><CircleCheck className="size-3.5" />Status</span></th>
            {actions && <th className="w-10"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="hover:bg-surface-muted/60">
              <td>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted">
                  {t.category}
                  {t.customer_name && ` · ${t.customer_name}`}
                  {t.card_last4 && ` · •••• ${t.card_last4}`}
                </p>
              </td>
              <td className="whitespace-nowrap">
                <p><LocalDate value={t.occurred_at} /></p>
                <p className="text-xs text-muted"><LocalDate value={t.occurred_at} format="time" /></p>
              </td>
              <td className={`whitespace-nowrap font-medium tabular-nums ${t.type === "income" ? "text-success" : ""}`}>
                {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}
                {formatCurrency(t.amount, currency)}
              </td>
              <td className="max-w-56 text-muted">
                <p className="line-clamp-2 text-xs">{t.note ?? "—"}</p>
              </td>
              <td className="text-right">
                <StatusBadge status={t.status} />
              </td>
              {actions && (
                <td>
                  <RowMenu t={t} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowMenu({ t }: { t: Transaction }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useAction();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const item = "block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-surface-muted disabled:opacity-50";
  return (
    <div ref={ref} className="relative">
      <button className="btn-ghost size-8 px-0" aria-label={`Actions for ${t.title}`} onClick={() => setOpen((o) => !o)} disabled={pending}>
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="panel absolute right-0 top-9 z-20 w-44 p-1 shadow-lg">
          {(["completed", "pending", "failed"] as const)
            .filter((s) => s !== t.status)
            .map((s) => (
              <button key={s} className={item} onClick={() => (setOpen(false), run(() => setTransactionStatus(t.id, s)))}>
                Mark as {s}
              </button>
            ))}
          <button
            className={`${item} text-danger`}
            onClick={() => {
              setOpen(false);
              if (confirm(`Delete "${t.title}"? This can't be undone.`)) run(() => deleteTransaction(t.id));
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
