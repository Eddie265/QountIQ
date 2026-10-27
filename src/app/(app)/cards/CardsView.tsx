"use client";

import { useState } from "react";
import { Plus, Snowflake, Star } from "lucide-react";
import { createCard, setCardStatus, setPrimaryCard } from "@/app/actions";
import { BankCard, LimitMeter } from "@/components/BankCard";
import { CardActions } from "@/components/forms";
import { TransactionTable } from "@/components/TransactionTable";
import { EmptyState, Field, FormActions, FormError, Modal, useAction, useFormAction } from "@/components/ui";
import type { Card, Customer, Transaction } from "@/types";

export function CardsView({
  cards,
  spent,
  customers,
  recent,
  currency,
  holder,
  startNew,
}: {
  cards: Card[];
  spent: Record<string, number>;
  customers: Pick<Customer, "id" | "name">[];
  recent: Transaction[];
  currency: string;
  holder: string;
  startNew: boolean;
}) {
  const [creating, setCreating] = useState(startNew);
  const { run, pending } = useAction();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Cards</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Add card
        </button>
      </div>

      {cards.length === 0 ? (
        <section className="panel">
          <EmptyState title="No cards yet" hint="Add a company card to track balances and daily limits." />
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {cards.map((card) => (
            <article key={card.id} className="panel space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{card.nickname}</h2>
                  {card.is_primary && <span className="badge bg-primary-soft text-primary">Primary</span>}
                </div>
                <div className="flex gap-2">
                  {!card.is_primary && (
                    <button className="btn-ghost btn-sm" disabled={pending} onClick={() => run(() => setPrimaryCard(card.id))}>
                      <Star className="size-3.5" /> Make primary
                    </button>
                  )}
                  <button
                    className="btn-secondary btn-sm"
                    disabled={pending}
                    onClick={() => run(() => setCardStatus(card.id, card.status === "active" ? "frozen" : "active"))}
                  >
                    <Snowflake className="size-3.5" /> {card.status === "active" ? "Freeze" : "Unfreeze"}
                  </button>
                </div>
              </div>
              <BankCard card={card} currency={currency} />
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Spent today</p>
                <LimitMeter spent={spent[card.id] ?? 0} limit={card.daily_limit} currency={currency} />
              </div>
              <CardActions card={card} customers={customers} />
            </article>
          ))}
        </div>
      )}

      <section className="panel">
        <h2 className="px-5 pb-2 pt-4 text-base font-semibold">Recent card activity</h2>
        {recent.length ? <TransactionTable rows={recent} currency={currency} /> : <EmptyState title="No card transactions yet" />}
      </section>

      <Modal open={creating} onClose={() => setCreating(false)} title="Add a card" description="Only the last 4 digits are stored. Never enter a full card number.">
        {creating && <CardForm holder={holder} onDone={() => setCreating(false)} />}
      </Modal>
    </div>
  );
}

function CardForm({ holder, onDone }: { holder: string; onDone: () => void }) {
  const { onSubmit, pending, error } = useFormAction(createCard, onDone);
  const [year] = useState(() => new Date().getFullYear());
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cardholder">
          <input name="holder" required maxLength={80} defaultValue={holder} className="input" />
        </Field>
        <Field label="Nickname">
          <input name="nickname" required maxLength={40} className="input" placeholder="Marketing" />
        </Field>
        <Field label="Last 4 digits">
          <input name="last4" required inputMode="numeric" pattern="\d{4}" maxLength={4} className="input" placeholder="1234" />
        </Field>
        <Field label="Daily limit">
          <input name="daily_limit" type="number" min="1" step="0.01" required defaultValue={5000} className="input" />
        </Field>
        <Field label="Expiry month">
          <select name="exp_month" className="input" defaultValue="12">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {String(i + 1).padStart(2, "0")}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Expiry year">
          <select name="exp_year" className="input" defaultValue={year + 3}>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={year + i}>
                {year + i}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <FormError error={error} />
      <FormActions pending={pending} onCancel={onDone} submitLabel="Add card" />
    </form>
  );
}
