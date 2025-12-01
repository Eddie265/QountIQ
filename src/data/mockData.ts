import type {
  CardTransaction,
  CorporateCard,
  FinanceTransaction,
  InboxMessage,
  InsightItem,
  InvestmentHolding,
  Payment,
  PayrollEmployee,
  PayrollRun,
  PromoOffer,
  SavingsContribution,
  SavingsGoal,
} from "@/types";

export const mockPayments: Payment[] = [
  {
    id: "pay-1001",
    vendor: "Acme Supplies",
    amount: 4200,
    currency: "USD",
    date: "2025-09-28",
    method: "ACH",
    status: "scheduled",
    reference: "AP-1043",
  },
  {
    id: "pay-1002",
    vendor: "Global Freight",
    amount: 12850,
    currency: "USD",
    date: "2025-09-27",
    method: "Wire",
    status: "approved",
    reference: "AP-1042",
  },
  {
    id: "pay-1003",
    vendor: "TeamWorks Studio",
    amount: 7200,
    currency: "USD",
    date: "2025-09-26",
    method: "Card",
    status: "processing",
    reference: "AP-1041",
  },
  {
    id: "pay-1004",
    vendor: "Metro Utilities",
    amount: 1100,
    currency: "USD",
    date: "2025-09-25",
    method: "ACH",
    status: "failed",
    reference: "AP-1040",
  },
];

export const mockTransactions: FinanceTransaction[] = [
  {
    id: "txn-2101",
    type: "income",
    category: "Subscriptions",
    description: "Enterprise plan renewal",
    amount: 18500,
    currency: "USD",
    date: "2025-09-29",
    account: "Stripe",
  },
  {
    id: "txn-2102",
    type: "expense",
    category: "Payroll",
    description: "Bi-weekly payroll",
    amount: 46200,
    currency: "USD",
    date: "2025-09-28",
    account: "Operating",
  },
  {
    id: "txn-2103",
    type: "transfer",
    category: "Reserve",
    description: "Reserve funding",
    amount: 15000,
    currency: "USD",
    date: "2025-09-27",
    account: "Savings",
  },
  {
    id: "txn-2104",
    type: "expense",
    category: "Vendors",
    description: "Marketing agency retainer",
    amount: 9800,
    currency: "USD",
    date: "2025-09-26",
    account: "Operating",
  },
];

export const mockCards: CorporateCard[] = [
  {
    id: "card-1",
    holder: "Sofia Miles",
    lastFour: "4821",
    limit: 25000,
    currentSpend: 16350,
    status: "active",
  },
  {
    id: "card-2",
    holder: "Daniel Wright",
    lastFour: "7134",
    limit: 18000,
    currentSpend: 9400,
    status: "active",
  },
  {
    id: "card-3",
    holder: "Priya Patel",
    lastFour: "0099",
    limit: 12000,
    currentSpend: 4500,
    status: "inactive",
  },
];

export const mockCardTransactions: CardTransaction[] = [
  {
    id: "card-tx-1",
    cardId: "card-1",
    merchant: "Figma",
    amount: 45,
    date: "2025-09-28",
    category: "Software",
  },
  {
    id: "card-tx-2",
    cardId: "card-2",
    merchant: "United Airlines",
    amount: 620,
    date: "2025-09-27",
    category: "Travel",
  },
  {
    id: "card-tx-3",
    cardId: "card-1",
    merchant: "AWS",
    amount: 3200,
    date: "2025-09-27",
    category: "Infrastructure",
  },
  {
    id: "card-tx-4",
    cardId: "card-3",
    merchant: "Coursera",
    amount: 399,
    date: "2025-09-26",
    category: "Education",
  },
];

export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "goal-1",
    name: "Emergency Fund",
    target: 50000,
    balance: 38200,
    dueDate: "2026-01-15",
  },
  {
    id: "goal-2",
    name: "Tax Reserve",
    target: 90000,
    balance: 71500,
    dueDate: "2025-12-31",
  },
  {
    id: "goal-3",
    name: "Product R&D",
    target: 120000,
    balance: 48000,
    dueDate: "2026-06-30",
  },
];

export const mockSavingsContributions: SavingsContribution[] = [
  {
    id: "contrib-1",
    goalId: "goal-1",
    source: "Operating → Emergency",
    amount: 3500,
    date: "2025-09-25",
  },
  {
    id: "contrib-2",
    goalId: "goal-2",
    source: "Operating → Tax reserve",
    amount: 5000,
    date: "2025-09-18",
  },
  {
    id: "contrib-3",
    goalId: "goal-3",
    source: "Operating → R&D",
    amount: 8000,
    date: "2025-09-10",
  },
];

