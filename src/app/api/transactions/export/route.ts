import { getUser } from "@/lib/auth/server";
import { listTransactions } from "@/lib/queries";
import { parseTransactionFilters } from "@/lib/filters";

const csvCell = (v: unknown) => {
  const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  // Quote everything and neutralize spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  if (!(await getUser())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const { rows } = await listTransactions({ ...parseTransactionFilters(params), limit: 10000, offset: 0 });
  const header = ["Date", "Title", "Category", "Type", "Amount", "Status", "Customer", "Card", "Note"];
  const lines = rows.map((t) =>
    [t.occurred_at, t.title, t.category, t.type, t.amount.toFixed(2), t.status, t.customer_name, t.card_last4, t.note]
      .map(csvCell)
      .join(",")
  );
  return new Response([header.join(","), ...lines].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
