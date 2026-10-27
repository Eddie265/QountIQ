"use server";

import { revalidatePath } from "next/cache";
import type { PoolClient } from "pg";
import { z } from "zod";
import { getUser } from "@/lib/auth/server";
import { query, queryOne, transaction } from "@/lib/db";
import type { ActionResult } from "@/types";

/* ---------- helpers ---------- */

const money = z.coerce.number().positive("Amount must be greater than 0").max(10_000_000).multipleOf(0.01, "Use at most 2 decimals");
const uuid = z.uuid();
const text = (max = 200) => z.string().trim().min(1, "Required").max(max);
const optionalText = (max = 500) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

class UserError extends Error {}

function fields(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function fail(err: unknown): ActionResult {
  if (err instanceof z.ZodError) return { ok: false, error: err.issues[0]?.message ?? "Invalid input" };
  if (err instanceof UserError) return { ok: false, error: err.message };
  const code = (err as { code?: string }).code;
  if (code === "23505") return { ok: false, error: "That value already exists." };
  if (code === "23503") return { ok: false, error: "This record is still referenced elsewhere." };
  console.error(err);
  return { ok: false, error: "Something went wrong. Please try again." };
}

async function run(fn: () => Promise<string | void>, paths: string[]): Promise<ActionResult> {
  // Server actions are public POST endpoints, so check the session here and not only in the proxy.
  if (!(await getUser())) return { ok: false, error: "Your session has expired. Sign in again." };
  try {
    const message = await fn();
    // "/" means data shown in the shared layout (profile, unread badge) changed.
    for (const p of new Set(["/dashboard", ...paths])) revalidatePath(p, p === "/" ? "layout" : "page");
    return { ok: true, message: message ?? undefined };
  } catch (err) {
    return fail(err);
  }
}

async function actorName(client?: PoolClient) {
  const user = await getUser();
  if (user) return user.name;
  const sql = "SELECT full_name FROM profile WHERE id = 1";
  const row = client ? (await client.query<{ full_name: string }>(sql)).rows[0] : await queryOne<{ full_name: string }>(sql);
  return row?.full_name ?? "You";
}

async function logActivity(action: string, client?: PoolClient, actor?: string) {
  const who = actor ?? (await actorName(client));
  const sql = "INSERT INTO activity (actor, action) VALUES ($1, $2)";
  if (client) await client.query(sql, [who, action]);
  else await query(sql, [who, action]);
}

/**
 * Debits a card inside an open transaction. Locks the card row so concurrent
 * spends can't both pass the balance and daily-limit checks.
 */
async function debitCard(client: PoolClient, cardId: string, amount: number) {
  const card = (
    await client.query<{ balance: number; daily_limit: number; status: string; last4: string }>(
      "SELECT balance, daily_limit, status, last4 FROM cards WHERE id = $1 FOR UPDATE",
      [cardId]
    )
  ).rows[0];
  if (!card) throw new UserError("Card not found.");
  if (card.status !== "active") throw new UserError(`Card •••• ${card.last4} is frozen.`);
  if (card.balance < amount) throw new UserError(`Insufficient balance on card •••• ${card.last4}.`);
  const spent = (
    await client.query<{ spent: number }>(
      `SELECT coalesce(sum(amount), 0) AS spent FROM transactions
       WHERE card_id = $1 AND type = 'expense' AND status <> 'failed' AND occurred_at >= date_trunc('day', now())`,
      [cardId]
    )
  ).rows[0].spent;
  if (spent + amount > card.daily_limit) {
    throw new UserError(`This would exceed the card's daily limit (${(card.daily_limit - spent).toFixed(2)} left today).`);
  }
  await client.query("UPDATE cards SET balance = balance - $2 WHERE id = $1", [cardId, amount]);
}

/* ---------- transactions ---------- */

const transactionSchema = z.object({
  title: text(120),
  category: text(60),
  type: z.enum(["income", "expense"]),
  amount: money,
  status: z.enum(["completed", "pending", "failed"]).default("completed"),
  note: optionalText(),
  occurred_at: isoDate,
  customer_id: z.union([uuid, z.literal("")]).optional().transform((v) => v || null),
  card_id: z.union([uuid, z.literal("")]).optional().transform((v) => v || null),
});

export async function createTransaction(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const t = transactionSchema.parse(fields(formData));
    await transaction(async (client) => {
      if (t.card_id && t.type === "expense" && t.status === "completed") await debitCard(client, t.card_id, t.amount);
      if (t.card_id && t.type === "income" && t.status === "completed") {
        await client.query("UPDATE cards SET balance = balance + $2 WHERE id = $1", [t.card_id, t.amount]);
      }
      // A date-only input means "today" when it's today, so keep the current time for ordering.
      await client.query(
        `INSERT INTO transactions (title, category, type, amount, status, note, occurred_at, customer_id, card_id)
         VALUES ($1, $2, $3, $4, $5, $6,
                 CASE WHEN $7::date = current_date THEN now() ELSE $7::date + time '12:00' END, $8, $9)`,
        [t.title, t.category, t.type, t.amount, t.status, t.note, t.occurred_at, t.customer_id, t.card_id]
      );
      await logActivity(`Recorded ${t.type} "${t.title}"`, client);
    });
    return "Transaction recorded";
  }, ["/transactions", "/analytics", "/cards"]);
}

export async function setTransactionStatus(id: string, status: "completed" | "pending" | "failed") {
  return run(async () => {
    uuid.parse(id);
    z.enum(["completed", "pending", "failed"]).parse(status);
    await query("UPDATE transactions SET status = $2 WHERE id = $1", [id, status]);
  }, ["/transactions", "/analytics"]);
}

export async function deleteTransaction(id: string) {
  return run(async () => {
    uuid.parse(id);
    const row = await queryOne<{ title: string }>("DELETE FROM transactions WHERE id = $1 RETURNING title", [id]);
    if (row) await logActivity(`Deleted transaction "${row.title}"`);
    return "Transaction deleted";
  }, ["/transactions", "/analytics"]);
}

/* ---------- customers ---------- */

const customerSchema = z.object({
  name: text(120),
  email: z.email("Enter a valid email").max(200),
  company: optionalText(120),
  phone: optionalText(40),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function saveCustomer(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const id = formData.get("id");
    const c = customerSchema.parse(fields(formData));
    if (id) {
      uuid.parse(id);
      await query(
        "UPDATE customers SET name = $2, email = $3, company = $4, phone = $5, status = $6 WHERE id = $1",
        [id, c.name, c.email, c.company, c.phone, c.status]
      );
      return "Customer updated";
    }
    await query("INSERT INTO customers (name, email, company, phone, status) VALUES ($1, $2, $3, $4, $5)", [
      c.name, c.email, c.company, c.phone, c.status,
    ]);
    await logActivity(`Added a new client profile for ${c.name}`);
    return "Customer added";
  }, ["/customers", "/invoices"]);
}

export async function deleteCustomer(id: string) {
  return run(async () => {
    uuid.parse(id);
    const invoices = await queryOne<{ n: number }>("SELECT count(*)::int AS n FROM invoices WHERE customer_id = $1", [id]);
    if (invoices && invoices.n > 0) throw new UserError("This customer has invoices. Mark them inactive instead.");
    await query("DELETE FROM customers WHERE id = $1", [id]);
    return "Customer deleted";
  }, ["/customers"]);
}

/* ---------- invoices ---------- */

const invoiceSchema = z
  .object({
    number: text(40),
    customer_id: uuid,
    issue_date: isoDate,
    due_date: isoDate,
    status: z.enum(["draft", "sent"]),
    notes: optionalText(1000),
    lines: z
      .array(
        z.object({
          description: text(200),
          quantity: z.coerce.number().positive("Quantity must be positive"),
          unit_price: z.coerce.number().min(0, "Price can't be negative"),
        })
      )
      .min(1, "Add at least one line item"),
  })
  .refine((v) => v.due_date >= v.issue_date, { message: "Due date must be on or after the issue date" });

