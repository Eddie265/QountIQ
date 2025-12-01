import type { Account, Invoice, JournalEntry, UUID } from "@/types";

function generateId(): UUID {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

class InMemoryStore {
  accounts: Account[] = [];
  invoices: Invoice[] = [];
  journals: JournalEntry[] = [];

  constructor() {
    // Seed a minimal chart of accounts
    this.accounts = [
      { id: "1000", code: "1000", name: "Cash", type: "asset" },
      { id: "1100", code: "1100", name: "Accounts Receivable", type: "asset" },
      { id: "2000", code: "2000", name: "Accounts Payable", type: "liability" },
      { id: "3000", code: "3000", name: "Owner's Equity", type: "equity" },
      { id: "4000", code: "4000", name: "Sales", type: "income" },
      { id: "5000", code: "5000", name: "Expense", type: "expense" },
    ];
  }

  // Accounts
  listAccounts() {
    return this.accounts;
  }

  // Invoices
  listInvoices() {
    return this.invoices;
  }

  createInvoice(invoice: Omit<Invoice, "id">): Invoice {
    const created: Invoice = { ...invoice, id: generateId() };
    this.invoices.unshift(created);
    return created;
  }

  // Journal Entries
  listJournals() {
    return this.journals;
  }

  createJournal(entry: Omit<JournalEntry, "id">): JournalEntry {
    const created: JournalEntry = { ...entry, id: generateId() };
    this.journals.unshift(created);
    return created;
  }
}

// Singleton store for the server runtime
export const db = new InMemoryStore();



