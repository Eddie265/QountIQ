import { ProgressBar } from "@/components/ProgressBar";
import { mockSavingsContributions, mockSavingsGoals } from "@/data/mockData";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function SavingsPage() {
  const totalTarget = mockSavingsGoals.reduce((sum, goal) => sum + goal.target, 0);
  const totalBalance = mockSavingsGoals.reduce(
    (sum, goal) => sum + goal.balance,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Total target</p>
          <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Funding commitments across every reserve
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Current balance</p>
          <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {formatPercent((totalBalance / totalTarget) * 100)} of target met
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--text-muted)] mb-1">Open goals</p>
          <p className="text-2xl font-bold">{mockSavingsGoals.length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Auto-funding rules evaluated nightly
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {mockSavingsGoals.map((goal) => (
            <div key={goal.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">
                    Due {goal.dueDate}
                  </p>
                  <h2 className="text-lg font-semibold">{goal.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--text-muted)]">Balance</p>
                  <p className="font-semibold">
                    {formatCurrency(goal.balance)} /{" "}
                    {formatCurrency(goal.target)}
                  </p>
                </div>
              </div>
              <ProgressBar
                value={goal.balance}
                max={goal.target}
                showPercentage={false}
              />
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {formatPercent((goal.balance / goal.target) * 100)} funded
              </p>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Recent contributions</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Transfers initiated automatically
              </p>
            </div>
            <button className="btn-secondary text-sm px-3 py-1">Fund</button>
          </div>
          <div className="space-y-3">
            {mockSavingsContributions.map((entry) => {
              const goal = mockSavingsGoals.find((g) => g.id === entry.goalId);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between border border-[var(--border-color)] rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{goal?.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {entry.source}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(entry.amount)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {entry.date}
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



