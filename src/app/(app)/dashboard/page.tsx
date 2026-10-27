import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleDollarSign, Landmark, ListFilter, PiggyBank, Plus, Search } from "lucide-react";
import { BankCard, LimitMeter } from "@/components/BankCard";
import { EarningsChart } from "@/components/Charts";
import { CardActions, NewMenu } from "@/components/forms";
import { LocalDate } from "@/components/LocalDate";
import { TransactionTable } from "@/components/TransactionTable";
import { EmptyState } from "@/components/ui";
import { formatCurrency, formatDate, initials, todayISO } from "@/lib/format";
import {
  getMonthSummary,
  getMonthlyTotals,
  getPrimaryCard,
  getProfile,
  getRecentActivity,
  getSpentToday,
  listCards,
  listCategories,
  listCustomerOptions,
  listTransactions,
} from "@/lib/queries";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ months?: string }> }) {
  const months = (await searchParams).months === "6" ? 6 : 12;
  const [profile, summary, monthly, card, cards, spentToday, activity, recent, customers, categories] = await Promise.all([
    getProfile(),
    getMonthSummary(),
    getMonthlyTotals(months),
    getPrimaryCard(),
    listCards(),
    getSpentToday(),
    getRecentActivity(5),
    listTransactions({ limit: 5 }),
    listCustomerOptions(),
    listCategories(),
  ]);
  const cur = profile.currency;
  const earnings = monthly.reduce((s, m) => s + m.income, 0);
  const spent = card ? (spentToday[card.id] ?? 0) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="btn-secondary pointer-events-none">
            <CalendarDays className="size-4 text-muted" />
            {formatDate(todayISO())}
          </span>
          <NewMenu customers={customers} cards={cards} categories={categories} />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total Income" value={summary.income} change={summary.incomeChange} currency={cur} icon={<CircleDollarSign className="size-4 text-amber-500" />} />
            <StatCard label="Total Expense" value={summary.expense} change={summary.expenseChange} currency={cur} invert icon={<Landmark className="size-4 text-primary" />} />
            <StatCard label="Total Savings" value={summary.savings} change={summary.savingsChange} currency={cur} icon={<PiggyBank className="size-4 text-violet-500" />} />
          </div>

          <section className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-muted">Earnings, last {months} months</h2>
                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{formatCurrency(earnings, cur)}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Income</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--bar-muted)]" />Expense</span>
                <div className="flex rounded-lg border border-line p-0.5">
                  {[6, 12].map((m) => (
                    <Link
                      key={m}
                      href={m === 12 ? "/dashboard" : "/dashboard?months=6"}
                      scroll={false}
                      className={`rounded-md px-2 py-1 ${months === m ? "bg-surface-muted font-medium text-ink" : ""}`}
                    >
                      {m}M
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 h-64">
              <EarningsChart data={monthly} currency={cur} />
            </div>
          </section>

          <section className="panel">
            <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
              <h2 className="text-base font-semibold">Transaction History</h2>
              <div className="flex gap-2">
                <Link href="/transactions" className="icon-btn size-8" aria-label="Search transactions">
                  <Search className="size-4" />
                </Link>
                <Link href="/transactions" className="btn-secondary btn-sm">
                  Filter <ListFilter className="size-3.5" />
                </Link>
              </div>
            </div>
            {recent.rows.length ? (
              <TransactionTable rows={recent.rows} currency={cur} />
            ) : (
              <EmptyState title="No transactions yet" hint="Record your first income or expense with the New button." />
            )}
            <div className="border-t border-line px-5 py-3 text-right">
              <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
                View all transactions
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">My Card</h2>
              <Link href="/cards?new=1" className="btn-secondary btn-sm">
                <Plus className="size-3.5" /> Add card
              </Link>
            </div>
            {card ? (
              <div className="space-y-3">
                <BankCard card={card} currency={cur} />
                <CardActions card={card} customers={customers} compact />
              </div>
            ) : (
              <EmptyState title="No cards yet" action={<Link href="/cards?new=1" className="btn-primary">Add a card</Link>} />
            )}
          </section>

          {card && (
            <section className="panel p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Daily Limit</h2>
                <Link href="/cards" className="text-xs font-medium text-primary hover:underline">Manage</Link>
              </div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-muted">{formatDate(todayISO())}</span>
                <span className="font-medium text-primary">{Math.round((spent / card.daily_limit) * 100)}%</span>
              </div>
              <LimitMeter spent={spent} limit={card.daily_limit} currency={cur} />
            </section>
          )}

          <section className="panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent Activity</h2>
              <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">View all</Link>
            </div>
            {activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No activity yet.</p>
            ) : (
              <ul className="space-y-3.5">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {initials(a.actor)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.actor}</p>
                      <p className="truncate text-xs text-muted">{a.action}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      <LocalDate value={a.created_at} format="relative" />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  currency,
  icon,
  invert,
}: {
  label: string;
  value: number;
  change: number | null;
  currency: string;
  icon: React.ReactNode;
  invert?: boolean; // for expenses, going up is bad
}) {
  const up = (change ?? 0) >= 0;
  const good = invert ? !up : up;
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{formatCurrency(value, currency, { cents: false })}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-faint">vs last month</span>
        {change === null ? (
          <span className="text-faint">new</span>
        ) : (
          <span className={`inline-flex items-center gap-0.5 font-medium ${good ? "text-success" : "text-danger"}`}>
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
