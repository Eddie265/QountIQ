import { StatusBadge } from "@/components/StatusBadge";
import { mockPayments } from "@/data/mockData";
import { formatCurrency } from "@/lib/format";

export default function PaymentsPage() {
  const totalScheduled = mockPayments.reduce((sum, payment) => {
    return payment.status === "scheduled" ? sum + payment.amount : sum;
  }, 0);

  const approvedLastSeven = mockPayments.reduce((sum, payment) => {
    return payment.status === "approved" ? sum + payment.amount : sum;
  }, 0);

  const failedCount = mockPayments.filter(
    (payment) => payment.status === "failed"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-sm text-[var(--text-muted)] mb-1">
            Scheduled payouts
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(totalScheduled)}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Releasing over the next 5 business days
          </p>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-muted)] mb-1">
            Approved in last 7 days
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(approvedLastSeven)}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            All payments cleared through treasury checks
          </p>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-muted)] mb-1">
            Failed payments
          </div>
          <div className="text-2xl font-bold">{failedCount}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Require follow-up or resubmission
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-[var(--foreground)]">
              Payment queue
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Real-time status across banking rails
            </p>
          </div>
          <button className="btn-primary">New payment</button>
        </div>
        <div className="overflow-x-auto table-container">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[var(--text-muted)] border-b border-[var(--border-color)]">
                <th className="py-2">Vendor</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Date</th>
                <th className="py-2">Method</th>
                <th className="py-2">Reference</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--border-color)]">
              {mockPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="py-3 font-medium">{payment.vendor}</td>
                  <td className="py-3">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="py-3 text-[var(--text-muted)]">
                    {payment.date}
                  </td>
                  <td className="py-3">{payment.method}</td>
                  <td className="py-3">{payment.reference}</td>
                  <td className="py-3">
                    <StatusBadge status={payment.status}>
                      {payment.status}
                    </StatusBadge>
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



