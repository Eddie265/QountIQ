import { getProfile, getSpentToday, listCardTransactions, listCards, listCustomerOptions } from "@/lib/queries";
import { CardsView } from "./CardsView";

export const metadata = { title: "Cards" };

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const sp = await searchParams;
  const [profile, cards, spent, customers, recent] = await Promise.all([
    getProfile(),
    listCards(),
    getSpentToday(),
    listCustomerOptions(),
    listCardTransactions(8),
  ]);
  return (
    <CardsView
      cards={cards}
      spent={spent}
      customers={customers}
      recent={recent}
      currency={profile.currency}
      holder={profile.full_name}
      startNew={sp.new === "1"}
    />
  );
}
