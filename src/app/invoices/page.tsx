"use client";

import { useEffect, useMemo, useState } from "react";
import type { Account, Invoice, InvoiceLine } from "@/types";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const incomeAccounts = useMemo(
    () => accounts.filter((a) => a.type === "income"),
    [accounts]
  );

  const [submitting, setSubmitting] = useState(false);

  const [number, setNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [currency, setCurrency] = useState("USD");
  const [line, setLine] = useState<InvoiceLine>({
    description: "Services",
    quantity: 1,
    unitPrice: 0,
    accountId: "",
  });

  async function refresh() {
    const [invRes, accRes] = await Promise.all([
      fetch("/api/invoices", { cache: "no-store" }),
      fetch("/api/accounts", { cache: "no-store" }),
    ]);
    const [invJson, accJson] = await Promise.all([invRes.json(), accRes.json()]);
    setInvoices(invJson);
    setAccounts(accJson);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!line.accountId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: number || `INV-${Date.now()}`,
          customer,
          issueDate,
          dueDate,
          currency,
          status: "draft",
          lines: [line],
        }),
      });
      if (res.ok) {
        setNumber("");
        setCustomer("");
        setLine({ ...line, unitPrice: 0 });
        await refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const lineAmount = (line.quantity || 0) * (line.unitPrice || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Invoices</h1>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-[var(--border-color)] rounded-lg px-3 py-2 bg-white">
            <option>All Status</option>
            <option>Draft</option>
            <option>Sent</option>
            <option>Paid</option>
          </select>
          <button className="btn-primary">
            + New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Recent Invoices</h3>
              <div className="text-sm text-[var(--text-muted)]">{invoices.length} invoices</div>
            </div>
            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <div className="w-16 h-16 bg-[var(--light-green)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm">No invoices yet</p>
                  <p className="text-xs text-[var(--text-muted)]">Create your first invoice to get started</p>
                </div>
              ) : (
                invoices.map((inv) => {
                  const total = inv.lines.reduce(
                    (sum, l) => sum + l.quantity * l.unitPrice,
                    0
                  );
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-4 border border-[var(--border-color)] rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-[var(--foreground)]">{inv.number}</div>
                          <div className="text-sm text-[var(--text-muted)]">{inv.customer}</div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {inv.issueDate} → {inv.dueDate}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[var(--foreground)]">
                          {inv.currency} {total.toFixed(2)}
                        </div>
                        <div className={`status-badge status-${inv.status}`}>
                          {inv.status}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--primary-green)] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">+</span>
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">Create Invoice</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Invoice Number</label>
                <input 
                  value={number} 
                  onChange={(e)=>setNumber(e.target.value)} 
                  className="input w-full" 
                  placeholder="INV-0001" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Customer</label>
                <input 
                  value={customer} 
                  onChange={(e)=>setCustomer(e.target.value)} 
                  className="input w-full" 
                  placeholder="Acme Inc." 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Issue Date</label>
                  <input 
                    type="date" 
                    value={issueDate} 
                    onChange={(e)=>setIssueDate(e.target.value)} 
                    className="input w-full" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e)=>setDueDate(e.target.value)} 
                    className="input w-full" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Currency</label>
                <input 
                  value={currency} 
                  onChange={(e)=>setCurrency(e.target.value)} 
                  className="input w-full" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              <h4 className="font-medium text-[var(--foreground)] mb-3">Line Item</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Description</label>
                  <input 
                    value={line.description} 
                    onChange={(e)=>setLine({...line, description: e.target.value})} 
                    className="input w-full" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Quantity</label>
                    <input 
                      type="number" 
                      min={0} 
                      step="1" 
                      value={line.quantity} 
                      onChange={(e)=>setLine({...line, quantity: Number(e.target.value)})} 
                      className="input w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Unit Price</label>
                    <input 
                      type="number" 
                      min={0} 
                      step="0.01" 
                      value={line.unitPrice} 
                      onChange={(e)=>setLine({...line, unitPrice: Number(e.target.value)})} 
                      className="input w-full" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Income Account</label>
                  <select 
                    value={line.accountId} 
                    onChange={(e)=>setLine({...line, accountId: e.target.value})} 
                    className="input w-full"
                  >
                    <option value="">Select account</option>
                    {incomeAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.code} · {acc.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="text-right text-sm text-[var(--text-muted)] bg-[var(--sidebar-bg)] p-2 rounded">
                  Line total: {currency} {lineAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <button 
              disabled={submitting || !customer || !line.accountId} 
              className="btn-primary w-full disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Invoice"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


