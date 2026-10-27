import { getProfile, listCustomers } from "@/lib/queries";
import { CustomersView } from "./CustomersView";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; new?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const [profile, customers] = await Promise.all([getProfile(), listCustomers(q)]);
  return <CustomersView customers={customers} currency={profile.currency} q={q ?? ""} startOpen={sp.new === "1"} />;
}
