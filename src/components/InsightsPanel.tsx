"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Insight } from "@/lib/insights";
import { Modal } from "./ui";

const toneIcon = {
  positive: <TrendingUp className="size-4 text-success" />,
  negative: <TrendingDown className="size-4 text-danger" />,
  neutral: <Minus className="size-4 text-muted" />,
};

export function InsightsPanel({ open, onClose, currency }: { open: boolean; onClose: () => void; currency: string }) {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/insights")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Insight[]) => !cancelled && (setInsights(data), setError(false)))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const fill = (s: string) => s.replace(/\{\{(-?[\d.]+)\}\}/g, (_, n) => formatCurrency(Number(n), currency));

  return (
    <Modal open={open} onClose={onClose} title="Insights" description="Automatically generated from your latest transactions, invoices and payments.">
      {error ? (
        <p className="text-sm text-danger">Couldn&apos;t load insights. Try again.</p>
      ) : !insights ? (
        <p className="text-sm text-muted">Analyzing…</p>
      ) : insights.length === 0 ? (
        <p className="text-sm text-muted">Nothing notable yet. Record a few transactions to see insights.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {insights.map((i) => (
            <li key={i.title}>
              <Link href={i.href} onClick={onClose} className="flex gap-3 rounded-xl border border-line p-3 hover:bg-surface-muted">
                <span className="mt-0.5">{toneIcon[i.tone]}</span>
                <span>
                  <span className="block text-sm font-medium">{i.title}</span>
                  <span className="block text-sm text-muted">{fill(i.detail)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
