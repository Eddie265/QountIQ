import Link from "next/link";
import { Download } from "lucide-react";
import { NewTransactionButton } from "@/components/forms";
import { TransactionTable } from "@/components/TransactionTable";
import { EmptyState } from "@/components/ui";
import { parseTransactionFilters } from "@/lib/filters";
import { getProfile, listCards, listCategories, listCustomerOptions, listTransactions } from "@/lib/queries";

export const metadata = { title: "Transactions" };

const PAGE_SIZE = 20;

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const filters = parseTransactionFilters(sp);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [profile, { rows, total }, categories, customers, cards] = await Promise.all([
    getProfile(),
    listTransactions({ ...filters, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    listCategories(),
    listCustomerOptions(),
    listCards(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, page, ...overrides })) if (v !== undefined && v !== "" && !(k === "page" && v === 1)) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const filtered = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted">{total} {total === 1 ? "transaction" : "transactions"}{filtered && " match your filters"}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/transactions/export${qs({ page: undefined })}`} className="btn-secondary">
            <Download className="size-4" /> Export CSV
          </a>
          <NewTransactionButton customers={customers} cards={cards} categories={categories} />
        </div>
      </div>

      <form className="panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]" role="search">
        <input name="q" defaultValue={filters.q} placeholder="Search title, note, customer…" className="input" aria-label="Search" />
        <select name="type" defaultValue={filters.type ?? ""} className="input" aria-label="Type">
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>
        <select name="status" defaultValue={filters.status ?? ""} className="input" aria-label="Status">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select name="category" defaultValue={filters.category ?? ""} className="input" aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input type="date" name="from" defaultValue={filters.from} className="input" aria-label="From date" />
        <input type="date" name="to" defaultValue={filters.to} className="input" aria-label="To date" />
        <div className="flex gap-2">
          <button className="btn-primary flex-1">Apply</button>
          {filtered && (
            <Link href="/transactions" className="btn-ghost">
              Clear
            </Link>
          )}
        </div>
      </form>

      <section className="panel">
        {rows.length ? (
          <TransactionTable rows={rows} currency={profile.currency} actions />
        ) : (
          <EmptyState
            title={filtered ? "No transactions match these filters" : "No transactions yet"}
            hint={filtered ? "Try widening the date range or clearing filters." : "Add one with the button above."}
          />
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
            <span className="text-muted">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 ? <Link href={`/transactions${qs({ page: page - 1 })}`} className="btn-secondary btn-sm">Previous</Link> : <span className="btn-secondary btn-sm opacity-50">Previous</span>}
              {page < pages ? <Link href={`/transactions${qs({ page: page + 1 })}`} className="btn-secondary btn-sm">Next</Link> : <span className="btn-secondary btn-sm opacity-50">Next</span>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
