"use client";

import { useEffect, useMemo, useState } from "react";
import type { Account, Invoice, JournalEntry } from "@/types";

export default function ReportsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  useEffect(() => {
    (async () => {
      const [a, i, j] = await Promise.all([
        fetch("/api/accounts", { cache: "no-store" }),
        fetch("/api/invoices", { cache: "no-store" }),
        fetch("/api/journal", { cache: "no-store" }),
      ]);
      const [acc, inv, jr] = await Promise.all([a.json(), i.json(), j.json()]);
      setAccounts(acc);
      setInvoices(inv);
      setJournals(jr);
    })();
  }, []);

  const salesIncome = useMemo(() => {
    // Sum invoice lines (acts as revenue)
    return invoices.reduce((sum, inv) => {
      return (
        sum + inv.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
      );
    }, 0);
  }, [invoices]);

  const balances = useMemo(() => {
    const map = new Map<string, number>();
    for (const acc of accounts) map.set(acc.id, 0);
    for (const je of journals) {
      for (const l of je.lines) {
        const prev = map.get(l.accountId) ?? 0;
        map.set(l.accountId, prev + (l.debit || 0) - (l.credit || 0));
      }
    }
    return map;
  }, [accounts, journals]);

  const totals = useMemo(() => {
    let assets = 0, liabilities = 0, equity = 0, income = salesIncome, expense = 0;
    for (const acc of accounts) {
      const bal = balances.get(acc.id) || 0;
      if (acc.type === "asset") assets += bal;
      if (acc.type === "liability") liabilities += -bal; // credit balance
      if (acc.type === "equity") equity += -bal; // credit balance
      if (acc.type === "income") income += -bal; // credit grows income
      if (acc.type === "expense") expense += bal;
    }
    const netIncome = income - expense;
    const bsEquity = equity + netIncome;
    return { assets, liabilities, equity: bsEquity, income, expense, netIncome };
  }, [accounts, balances, salesIncome]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Financial Reports</h1>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-[var(--border-color)] rounded-lg px-3 py-2 bg-white">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          <button className="btn-secondary">
            <svg className="w-4 h-4 text-[var(--primary-green)] inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--light-green)] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">Profit & Loss</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[var(--sidebar-bg)] rounded-lg">
              <span className="font-medium text-[var(--foreground)]">Total Income</span>
              <span className="text-lg font-bold text-[var(--primary-green)]">${totals.income.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--sidebar-bg)] rounded-lg">
              <span className="font-medium text-[var(--foreground)]">Total Expenses</span>
              <span className="text-lg font-bold text-red-500">${totals.expense.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[var(--primary-green)] text-white rounded-lg">
              <span className="font-semibold">Net Income</span>
              <span className="text-xl font-bold">${totals.netIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--light-green)] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3-1m-6 2l2 3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">Balance Sheet</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[var(--sidebar-bg)] rounded-lg">
              <span className="font-medium text-[var(--foreground)]">Total Assets</span>
              <span className="text-lg font-bold text-[var(--primary-green)]">${totals.assets.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--sidebar-bg)] rounded-lg">
              <span className="font-medium text-[var(--foreground)]">Total Liabilities</span>
              <span className="text-lg font-bold text-orange-500">${totals.liabilities.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--sidebar-bg)] rounded-lg">
              <span className="font-medium text-[var(--foreground)]">Total Equity</span>
              <span className="text-lg font-bold text-blue-500">${totals.equity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[var(--dark-green)] text-white rounded-lg">
              <span className="font-semibold">Total Liabilities + Equity</span>
              <span className="text-xl font-bold">${(totals.liabilities + totals.equity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h4 className="font-semibold text-[var(--foreground)]">Cash Flow</h4>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)] mb-2">${totals.assets.toFixed(2)}</div>
          <div className="text-sm text-[var(--text-muted)]">Available cash</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-[var(--foreground)]">Profit Margin</h4>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {totals.income > 0 ? ((totals.netIncome / totals.income) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-[var(--text-muted)]">Net profit margin</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="font-semibold text-[var(--foreground)]">Growth Rate</h4>
          </div>
          <div className="text-2xl font-bold text-[var(--primary-green)] mb-2">+12.5%</div>
          <div className="text-sm text-[var(--text-muted)]">Month over month</div>
        </div>
      </div>
    </div>
  );
}


