export type UUID = string;

export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Profile {
  full_name: string;
  role: string;
  email: string;
  company: string;
  currency: string;
}

export interface Customer {
  id: UUID;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  status: "active" | "inactive";
  created_at: Date;
}

export interface CustomerWithStats extends Customer {
  revenue: number;
  open_invoices: number;
  last_activity: Date | null;
}

export interface Card {
  id: UUID;
  holder: string;
  nickname: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  balance: number;
  daily_limit: number;
  status: "active" | "frozen";
  is_primary: boolean;
}

export interface Transaction {
  id: UUID;
  title: string;
  category: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  note: string | null;
  occurred_at: Date;
  customer_id: UUID | null;
  customer_name: string | null;
  card_id: UUID | null;
  card_last4: string | null;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export interface InvoiceLine {
  id?: UUID;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: UUID;
  number: string;
  customer_id: UUID;
  customer_name: string;
  customer_email: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  paid_at: Date | null;
  total: number;
  lines: InvoiceLine[];
}

export type PaymentStatus = "scheduled" | "completed" | "failed" | "cancelled";
export type PaymentMethod = "ACH" | "Wire" | "Card" | "Check";

export interface Payment {
  id: UUID;
  payee: string;
  amount: number;
  method: PaymentMethod;
  category: string;
  status: PaymentStatus;
  scheduled_for: string;
  reference: string | null;
  card_id: UUID | null;
  card_last4: string | null;
}

export interface Message {
  id: UUID;
  sender: string;
  subject: string;
  body: string;
  is_read: boolean;
  is_starred: boolean;
  created_at: Date;
}

export interface Activity {
  id: UUID;
  actor: string;
  action: string;
  created_at: Date;
}

export interface MonthlyTotals {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

/** Shape returned by every server action that a form can display. */
export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };
