import { mockInvestmentHoldings } from "@/data/mockData";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function InvestmentsPage() {
  const totalValue = mockInvestmentHoldings.reduce(
    (sum, holding) => sum + holding.value,
    0
  );
  const weightedChange =
    mockInvestmentHoldings.reduce(
      (sum, holding) => sum + holding.value * holding.change,
      0
    ) / totalValue;

  const topMover = [...mockInvestmentHoldings].sort(
    (a, b) => b.change - a.change
  )[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Portfolio value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Mark-to-market as of today
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Change (30d)</p>
          <p
            className={`text-2xl font-bold ${
              weightedChange >= 0 ? "text-[var(--primary-green)]" : "text-red-500"
            }`}
          >
            {formatPercent(weightedChange)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Weighted by position size
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Top mover</p>
          <p className="text-lg font-semibold">{topMover.name}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {formatPercent(topMover.change)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Holdings</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Balances synced from custodial accounts
              </p>
            </div>
            <button className="btn-secondary text-sm px-3 py-1">
              Download statement
            </button>
          </div>
          <div className="overflow-x-auto table-container">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--text-muted)] border-b border-[var(--border-color)]">
                  <th className="py-2">Holding</th>
                  <th className="py-2">Asset class</th>
                  <th className="py-2">Allocation</th>
                  <th className="py-2">Value</th>
                  <th className="py-2">Change (30d)</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[var(--border-color)]">
                {mockInvestmentHoldings.map((holding) => (
                  <tr key={holding.id}>
                    <td className="py-3 font-medium">{holding.name}</td>
                    <td className="py-3">{holding.assetClass}</td>
                    <td className="py-3">{formatPercent(holding.allocation)}</td>
                    <td className="py-3">{formatCurrency(holding.value)}</td>
                    <td
                      className={`py-3 font-semibold ${
                        holding.change >= 0 ? "text-[var(--primary-green)]" : "text-red-500"
                      }`}
                    >
                      {formatPercent(holding.change)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <h2 className="font-semibold">Allocation</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Targets monitored daily
            </p>
          </div>
          <div className="space-y-3">
            {mockInvestmentHoldings.map((holding) => (
              <div key={holding.id}>
                <div className="flex items-center justify-between text-sm">
                  <span>{holding.assetClass}</span>
                  <span className="font-medium">
                    {formatPercent(holding.allocation)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-[var(--primary-green)] h-2 rounded-full"
                    style={{ width: `${holding.allocation}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



