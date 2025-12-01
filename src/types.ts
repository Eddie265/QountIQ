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

export type PaymentStatus = "scheduled" | "approved" | "processing" | "failed";

export interface Payment {
  id: UUID;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  method: "ACH" | "Wire" | "Check" | "Card";
  status: PaymentStatus;
  reference: string;
}

export type FinanceTransactionType = "income" | "expense" | "transfer";

export interface FinanceTransaction {
  id: UUID;
  type: FinanceTransactionType;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  account: string;
}

export interface CorporateCard {
  id: UUID;
  holder: string;
  lastFour: string;
  limit: number;
  currentSpend: number;
  status: "active" | "inactive";
}

export interface CardTransaction {
  id: UUID;
  cardId: UUID;
  merchant: string;
  amount: number;
  date: string;
  category: string;
}

export interface SavingsGoal {
  id: UUID;
  name: string;
  target: number;
  balance: number;
  dueDate: string;
}

export interface SavingsContribution {
  id: UUID;
  goalId: UUID;
  source: string;
  amount: number;
  date: string;
}

export interface InvestmentHolding {
  id: UUID;
  name: string;
  assetClass: string;
  allocation: number;
  value: number;
  change: number;
}

export interface PromoOffer {
  id: UUID;
  title: string;
  description: string;
  partner: string;
  expiresOn: string;
  ctaLabel: string;
}

export interface InsightItem {
  id: UUID;
  title: string;
  detail: string;
  impact: "positive" | "neutral" | "negative";
}

export interface InboxMessage {
  id: UUID;
  subject: string;
  preview: string;
  date: string;
  status: "new" | "read" | "urgent";
}

export interface PayrollEmployee {
  id: UUID;
  name: string;
  role: string;
  salary: number;
  paySchedule: "weekly" | "bi-weekly" | "monthly";
  status: "active" | "on_leave";
}

export interface PayrollRun {
  id: UUID;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  netPay: number;
  status: "processing" | "completed" | "scheduled";
}




