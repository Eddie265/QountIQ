import "server-only";
import { cache } from "react";
import { query, queryOne } from "@/lib/db";
import type {
  Activity,
  Card,
  CategoryTotal,
  Customer,
  CustomerWithStats,
  Invoice,
  Message,
  MonthlyTotals,
  Payment,
  Profile,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/types";

const TRANSACTION_SELECT = `
  SELECT t.id, t.title, t.category, t.type, t.amount, t.status, t.note, t.occurred_at,
         t.customer_id, c.name AS customer_name, t.card_id, k.last4 AS card_last4
  FROM transactions t
  LEFT JOIN customers c ON c.id = t.customer_id
  LEFT JOIN cards k ON k.id = t.card_id`;

// Cached per request: the layout and pages both need it.
export const getProfile = cache(async () => {
  const profile = await queryOne<Profile>(
    "SELECT full_name, role, email, company, currency FROM profile WHERE id = 1"
  );
  return profile ?? { full_name: "New user", role: "Finance", email: "", company: "", currency: "USD" };
});

/* ---------- Dashboard ---------- */

export interface PeriodSummary {
  income: number;
  expense: number;
  savings: number;
  incomeChange: number | null;
  expenseChange: number | null;
  savingsChange: number | null;
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** Completed income/expense month-to-date, compared with the same stretch of last month. */
export async function getMonthSummary(): Promise<PeriodSummary> {
  const row = await queryOne<{ inc: number; exp: number; prev_inc: number; prev_exp: number }>(`
    SELECT
      coalesce(sum(amount) FILTER (WHERE type = 'income'  AND occurred_at >= date_trunc('month', now())), 0) AS inc,
      coalesce(sum(amount) FILTER (WHERE type = 'expense' AND occurred_at >= date_trunc('month', now())), 0) AS exp,
      coalesce(sum(amount) FILTER (WHERE type = 'income'  AND occurred_at <= now() - interval '1 month'), 0) AS prev_inc,
      coalesce(sum(amount) FILTER (WHERE type = 'expense' AND occurred_at <= now() - interval '1 month'), 0) AS prev_exp
    FROM transactions
    WHERE status = 'completed'
      AND occurred_at >= date_trunc('month', now()) - interval '1 month'
      AND occurred_at <= now()`);
  const { inc = 0, exp = 0, prev_inc = 0, prev_exp = 0 } = row ?? {};
  return {
    income: inc,
    expense: exp,
    savings: inc - exp,
    incomeChange: pctChange(inc, prev_inc),
    expenseChange: pctChange(exp, prev_exp),
    savingsChange: pctChange(inc - exp, prev_inc - prev_exp),
  };
}

/** Completed income and expense per month for the last 12 months (oldest first, gaps filled). */
export async function getMonthlyTotals(months = 12) {
  return query<MonthlyTotals>(
    `SELECT to_char(m, 'YYYY-MM') AS month,
            coalesce(sum(t.amount) FILTER (WHERE t.type = 'income'), 0)  AS income,
            coalesce(sum(t.amount) FILTER (WHERE t.type = 'expense'), 0) AS expense
     FROM generate_series(date_trunc('month', now()) - make_interval(months => $1 - 1),
                          date_trunc('month', now()), interval '1 month') AS m
     LEFT JOIN transactions t
       ON t.status = 'completed' AND date_trunc('month', t.occurred_at) = m
     GROUP BY m ORDER BY m`,
    [months]
  );
}

export async function getExpenseByCategory(days = 365) {
  return query<CategoryTotal>(
    `SELECT category, sum(amount) AS total
     FROM transactions
     WHERE type = 'expense' AND status = 'completed' AND occurred_at >= now() - make_interval(days => $1)
     GROUP BY category ORDER BY total DESC`,
    [days]
  );
}

export async function getRecentActivity(limit = 6) {
  return query<Activity>("SELECT id, actor, action, created_at FROM activity ORDER BY created_at DESC LIMIT $1", [
    limit,
  ]);
}

/* ---------- Transactions ---------- */

export interface TransactionFilters {
  q?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  category?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

function buildTransactionWhere(f: TransactionFilters) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (f.q) {
    params.push(`%${f.q}%`);
    where.push(`(t.title ILIKE $${params.length} OR t.category ILIKE $${params.length} OR t.note ILIKE $${params.length} OR c.name ILIKE $${params.length})`);
  }
  if (f.type) {
    params.push(f.type);
    where.push(`t.type = $${params.length}`);
  }
  if (f.status) {
    params.push(f.status);
    where.push(`t.status = $${params.length}`);
  }
  if (f.category) {
    params.push(f.category);
    where.push(`t.category = $${params.length}`);
  }
  if (f.from) {
    params.push(f.from);
    where.push(`t.occurred_at >= $${params.length}::date`);
  }
  if (f.to) {
    params.push(f.to);
    where.push(`t.occurred_at < $${params.length}::date + 1`);
  }
  return { clause: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

export async function listTransactions(f: TransactionFilters = {}) {
  const { clause, params } = buildTransactionWhere(f);
  const limit = f.limit ?? 50;
  const offset = f.offset ?? 0;
  const [rows, count] = await Promise.all([
    query<Transaction>(
      `${TRANSACTION_SELECT} ${clause} ORDER BY t.occurred_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    queryOne<{ n: number }>(
      `SELECT count(*)::int AS n FROM transactions t LEFT JOIN customers c ON c.id = t.customer_id ${clause}`,
      params
    ),
  ]);
  return { rows, total: count?.n ?? 0 };
}

export async function listCategories() {
  const rows = await query<{ category: string }>("SELECT DISTINCT category FROM transactions ORDER BY category");
  return rows.map((r) => r.category);
}

/* ---------- Customers ---------- */

export async function listCustomers(q?: string) {
  return query<CustomerWithStats>(
    `SELECT c.*,
            coalesce((SELECT sum(amount) FROM transactions t
                      WHERE t.customer_id = c.id AND t.type = 'income' AND t.status = 'completed'), 0) AS revenue,
            (SELECT count(*)::int FROM invoices i WHERE i.customer_id = c.id AND i.status = 'sent') AS open_invoices,
            (SELECT max(occurred_at) FROM transactions t WHERE t.customer_id = c.id) AS last_activity
     FROM customers c
     WHERE ($1::text IS NULL OR c.name ILIKE '%' || $1 || '%' OR c.email ILIKE '%' || $1 || '%' OR c.company ILIKE '%' || $1 || '%')
     ORDER BY c.name`,
    [q || null]
  );
}

export async function listCustomerOptions() {
  return query<Pick<Customer, "id" | "name">>("SELECT id, name FROM customers WHERE status = 'active' ORDER BY name");
}

/* ---------- Invoices ---------- */

export async function listInvoices(status?: string) {
  return query<Invoice>(
    `SELECT i.id, i.number, i.customer_id, c.name AS customer_name, c.email AS customer_email,
            i.issue_date, i.due_date, i.status, i.notes, i.paid_at,
            coalesce(sum(l.quantity * l.unit_price), 0) AS total,
            coalesce(json_agg(json_build_object('id', l.id, 'description', l.description,
                     'quantity', l.quantity, 'unit_price', l.unit_price) ORDER BY l.description)
                     FILTER (WHERE l.id IS NOT NULL), '[]') AS lines
     FROM invoices i
     JOIN customers c ON c.id = i.customer_id
     LEFT JOIN invoice_lines l ON l.invoice_id = i.id
     WHERE ($1::text IS NULL OR i.status = $1)
     GROUP BY i.id, c.id
     ORDER BY i.issue_date DESC, i.number DESC`,
    [status || null]
  );
}

export async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const row = await queryOne<{ n: number }>(
    `SELECT coalesce(max(substring(number FROM '\\d+$')::int), 0) + 1 AS n FROM invoices WHERE number LIKE $1`,
    [`INV-${year}-%`]
  );
  return `INV-${year}-${String(row?.n ?? 1).padStart(2, "0")}`;
}

/* ---------- Payments ---------- */

export async function listPayments() {
  return query<Payment>(
    `SELECT p.id, p.payee, p.amount, p.method, p.category, p.status, p.scheduled_for, p.reference,
            p.card_id, k.last4 AS card_last4
     FROM payments p LEFT JOIN cards k ON k.id = p.card_id
     ORDER BY CASE p.status WHEN 'scheduled' THEN 0 WHEN 'failed' THEN 1 ELSE 2 END, p.scheduled_for DESC`
  );
}

/* ---------- Cards ---------- */

export async function listCards() {
  return query<Card>("SELECT * FROM cards ORDER BY is_primary DESC, created_at");
}

export async function getPrimaryCard() {
  return queryOne<Card>("SELECT * FROM cards ORDER BY is_primary DESC, created_at LIMIT 1");
}

export async function listCardTransactions(limit = 10) {
  return query<Transaction>(`${TRANSACTION_SELECT} WHERE t.card_id IS NOT NULL ORDER BY t.occurred_at DESC LIMIT $1`, [limit]);
}

/** Completed card spend since local midnight (server timezone) for each card. */
export async function getSpentToday() {
  const rows = await query<{ card_id: string; spent: number }>(
    `SELECT card_id, sum(amount) AS spent FROM transactions
     WHERE card_id IS NOT NULL AND type = 'expense' AND status <> 'failed'
       AND occurred_at >= date_trunc('day', now())
     GROUP BY card_id`
  );
  return Object.fromEntries(rows.map((r) => [r.card_id, r.spent])) as Record<string, number>;
}

/* ---------- Inbox ---------- */

export async function listMessages(filter?: "unread" | "starred") {
  const where = filter === "unread" ? "WHERE NOT is_read" : filter === "starred" ? "WHERE is_starred" : "";
  return query<Message>(`SELECT * FROM messages ${where} ORDER BY created_at DESC`);
}

export async function getUnreadCount() {
  const row = await queryOne<{ n: number }>("SELECT count(*)::int AS n FROM messages WHERE NOT is_read");
  return row?.n ?? 0;
}

/* ---------- Search ---------- */

export interface SearchResult {
  kind: "transaction" | "customer" | "invoice" | "payment";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export async function search(q: string): Promise<SearchResult[]> {
  const like = `%${q}%`;
  const [txns, customers, invoices, payments] = await Promise.all([
    query<{ id: string; title: string; category: string; amount: number }>(
      "SELECT id, title, category, amount FROM transactions WHERE title ILIKE $1 OR category ILIKE $1 ORDER BY occurred_at DESC LIMIT 5",
      [like]
    ),
    query<{ id: string; name: string; email: string }>(
      "SELECT id, name, email FROM customers WHERE name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1 LIMIT 5",
      [like]
    ),
    query<{ id: string; number: string; name: string }>(
      "SELECT i.id, i.number, c.name FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.number ILIKE $1 OR c.name ILIKE $1 LIMIT 5",
      [like]
    ),
    query<{ id: string; payee: string; status: string }>(
      "SELECT id, payee, status FROM payments WHERE payee ILIKE $1 OR reference ILIKE $1 LIMIT 5",
      [like]
    ),
  ]);
  return [
    ...customers.map((c) => ({ kind: "customer" as const, id: c.id, title: c.name, subtitle: c.email, href: `/customers?q=${encodeURIComponent(c.name)}` })),
    ...invoices.map((i) => ({ kind: "invoice" as const, id: i.id, title: i.number, subtitle: i.name, href: `/invoices?open=${i.id}` })),
    ...payments.map((p) => ({ kind: "payment" as const, id: p.id, title: p.payee, subtitle: `Payment · ${p.status}`, href: `/payments` })),
    ...txns.map((t) => ({ kind: "transaction" as const, id: t.id, title: t.title, subtitle: t.category, href: `/transactions?q=${encodeURIComponent(t.title)}` })),
  ];
}
