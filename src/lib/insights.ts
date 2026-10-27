import "server-only";
import { queryOne } from "@/lib/db";

export interface Insight {
  title: string;
  detail: string;
  tone: "positive" | "neutral" | "negative";
  href: string;
}

/** Rule-based observations derived from the ledger. Amounts are raw numbers; the client formats them. */
export async function getInsights() {
  const s = await queryOne<{
    exp_now: number;
    exp_prev: number;
    inc_now: number;
    top_cat: string | null;
    top_cat_total: number;
    overdue_n: number;
    overdue_total: number;
    upcoming_n: number;
    upcoming_total: number;
    failed_n: number;
  }>(`
    WITH m AS (SELECT date_trunc('month', now()) AS start)
    SELECT
      (SELECT coalesce(sum(amount), 0) FROM transactions, m WHERE type = 'expense' AND status = 'completed' AND occurred_at >= m.start) AS exp_now,
      (SELECT coalesce(sum(amount), 0) FROM transactions, m WHERE type = 'expense' AND status = 'completed'
         AND occurred_at >= m.start - interval '1 month' AND occurred_at < now() - interval '1 month') AS exp_prev,
      (SELECT coalesce(sum(amount), 0) FROM transactions, m WHERE type = 'income' AND status = 'completed' AND occurred_at >= m.start) AS inc_now,
      (SELECT category FROM transactions, m WHERE type = 'expense' AND status = 'completed' AND occurred_at >= m.start
         GROUP BY category ORDER BY sum(amount) DESC LIMIT 1) AS top_cat,
      (SELECT coalesce(max(t), 0) FROM (SELECT sum(amount) AS t FROM transactions, m WHERE type = 'expense' AND status = 'completed'
         AND occurred_at >= m.start GROUP BY category) x) AS top_cat_total,
      (SELECT count(*)::int FROM invoices WHERE status = 'sent' AND due_date < current_date) AS overdue_n,
      (SELECT coalesce(sum(l.quantity * l.unit_price), 0) FROM invoices i JOIN invoice_lines l ON l.invoice_id = i.id
         WHERE i.status = 'sent' AND i.due_date < current_date) AS overdue_total,
      (SELECT count(*)::int FROM payments WHERE status = 'scheduled' AND scheduled_for <= current_date + 7) AS upcoming_n,
      (SELECT coalesce(sum(amount), 0) FROM payments WHERE status = 'scheduled' AND scheduled_for <= current_date + 7) AS upcoming_total,
      (SELECT count(*)::int FROM transactions WHERE status = 'failed' AND occurred_at >= now() - interval '30 days') AS failed_n
  `);
  if (!s) return [];

  const insights: Insight[] = [];
  const money = (n: number) => `{{${n}}}`; // placeholder the client swaps for formatted currency

  if (s.exp_prev > 0) {
    const change = ((s.exp_now - s.exp_prev) / s.exp_prev) * 100;
    insights.push({
      title: change > 0 ? `Spending is up ${change.toFixed(0)}%` : `Spending is down ${Math.abs(change).toFixed(0)}%`,
      detail: `You've spent ${money(s.exp_now)} so far this month vs ${money(s.exp_prev)} by this point last month.`,
      tone: change > 10 ? "negative" : change < 0 ? "positive" : "neutral",
      href: "/analytics",
    });
  }
  if (s.top_cat && s.exp_now > 0) {
    insights.push({
      title: `${s.top_cat} is your biggest expense`,
      detail: `${money(s.top_cat_total)} this month, ${((s.top_cat_total / s.exp_now) * 100).toFixed(0)}% of all spending.`,
      tone: "neutral",
      href: `/transactions?category=${encodeURIComponent(s.top_cat)}`,
    });
  }
  if (s.inc_now > 0) {
    const rate = ((s.inc_now - s.exp_now) / s.inc_now) * 100;
    insights.push({
      title: `Savings rate: ${rate.toFixed(0)}%`,
      detail: rate >= 20 ? "You're keeping a healthy share of income this month." : "Less than 20% of this month's income is being kept. Review recurring costs.",
      tone: rate >= 20 ? "positive" : "negative",
      href: "/analytics",
    });
  }
  if (s.overdue_n > 0) {
    insights.push({
      title: `${s.overdue_n} overdue invoice${s.overdue_n > 1 ? "s" : ""}`,
      detail: `${money(s.overdue_total)} is past due. Send reminders or mark them paid.`,
      tone: "negative",
      href: "/invoices?status=sent",
    });
  }
  if (s.upcoming_n > 0) {
    insights.push({
      title: `${s.upcoming_n} payment${s.upcoming_n > 1 ? "s" : ""} due this week`,
      detail: `${money(s.upcoming_total)} is scheduled to go out in the next 7 days.`,
      tone: "neutral",
      href: "/payments",
    });
  }
  if (s.failed_n > 0) {
    insights.push({
      title: `${s.failed_n} failed transaction${s.failed_n > 1 ? "s" : ""}`,
      detail: "In the last 30 days. Check the details and retry where needed.",
      tone: "negative",
      href: "/transactions?status=failed",
    });
  }
  return insights;
}
