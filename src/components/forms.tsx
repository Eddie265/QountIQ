"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronDown, Plus, RotateCw } from "lucide-react";
import {
  createTransaction,
  requestPayment,
  setDailyLimit,
  topUpCard,
  transferFromCard,
} from "@/app/actions";
import { todayISO } from "@/lib/format";
import type { Card, Customer } from "@/types";
import { Field, FormActions, FormError, Modal, useFormAction } from "./ui";

type Option = Pick<Customer, "id" | "name">;
type CardOption = Pick<Card, "id" | "nickname" | "last4">;

/* ---------- Transaction ---------- */

export function TransactionForm({
  customers,
  cards,
  categories,
  onDone,
}: {
  customers: Option[];
  cards: CardOption[];
  categories: string[];
  onDone: () => void;
}) {
  const { onSubmit, pending, error } = useFormAction(createTransaction, onDone);
  const [type, setType] = useState<"income" | "expense">("expense");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-muted p-1" role="radiogroup" aria-label="Type">
        {(["expense", "income"] as const).map((t) => (
          <label key={t} className={`cursor-pointer rounded-md py-1.5 text-center text-sm font-medium capitalize ${type === t ? "bg-surface shadow-sm" : "text-muted"}`}>
            <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
            {t}
          </label>
        ))}
      </div>
      <Field label="Title">
        <input name="title" required maxLength={120} className="input" placeholder={type === "income" ? "Website redesign" : "AWS Cloud Hosting"} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount">
          <input name="amount" type="number" step="0.01" min="0.01" required className="input" placeholder="0.00" />
        </Field>
        <Field label="Date">
          <input name="occurred_at" type="date" defaultValue={todayISO()} required className="input" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <input name="category" required list="categories" maxLength={60} className="input" placeholder="Software" />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Status">
          <select name="status" className="input" defaultValue="completed">
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </Field>
      </div>
      {type === "income" ? (
        <Field label="Customer (optional)">
          <select name="customer_id" className="input" defaultValue="">
            <option value="">None</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <Field label="Paid with card (optional)">
          <select name="card_id" className="input" defaultValue="">
            <option value="">Not a card payment</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nickname} •••• {c.last4}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Note (optional)">
        <input name="note" maxLength={500} className="input" />
      </Field>
      <FormError error={error} />
      <FormActions pending={pending} onCancel={onDone} submitLabel="Save transaction" />
    </form>
  );
}