export async function createInvoice(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const lines = JSON.parse(String(formData.get("lines") ?? "[]"));
    const inv = invoiceSchema.parse({ ...fields(formData), lines });
    await transaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO invoices (number, customer_id, issue_date, due_date, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [inv.number, inv.customer_id, inv.issue_date, inv.due_date, inv.status, inv.notes]
      );
      for (const l of inv.lines) {
        await client.query(
          "INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price) VALUES ($1, $2, $3, $4)",
          [rows[0].id, l.description, l.quantity, l.unit_price]
        );
      }
      await logActivity(`Created invoice #${inv.number}`, client);
    });
    return `Invoice ${inv.number} created`;
  }, ["/invoices", "/customers"]);
}

export async function setInvoiceStatus(id: string, status: "sent" | "paid" | "void") {
  return run(async () => {
    uuid.parse(id);
    z.enum(["sent", "paid", "void"]).parse(status);
    await transaction(async (client) => {
      const inv = (
        await client.query<{ number: string; status: string; customer_id: string; customer: string; total: number }>(
          `SELECT i.number, i.status, i.customer_id, c.name AS customer,
                  (SELECT coalesce(sum(quantity * unit_price), 0) FROM invoice_lines WHERE invoice_id = i.id) AS total
           FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.id = $1 FOR UPDATE OF i`,
          [id]
        )
      ).rows[0];
      if (!inv) throw new UserError("Invoice not found.");
      if (inv.status === "paid") throw new UserError("Paid invoices can't be changed.");
      if (status === "paid") {
        await client.query("UPDATE invoices SET status = 'paid', paid_at = now() WHERE id = $1", [id]);
        if (inv.total > 0) {
          await client.query(
            `INSERT INTO transactions (title, category, type, amount, note, customer_id, invoice_id)
             VALUES ($1, 'Invoices', 'income', $2, $3, $4, $5)`,
            [`Invoice ${inv.number}`, inv.total, `Payment from ${inv.customer}`, inv.customer_id, id]
          );
        }
        await logActivity(`Paid invoice #${inv.number}`, client, inv.customer);
      } else {
        await client.query("UPDATE invoices SET status = $2 WHERE id = $1", [id, status]);
        await logActivity(`${status === "sent" ? "Sent" : "Voided"} invoice #${inv.number}`, client);
      }
    });
    return status === "paid" ? "Invoice marked as paid" : `Invoice ${status === "sent" ? "sent" : "voided"}`;
  }, ["/invoices", "/transactions", "/customers", "/analytics"]);
}

export async function deleteInvoice(id: string) {
  return run(async () => {
    uuid.parse(id);
    const row = await queryOne<{ number: string }>(
      "DELETE FROM invoices WHERE id = $1 AND status IN ('draft', 'void') RETURNING number",
      [id]
    );
    if (!row) throw new UserError("Only draft or void invoices can be deleted.");
    return `Invoice ${row.number} deleted`;
  }, ["/invoices"]);
}

/* ---------- payments ---------- */

const paymentSchema = z.object({
  payee: text(120),
  amount: money,
  method: z.enum(["ACH", "Wire", "Card", "Check"]),
  category: text(60),
  scheduled_for: isoDate,
  reference: optionalText(60),
  card_id: z.union([uuid, z.literal("")]).optional().transform((v) => v || null),
});

