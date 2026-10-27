import type { TransactionFilters } from "@/lib/queries";

const TYPES = ["income", "expense", "transfer"] as const;
const STATUSES = ["completed", "pending", "failed"] as const;
const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Turns untrusted search params into safe transaction filters. */
export function parseTransactionFilters(sp: Record<string, string | string[] | undefined>): TransactionFilters {
  const get = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const type = get("type");
  const status = get("status");
  return {
    q: get("q")?.slice(0, 100),
    type: TYPES.find((t) => t === type),
    status: STATUSES.find((s) => s === status),
    category: get("category")?.slice(0, 60),
    from: isDate(get("from")) ? get("from") : undefined,
    to: isDate(get("to")) ? get("to") : undefined,
  };
}
