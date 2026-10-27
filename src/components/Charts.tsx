"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useSyncExternalStore } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { formatCurrency } from "@/lib/format";
import type { CategoryTotal, MonthlyTotals } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend);

/* Re-render charts when the theme changes, since canvas colors can't use CSS variables. */
function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    observer.disconnect();
    mq.removeEventListener("change", cb);
  };
}
function themeKey() {
  const explicit = document.documentElement.dataset.theme;
  return explicit ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function useColors() {
  const key = useSyncExternalStore(subscribe, themeKey, () => "light");
  const css = (name: string, fallback: string) =>
    typeof window === "undefined" ? fallback : getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  return {
    key,
    primary: css("--primary", "#5b67f1"),
    muted: css("--bar-muted", "#e6e8ec"),
    grid: css("--border", "#e7e9ee"),
    text: css("--text-muted", "#6b7280"),
    surface: css("--surface", "#ffffff"),
    ink: css("--text", "#16181d"),
    success: css("--success", "#16a34a"),
    danger: css("--danger", "#dc2626"),
  };
}

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short" });
};

function baseOptions(c: ReturnType<typeof useColors>, currency: string) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.surface,
        titleColor: c.ink,
        bodyColor: c.ink,
        borderColor: c.grid,
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => ` ${ctx.dataset.label}: ${formatCurrency(Number(ctx.parsed.y), currency)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: c.text, font: { size: 11 } } },
      y: {
        border: { display: false },
        grid: { color: c.grid },
        ticks: {
          color: c.text,
          font: { size: 11 },
          maxTicksLimit: 6,
          callback: (v: string | number) => formatCurrency(Number(v), currency, { compact: true }),
        },
      },
    },
  };
}

export function EarningsChart({ data, currency }: { data: MonthlyTotals[]; currency: string }) {
  const c = useColors();
  return (
    <Bar
      key={c.key}
      aria-label="Monthly income and expenses"
      role="img"
      data={{
        labels: data.map((d) => monthLabel(d.month)),
        datasets: [
          { label: "Income", data: data.map((d) => d.income), backgroundColor: c.primary, borderRadius: 4, maxBarThickness: 14 },
          { label: "Expense", data: data.map((d) => d.expense), backgroundColor: c.muted, borderRadius: 4, maxBarThickness: 14 },
        ],
      }}
      options={{ ...baseOptions(c, currency), datasets: { bar: { categoryPercentage: 0.6, barPercentage: 0.9 } } }}
    />
  );
}

export function CashflowChart({ data, currency }: { data: MonthlyTotals[]; currency: string }) {
  const c = useColors();
  return (
    <Line
      key={c.key}
      aria-label="Net cash flow per month"
      role="img"
      data={{
        labels: data.map((d) => monthLabel(d.month)),
        datasets: [
          {
            label: "Net",
            data: data.map((d) => d.income - d.expense),
            borderColor: c.primary,
            backgroundColor: `${c.primary}22`,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: c.primary,
          },
        ],
      }}
      options={baseOptions(c, currency)}
    />
  );
}

/** Categories get shades of the primary hue, largest first, plus a neutral "Other". */
export function CategoryDoughnut({ data, currency }: { data: CategoryTotal[]; currency: string }) {
  const c = useColors();
  const top = data.slice(0, 5);
  const other = data.slice(5).reduce((s, d) => s + d.total, 0);
  const rows = other > 0 ? [...top, { category: "Other", total: other }] : top;
  const alphas = ["ff", "cc", "99", "70", "4d"];
  const colors = rows.map((r, i) => (r.category === "Other" ? c.muted : `${c.primary}${alphas[i] ?? "40"}`));
  const total = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative size-44 shrink-0">
        <Doughnut
          key={c.key}
          aria-label="Expenses by category"
          role="img"
          data={{ labels: rows.map((r) => r.category), datasets: [{ data: rows.map((r) => r.total), backgroundColor: colors, borderColor: c.surface, borderWidth: 2 }] }}
          options={{
            cutout: "70%",
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(Number(ctx.parsed), currency)}` } },
            },
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted">Total</span>
          <span className="text-sm font-semibold">{formatCurrency(total, currency, { compact: true })}</span>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {rows.map((r, i) => (
          <li key={r.category} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: colors[i] }} />
            <span className="flex-1 truncate">{r.category}</span>
            <span className="tabular-nums text-muted">{total ? ((r.total / total) * 100).toFixed(0) : 0}%</span>
            <span className="w-24 text-right font-medium tabular-nums">{formatCurrency(r.total, currency, { cents: false })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
