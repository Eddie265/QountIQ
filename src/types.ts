export type UUID = string;

export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense";

export interface Account {
  id: UUID;
  code: string;
  name: string;
  type: AccountType;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  accountId: UUID; // income account
}

export interface Invoice {
  id: UUID;
  number: string;
  customer: string;
  issueDate: string; // ISO
  dueDate: string; // ISO
  currency: string;
  status: "draft" | "sent" | "paid";
  lines: InvoiceLine[];
}

export interface JournalLine {
  accountId: UUID;
  debit: number; // positive
  credit: number; // positive
  description?: string;
}

export interface JournalEntry {
  id: UUID;
  date: string; // ISO
  memo?: string;
  lines: JournalLine[];
}



