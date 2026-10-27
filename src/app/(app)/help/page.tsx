import { SupportForm } from "./SupportForm";

export const metadata = { title: "Help & Support" };

const faqs = [
  ["How do totals on the dashboard work?", "Income, expense and savings count completed transactions from the start of this month. The change compares them with the same stretch of last month."],
  ["What happens when I mark an invoice as paid?", "CountIQ records an income transaction for the invoice total, linked to the customer, so it shows up in your earnings and analytics."],
  ["How is the daily limit enforced?", "Card transfers and card payments are checked against the card's balance, its frozen status and today's spend. Anything over the limit is declined."],
  ["Can I export my data?", "Yes. On the Transactions page, apply any filters and choose Export CSV."],
  ["Does changing the currency convert amounts?", "No. The currency setting only changes how amounts are displayed."],
];

export default function HelpPage() {
  return (
    <div className="grid max-w-5xl gap-5 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Help & Support</h1>
          <p className="text-sm text-muted">Answers to common questions, or send us a message.</p>
        </div>
        <section className="panel divide-y divide-[var(--border)]">
          {faqs.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {q}
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </details>
          ))}
        </section>
      </div>
      <section className="panel h-fit p-5 lg:mt-14">
        <h2 className="text-base font-semibold">Contact support</h2>
        <p className="mb-4 mt-1 text-sm text-muted">We&apos;ll confirm in your inbox and reply within one business day.</p>
        <SupportForm />
      </section>
    </div>
  );
}
