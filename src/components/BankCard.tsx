import { Snowflake, Wifi } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Card } from "@/types";

export function BankCard({ card, currency }: { card: Card; currency: string }) {
  const frozen = card.status === "frozen";
  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl p-5 text-white ${frozen ? "grayscale-[60%]" : ""}`}
      style={{ background: "linear-gradient(135deg, #6c78f5 0%, #4f5ae6 55%, #3d47c9 100%)" }}
    >
      {/* soft glow shapes */}
      <div className="absolute -right-10 -top-16 -z-10 size-48 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-20 left-10 -z-10 size-56 rounded-full bg-indigo-300/25 blur-3xl" />

      <div className="flex items-start justify-between">
        <p className="text-sm text-white/80">{frozen ? "Card frozen" : "Total balance"}</p>
        {frozen ? <Snowflake className="size-5 text-white/80" /> : <Wifi className="size-5 rotate-90 text-white/80" />}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{formatCurrency(card.balance, currency, { cents: card.balance % 1 !== 0 })}</p>
      <div className="mt-8 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-base font-medium">{card.holder}</p>
          <p className="text-xs tracking-widest text-white/70">•••• {card.last4}</p>
        </div>
        <div className="flex gap-4 text-right text-xs">
          <div>
            <p className="text-white/70">EXP</p>
            <p className="font-medium tabular-nums">
              {String(card.exp_month).padStart(2, "0")}/{String(card.exp_year).slice(-2)}
            </p>
          </div>
          <div>
            <p className="text-white/70">CARD</p>
            <p className="font-medium">{card.nickname}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LimitMeter({ spent, limit, currency }: { spent: number; limit: number; currency: string }) {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  return (
    <div>
      <div className="h-2.5 overflow-hidden rounded-full bg-primary-soft" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${pct >= 90 ? "bg-danger" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2.5 flex justify-between text-xs text-muted">
        <span>
          Spent <span className="font-semibold text-ink">{formatCurrency(spent, currency)}</span>
        </span>
        <span>
          Total <span className="font-semibold text-ink">{formatCurrency(limit, currency)}</span>
        </span>
      </div>
    </div>
  );
}
