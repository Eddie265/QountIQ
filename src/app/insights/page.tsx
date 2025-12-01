import { mockInsights } from "@/data/mockData";
import { formatCurrency, formatPercent } from "@/lib/format";

const metrics = [
  {
    label: "Cash runway",
    value: "18.2 months",
    helper: "Assumes current burn",
  },
  {
    label: "Gross margin",
    value: formatPercent(72.5),
    helper: "Trailing three months",
  },
  {
    label: "ARR",
    value: formatCurrency(8_400_000),
    helper: "+14% QoQ",
  },
];

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="card">
            <p className="text-sm text-[var(--text-muted)] mb-1">
              {metric.label}
            </p>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {metric.helper}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Automated insights</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Generated from ledgers, billing, and treasury data
            </p>
          </div>
          <button className="btn-secondary text-sm px-3 py-1">
            Subscribe to weekly email
          </button>
        </div>
        <div className="space-y-4">
          {mockInsights.map((insight) => (
            <div
              key={insight.id}
              className="border border-[var(--border-color)] rounded-lg px-4 py-3 flex items-start gap-4"
            >
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  insight.impact === "positive"
                    ? "bg-[var(--sidebar-active)] text-[var(--primary-green)]"
                    : insight.impact === "negative"
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {insight.impact}
              </span>
              <div>
                <p className="font-semibold">{insight.title}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {insight.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



