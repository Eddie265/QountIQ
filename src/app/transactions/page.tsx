import { mockTransactions } from "@/data/mockData";
import { formatCurrency } from "@/lib/format";

export default function TransactionsPage() {
  const totals = mockTransactions.reduce(
    (acc, txn) => {
      acc[txn.type] += txn.amount;
      return acc;
    },
    { income: 0, expense: 0, transfer: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Income</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.income)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Recognized during the last 7 days
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Expenses</p>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(totals.expense)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Includes payroll, vendors, and SaaS
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Transfers</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.transfer)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Cash moved between internal accounts
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Ledger activity</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Synced automatically from banking and ERP connections
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary">Export</button>
            <button className="btn-primary">Add transaction</button>
          </div>
        </div>
        <div className="overflow-x-auto table-container">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[var(--text-muted)] border-b border-[var(--border-color)]">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Category</th>
                <th className="py-2">Description</th>
                <th className="py-2">Account</th>
                <th className="py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--border-color)]">
              {mockTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="py-3 text-[var(--text-muted)]">{txn.date}</td>
                  <td className="py-3 capitalize">{txn.type}</td>
                  <td className="py-3">{txn.category}</td>
                  <td className="py-3 font-medium">{txn.description}</td>
                  <td className="py-3">{txn.account}</td>
                  <td className="py-3 font-semibold">
                    {formatCurrency(txn.amount, txn.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