export const mockInvestmentHoldings: InvestmentHolding[] = [
  {
    id: "inv-1",
    name: "U.S. Equity ETF",
    assetClass: "Equities",
    allocation: 45,
    value: 340000,
    change: 3.2,
  },
  {
    id: "inv-2",
    name: "International ETF",
    assetClass: "Equities",
    allocation: 20,
    value: 150000,
    change: 1.4,
  },
  {
    id: "inv-3",
    name: "Corporate Bonds",
    assetClass: "Fixed Income",
    allocation: 25,
    value: 200000,
    change: -0.3,
  },
  {
    id: "inv-4",
    name: "Money Market",
    assetClass: "Cash",
    allocation: 10,
    value: 85000,
    change: 0.1,
  },
];

export const mockPromos: PromoOffer[] = [
  {
    id: "promo-1",
    title: "20% off AWS for 6 months",
    description: "Eligible for organizations spending above $5k/month.",
    partner: "Amazon Web Services",
    expiresOn: "2025-11-05",
    ctaLabel: "Activate credit",
  },
  {
    id: "promo-2",
    title: "Preferred FX rates",
    description: "0.35% FX fees for all wire transfers in Q4.",
    partner: "GlobalBank",
    expiresOn: "2025-12-20",
    ctaLabel: "Upgrade account",
  },
  {
    id: "promo-3",
    title: "Free HR audits",
    description: "Complimentary compliance review for teams < 200 employees.",
    partner: "PeopleFirst",
    expiresOn: "2025-10-31",
    ctaLabel: "Book session",
  },
];

export const mockInsights: InsightItem[] = [
  {
    id: "insight-1",
    title: "Net income trending +12%",
    detail: "Revenue growth outpacing OpEx during the last 6 weeks.",
    impact: "positive",
  },
  {
    id: "insight-2",
    title: "Vendor concentration risk",
    detail: "32% of expenses tied to two strategic suppliers.",
    impact: "negative",
  },
  {
    id: "insight-3",
    title: "Cash runway at 18 months",
    detail: "Assumes steady burn and committed ARR renewals.",
    impact: "neutral",
  },
];

export const mockInboxMessages: InboxMessage[] = [
  {
    id: "msg-1",
    subject: "Monthly financial package ready",
    preview: "Download the September close package with commentary.",
    date: "2025-09-29",
    status: "new",
  },
  {
    id: "msg-2",
    subject: "ACH approval required",
    preview: "Review payment batch 23-091 for final approval.",
    date: "2025-09-28",
    status: "urgent",
  },
  {
    id: "msg-3",
    subject: "Expense policy update",
    preview: "New spending limits for travel and client entertainment.",
    date: "2025-09-27",
    status: "read",
  },
];

export const mockPayrollEmployees: PayrollEmployee[] = [
  {
    id: "emp-1",
    name: "Leah Robinson",
    role: "VP Finance",
    salary: 185000,
    paySchedule: "bi-weekly",
    status: "active",
  },
  {
    id: "emp-2",
    name: "Carlos Diaz",
    role: "Engineering Lead",
    salary: 165000,
    paySchedule: "bi-weekly",
    status: "active",
  },
  {
    id: "emp-3",
    name: "Mina Abdel",
    role: "People Ops",
    salary: 118000,
    paySchedule: "monthly",
    status: "on_leave",
  },
  {
    id: "emp-4",
    name: "Noah Chen",
    role: "Product Design",
    salary: 135000,
    paySchedule: "bi-weekly",
    status: "active",
  },
];

export const mockPayrollRuns: PayrollRun[] = [
  {
    id: "pr-1",
    periodStart: "2025-09-15",
    periodEnd: "2025-09-28",
    payDate: "2025-10-02",
    netPay: 47200,
    status: "scheduled",
  },
  {
    id: "pr-2",
    periodStart: "2025-09-01",
    periodEnd: "2025-09-14",
    payDate: "2025-09-18",
    netPay: 46550,
    status: "completed",
  },
  {
    id: "pr-3",
    periodStart: "2025-08-18",
    periodEnd: "2025-08-31",
    payDate: "2025-09-03",
    netPay: 45800,
    status: "completed",
  },
];