export async function createPayment(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const p = paymentSchema.parse(fields(formData));
    if (p.method === "Card" && !p.card_id) throw new UserError("Choose a card for card payments.");
    await query(
      `INSERT INTO payments (payee, amount, method, category, scheduled_for, reference, card_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [p.payee, p.amount, p.method, p.category, p.scheduled_for, p.reference ?? `PAY-${Date.now().toString().slice(-6)}`,
       p.method === "Card" ? p.card_id : null]
    );
    await logActivity(`Scheduled a payment to ${p.payee}`);
    return "Payment scheduled";
  }, ["/payments"]);
}

/** Executes a scheduled or failed payment now and books the expense. */
export async function payNow(id: string) {
  return run(async () => {
    uuid.parse(id);
    await transaction(async (client) => {
      const p = (
        await client.query<{ payee: string; amount: number; category: string; status: string; card_id: string | null; method: string }>(
          "SELECT payee, amount, category, status, card_id, method FROM payments WHERE id = $1 FOR UPDATE",
          [id]
        )
      ).rows[0];
      if (!p) throw new UserError("Payment not found.");
      if (p.status !== "scheduled" && p.status !== "failed") throw new UserError(`Payment is already ${p.status}.`);
      if (p.card_id) await debitCard(client, p.card_id, p.amount);
      const txn = await client.query<{ id: string }>(
        `INSERT INTO transactions (title, category, type, amount, note, card_id)
         VALUES ($1, $2, 'expense', $3, $4, $5) RETURNING id`,
        [p.payee, p.category, p.amount, `${p.method} payment`, p.card_id]
      );
      await client.query("UPDATE payments SET status = 'completed', transaction_id = $2 WHERE id = $1", [id, txn.rows[0].id]);
      await logActivity(`Paid ${p.payee}`, client);
    });
    return "Payment sent";
  }, ["/payments", "/transactions", "/cards", "/analytics"]);
}

export async function cancelPayment(id: string) {
  return run(async () => {
    uuid.parse(id);
    const row = await queryOne(
      "UPDATE payments SET status = 'cancelled' WHERE id = $1 AND status IN ('scheduled', 'failed') RETURNING id",
      [id]
    );
    if (!row) throw new UserError("Only scheduled or failed payments can be cancelled.");
    return "Payment cancelled";
  }, ["/payments"]);
}

/* ---------- cards ---------- */

const cardSchema = z.object({
  holder: text(80),
  nickname: text(40),
  last4: z.string().regex(/^\d{4}$/, "Enter the last 4 digits"),
  exp_month: z.coerce.number().int().min(1).max(12),
  exp_year: z.coerce.number().int().min(new Date().getFullYear(), "Card is expired").max(new Date().getFullYear() + 15),
  daily_limit: money,
});

export async function createCard(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const c = cardSchema.parse(fields(formData));
    await query(
      `INSERT INTO cards (holder, nickname, last4, exp_month, exp_year, daily_limit, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6, NOT EXISTS (SELECT 1 FROM cards WHERE is_primary))`,
      [c.holder, c.nickname, c.last4, c.exp_month, c.exp_year, c.daily_limit]
    );
    await logActivity(`Added card •••• ${c.last4}`);
    return "Card added";
  }, ["/cards"]);
}

export async function topUpCard(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const { card_id, amount } = z.object({ card_id: uuid, amount: money }).parse(fields(formData));
    await transaction(async (client) => {
      const card = (await client.query<{ last4: string }>(
        "UPDATE cards SET balance = balance + $2 WHERE id = $1 RETURNING last4", [card_id, amount]
      )).rows[0];
      if (!card) throw new UserError("Card not found.");
      await client.query(
        `INSERT INTO transactions (title, category, type, amount, note, card_id)
         VALUES ('Card top up', 'Transfers', 'transfer', $1, $2, $3)`,
        [amount, `Top up to card •••• ${card.last4}`, card_id]
      );
      await logActivity(`Topped up card •••• ${card.last4}`, client);
    });
    return "Card topped up";
  }, ["/cards", "/transactions"]);
}

export async function transferFromCard(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const t = z
      .object({ card_id: uuid, amount: money, recipient: text(120), note: optionalText(200) })
      .parse(fields(formData));
    await transaction(async (client) => {
      await debitCard(client, t.card_id, t.amount);
      await client.query(
        `INSERT INTO transactions (title, category, type, amount, note, card_id)
         VALUES ($1, 'Transfers', 'expense', $2, $3, $4)`,
        [`Transfer to ${t.recipient}`, t.amount, t.note, t.card_id]
      );
      await logActivity(`Sent a transfer to ${t.recipient}`, client);
    });
    return `Sent to ${t.recipient}`;
  }, ["/cards", "/transactions", "/analytics"]);
}

export async function requestPayment(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const r = z
      .object({ customer_id: uuid, amount: money, note: optionalText(200), card_id: z.union([uuid, z.literal("")]).optional().transform((v) => v || null) })
      .parse(fields(formData));
    const customer = await queryOne<{ name: string }>("SELECT name FROM customers WHERE id = $1", [r.customer_id]);
    if (!customer) throw new UserError("Customer not found.");
    await query(
      `INSERT INTO transactions (title, category, type, amount, status, note, customer_id, card_id)
       VALUES ($1, 'Requests', 'income', $2, 'pending', $3, $4, $5)`,
      [`Payment request · ${customer.name}`, r.amount, r.note, r.customer_id, r.card_id]
    );
    await logActivity(`Requested a payment from ${customer.name}`);
    return `Request sent to ${customer.name}`;
  }, ["/transactions", "/cards"]);
}

export async function setCardStatus(id: string, status: "active" | "frozen") {
  return run(async () => {
    uuid.parse(id);
    z.enum(["active", "frozen"]).parse(status);
    const card = await queryOne<{ last4: string }>("UPDATE cards SET status = $2 WHERE id = $1 RETURNING last4", [id, status]);
    if (card) await logActivity(`${status === "frozen" ? "Froze" : "Unfroze"} card •••• ${card.last4}`);
    return status === "frozen" ? "Card frozen" : "Card unfrozen";
  }, ["/cards"]);
}

export async function setPrimaryCard(id: string) {
  return run(async () => {
    uuid.parse(id);
    await transaction(async (client) => {
      await client.query("UPDATE cards SET is_primary = false WHERE is_primary");
      await client.query("UPDATE cards SET is_primary = true WHERE id = $1", [id]);
    });
    return "Primary card updated";
  }, ["/cards"]);
}

export async function setDailyLimit(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const { card_id, daily_limit } = z.object({ card_id: uuid, daily_limit: money }).parse(fields(formData));
    await query("UPDATE cards SET daily_limit = $2 WHERE id = $1", [card_id, daily_limit]);
    return "Daily limit updated";
  }, ["/cards"]);
}

/* ---------- inbox ---------- */

export async function setMessageRead(id: string, read: boolean) {
  return run(async () => {
    uuid.parse(id);
    await query("UPDATE messages SET is_read = $2 WHERE id = $1", [id, read]);
  }, ["/", "/inbox"]);
}

export async function toggleMessageStar(id: string) {
  return run(async () => {
    uuid.parse(id);
    await query("UPDATE messages SET is_starred = NOT is_starred WHERE id = $1", [id]);
  }, ["/", "/inbox"]);
}

export async function markAllRead() {
  return run(async () => {
    await query("UPDATE messages SET is_read = true WHERE NOT is_read");
    return "All caught up";
  }, ["/", "/inbox"]);
}

export async function deleteMessage(id: string) {
  return run(async () => {
    uuid.parse(id);
    await query("DELETE FROM messages WHERE id = $1", [id]);
    return "Message deleted";
  }, ["/", "/inbox"]);
}

/* ---------- settings & support ---------- */

const profileSchema = z.object({
  full_name: text(80),
  role: text(60),
  email: z.email("Enter a valid email"),
  company: text(120),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "ZAR", "KES", "NGN", "MWK", "INR", "JPY"]),
});

export async function saveProfile(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const p = profileSchema.parse(fields(formData));
    await query(
      `INSERT INTO profile (id, full_name, role, email, company, currency) VALUES (1, $1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET full_name = $1, role = $2, email = $3, company = $4, currency = $5, updated_at = now()`,
      [p.full_name, p.role, p.email, p.company, p.currency]
    );
    return "Settings saved";
  }, ["/", "/settings"]);
}

export async function createSupportTicket(_: ActionResult | null, formData: FormData) {
  return run(async () => {
    const t = z.object({ subject: text(120), body: text(4000) }).parse(fields(formData));
    await transaction(async (client) => {
      await client.query("INSERT INTO support_tickets (subject, body) VALUES ($1, $2)", [t.subject, t.body]);
      await client.query(
        "INSERT INTO messages (sender, subject, body) VALUES ('Support', $1, $2)",
        [`We received your request: ${t.subject}`, "Thanks for reaching out. Our team typically replies within one business day."]
      );
    });
    return "Request sent. We'll reply in your inbox.";
  }, ["/", "/help", "/inbox"]);
}
