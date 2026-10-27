import { getProfile, listCustomerOptions, listInvoices, nextInvoiceNumber } from "@/lib/queries";
import { InvoicesView } from "./InvoicesView";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; new?: string; customer?: string; open?: string }>;
}) {
  const sp = await searchParams;
  const [profile, invoices, customers, nextNumber] = await Promise.all([
    getProfile(),
    listInvoices(),
    listCustomerOptions(),
    nextInvoiceNumber(),
  ]);
  return (
    <InvoicesView
      invoices={invoices}
      customers={customers}
      currency={profile.currency}
      company={profile.company}
      nextNumber={nextNumber}
      initialTab={sp.status ?? "all"}
      startNew={sp.new === "1"}
      presetCustomer={sp.customer}
      openId={sp.open}
    />
  );
}
