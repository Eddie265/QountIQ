export function formatCurrency(value: number, currency = "USD", opts: { compact?: boolean; cents?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: opts.compact ? "compact" : "standard",
    minimumFractionDigits: opts.cents === false ? 0 : opts.compact ? 0 : 2,
    maximumFractionDigits: opts.cents === false ? 0 : 2,
  }).format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

/** Accepts a Date or an ISO / YYYY-MM-DD string. Date-only strings are treated as calendar dates. */
export function formatDate(value: Date | string) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return dateFmt.format(new Date(y, m - 1, d));
  }
  return dateFmt.format(new Date(value));
}

export function formatTime(value: Date | string) {
  return timeFmt.format(new Date(value));
}

export function formatRelative(value: Date | string, now = Date.now()) {
  const diff = Math.round((now - new Date(value).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return formatTime(value);
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(value);
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
