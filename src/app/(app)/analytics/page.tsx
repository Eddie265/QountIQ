import Link from "next/link";
import { CashflowChart, CategoryDoughnut, EarningsChart } from "@/components/Charts";
import { EmptyState } from "@/components/ui";
import { formatCurrency, formatPercent, initials } from "@/lib/format";
import { getExpenseByCategory, getMonthlyTotals, getProfile, listCustomers } from "@/lib/queries";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const [profile, monthly, categories, customers] = await Promise.all([
    getProfile(),
    getMonthlyTotals(12),
    getExpenseByCategory(365),
    listCustomers(),
  ]);
  const cur = profile.currency;
  const income = monthly.reduce((s, m) => s + m.income, 0);
  const expense = monthly.reduce((s, m) => s + m.expense, 0);
  const net = income - expense;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;
  const best = monthly.reduce((b, m) => (m.income - m.expense > b.income - b.expense ? m : b), monthly[0]);
  const topCustomers = [...customers].sort((a, b) => b.revenue - a.revenue).filter((c) => c.revenue > 0).slice(0, 5);
  const bestLabel = best
    ? new Date(Number(best.month.slice(0, 4)), Number(best.month.slice(5)) - 1).toLocaleString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted">Completed transactions over the last 12 months.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Income" value={formatCurrency(income, cur, { cents: false })} />
        <Kpi label="Expenses" value={formatCurrency(expense, cur, { cents: false })} />
        <Kpi label="Net cash flow" value={formatCurrency(net, cur, { cents: false })} tone={net >= 0 ? "text-success" : "text-danger"} />
        <Kpi label="Savings rate" value={formatPercent(savingsRate)} hint={`Best month: ${bestLabel}`} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 text-base font-semibold">Income vs expenses</h2>
          <div className="h-64">
            <EarningsChart data={monthly} currency={cur} />
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 text-base font-semibold">Net cash flow</h2>
          <div className="h-64">
            <CashflowChart data={monthly} currency={cur} />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 text-base font-semibold">Spending by category</h2>
          {categories.length ? <CategoryDoughnut data={categories} currency={cur} /> : <EmptyState title="No expenses recorded" />}
        </section>
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Top customers</h2>
            <Link href="/customers" className="text-xs font-medium text-primary hover:underline">All customers</Link>
          </div>
          {topCustomers.length === 0 ? (
            <EmptyState title="No customer revenue yet" />
          ) : (
            <ul className="space-y-3">
              {topCustomers.map((c) => {
                const share = income > 0 ? (c.revenue / topCustomers[0].revenue) * 100 : 0;
                return (
                  <li key={c.id} className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {initials(c.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{c.name}</span>
                        <span className="tabular-nums">{formatCurrency(c.revenue, cur, { cents: false })}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-primary-soft">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, tone = "" }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="panel p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
