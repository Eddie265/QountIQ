import { getProfile, listCards, listPayments } from "@/lib/queries";
import { PaymentsView } from "./PaymentsView";

export const metadata = { title: "Payments" };

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const sp = await searchParams;
  const [profile, payments, cards] = await Promise.all([getProfile(), listPayments(), listCards()]);
  return <PaymentsView payments={payments} cards={cards} currency={profile.currency} startNew={sp.new === "1"} />;
}