export function NewTransactionButton(props: { customers: Option[]; cards: CardOption[]; categories: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add transaction
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="New transaction">
        <TransactionForm {...props} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

/* ---------- Card actions ---------- */

type CardDialog = null | "topup" | "transfer" | "request" | "limit";

export function CardActions({ card, customers, compact }: { card: Card; customers: Option[]; compact?: boolean }) {
  const [dialog, setDialog] = useState<CardDialog>(null);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const close = () => setDialog(null);
  const frozen = card.status === "frozen";

  const btn = `btn-secondary btn-sm min-w-0 flex-1 ${compact ? "gap-1 px-1.5" : "px-2"}`;
  return (
    <>
      <div className={`flex gap-2 ${compact ? "gap-1.5" : "flex-wrap"}`}>
        <button className={btn} onClick={() => setDialog("topup")}>
          <Plus className="size-3.5" /> Top Up
        </button>
        <button className={btn} onClick={() => setDialog("transfer")} disabled={frozen} title={frozen ? "Card is frozen" : undefined}>
          <ArrowUpRight className="size-3.5" /> Transfer
        </button>
        <button className={btn} onClick={() => setDialog("request")}>
          <ArrowDownLeft className="size-3.5" /> Request
        </button>
        {compact && (
          <button
            className="icon-btn size-8 shrink-0"
            aria-label="Refresh balance"
            title="Refresh"
            onClick={() => {
              setRefreshing(true);
              router.refresh();
              setTimeout(() => setRefreshing(false), 600);
            }}
          >
            <RotateCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        )}
        {!compact && (
          <button className={btn} onClick={() => setDialog("limit")}>
            Daily limit
          </button>
        )}
      </div>

      <Modal open={dialog === "topup"} onClose={close} title="Top up card" description={`Add funds to ${card.nickname} •••• ${card.last4}.`}>
        <AmountForm action={topUpCard} cardId={card.id} onDone={close} submitLabel="Top up" />
      </Modal>
      <Modal open={dialog === "transfer"} onClose={close} title="Send a transfer" description={`From ${card.nickname} •••• ${card.last4}. Counts toward the daily limit.`}>
        <AmountForm action={transferFromCard} cardId={card.id} onDone={close} submitLabel="Send">
          <Field label="Recipient">
            <input name="recipient" required maxLength={120} className="input" placeholder="Name or business" />
          </Field>
          <Field label="Note (optional)">
            <input name="note" maxLength={200} className="input" />
          </Field>
        </AmountForm>
      </Modal>
      <Modal open={dialog === "request"} onClose={close} title="Request a payment" description="Creates a pending income transaction you can mark completed when paid.">
        {customers.length === 0 ? (
          <p className="text-sm text-muted">
            Add a customer first on the <Link className="text-primary underline" href="/customers?new=1">Customers</Link> page.
          </p>
        ) : (
          <AmountForm action={requestPayment} cardId={card.id} onDone={close} submitLabel="Send request">
            <Field label="From customer">
              <select name="customer_id" required className="input">
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Note (optional)">
              <input name="note" maxLength={200} className="input" />
            </Field>
          </AmountForm>
        )}
      </Modal>
      <Modal open={dialog === "limit"} onClose={close} title="Daily spending limit" description={`For ${card.nickname} •••• ${card.last4}.`}>
        <LimitForm card={card} onDone={close} />
      </Modal>
    </>
  );
}

function AmountForm({
  action,
  cardId,
  onDone,
  submitLabel,
  children,
}: {
  action: Parameters<typeof useFormAction>[0];
  cardId: string;
  onDone: () => void;
  submitLabel: string;
  children?: React.ReactNode;
}) {
  const { onSubmit, pending, error } = useFormAction(action, onDone);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="card_id" value={cardId} />
      <Field label="Amount">
        <input name="amount" type="number" step="0.01" min="0.01" required autoFocus className="input" placeholder="0.00" />
      </Field>
      {children}
      <FormError error={error} />
      <FormActions pending={pending} onCancel={onDone} submitLabel={submitLabel} />
    </form>
  );
}

export function LimitForm({ card, onDone }: { card: Card; onDone: () => void }) {
  const { onSubmit, pending, error } = useFormAction(setDailyLimit, onDone);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="card_id" value={card.id} />
      <Field label="Limit per day">
        <input name="daily_limit" type="number" step="0.01" min="1" required defaultValue={card.daily_limit} className="input" />
      </Field>
      <FormError error={error} />
      <FormActions pending={pending} onCancel={onDone} submitLabel="Save limit" />
    </form>
  );
}

/* ---------- "+ New" menu ---------- */

export function NewMenu({ customers, cards, categories }: { customers: Option[]; cards: CardOption[]; categories: string[] }) {
  const [open, setOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const item = "block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-muted";
  return (
    <div ref={ref} className="relative">
      <button className="btn-primary" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Plus className="size-4" /> New <ChevronDown className="size-3.5 opacity-80" />
      </button>
      {open && (
        <div className="panel absolute right-0 top-11 z-30 w-48 p-1.5 shadow-lg">
          <button className={item} onClick={() => (setOpen(false), setTxOpen(true))}>
            Transaction
          </button>
          <Link className={item} href="/invoices?new=1">Invoice</Link>
          <Link className={item} href="/payments?new=1">Payment</Link>
          <Link className={item} href="/customers?new=1">Customer</Link>
          <Link className={item} href="/cards?new=1">Card</Link>
        </div>
      )}
      <Modal open={txOpen} onClose={() => setTxOpen(false)} title="New transaction">
        <TransactionForm customers={customers} cards={cards} categories={categories} onDone={() => setTxOpen(false)} />
      </Modal>
    </div>
  );
}
