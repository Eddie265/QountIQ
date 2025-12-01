import { ProgressBar } from "@/components/ProgressBar";
import { mockCardTransactions, mockCards } from "@/data/mockData";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function CardsPage() {
  const totalLimit = mockCards.reduce((sum, card) => sum + card.limit, 0);
  const totalSpend = mockCards.reduce((sum, card) => sum + card.currentSpend, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Total limit</p>
          <p className="text-2xl font-bold">{formatCurrency(totalLimit)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Across all active and inactive cards
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Current spend</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatPercent((totalSpend / totalLimit) * 100)} utilization
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Active cards</p>
          <p className="text-2xl font-bold">
            {mockCards.filter((card) => card.status === "active").length}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Spend controls sync every 15 minutes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {mockCards.map((card) => (
            <div key={card.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {card.holder}
                  </p>
                  <p className="text-lg font-semibold">
                    •••• {card.lastFour} ·{" "}
                    <span className="capitalize">{card.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--text-muted)]">Spend</p>
                  <p className="font-semibold">
                    {formatCurrency(card.currentSpend)} /{" "}
                    {formatCurrency(card.limit)}
                  </p>
                </div>
              </div>
              <ProgressBar
                value={card.currentSpend}
                max={card.limit}
                showPercentage={false}
              />
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {formatPercent((card.currentSpend / card.limit) * 100)} of limit
                consumed
              </p>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Latest card activity</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Transactions sync every hour
              </p>
            </div>
            <button className="btn-secondary text-sm px-3 py-1">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {mockCardTransactions.map((activity) => {
              const card = mockCards.find((c) => c.id === activity.cardId);
              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border border-[var(--border-color)] rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{activity.merchant}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {activity.category} · {activity.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(activity.amount)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {card?.holder}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



