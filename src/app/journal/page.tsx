"use client";

import { useEffect, useMemo, useState } from "react";
import type { Account, JournalEntry, JournalLine } from "@/types";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState("");
  const [lineA, setLineA] = useState<JournalLine>({ accountId: "", debit: 0, credit: 0 });
  const [lineB, setLineB] = useState<JournalLine>({ accountId: "", debit: 0, credit: 0 });
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const [jr, ar] = await Promise.all([
      fetch("/api/journal", { cache: "no-store" }),
      fetch("/api/accounts", { cache: "no-store" }),
    ]);
    const [journals, accs] = await Promise.all([jr.json(), ar.json()]);
    setEntries(journals);
    setAccounts(accs);
  }

  useEffect(() => {
    refresh();
  }, []);

  const totalDebit = (lineA.debit || 0) + (lineB.debit || 0);
  const totalCredit = (lineA.credit || 0) + (lineB.credit || 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.0001 && totalDebit > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!balanced) return;
    if (!lineA.accountId || !lineB.accountId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          memo,
          lines: [lineA, lineB],
        }),
      });
      if (res.ok) {
        setMemo("");
        setLineA({ accountId: "", debit: 0, credit: 0 });
        setLineB({ accountId: "", debit: 0, credit: 0 });
        await refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Journal Entries</h1>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-[var(--border-color)] rounded-lg px-3 py-2 bg-white">
            <option>All Entries</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <button className="btn-primary">
            + New Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Recent Entries</h3>
              <div className="text-sm text-[var(--text-muted)]">{entries.length} entries</div>
            </div>
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <div className="w-16 h-16 bg-[var(--light-green)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📝</span>
                  </div>
                  <p className="text-sm">No journal entries yet</p>
                  <p className="text-xs text-[var(--text-muted)]">Create your first entry to get started</p>
                </div>
              ) : (
                entries.map((e) => (
                  <div key={e.id} className="border border-[var(--border-color)] rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-[var(--foreground)]">{e.date}</div>
                      <div className="text-sm text-[var(--text-muted)]">{e.memo}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {e.lines.map((l, idx) => {
                        const acc = accounts.find((a) => a.id === l.accountId);
                        return (
                          <div key={idx} className="flex justify-between items-center p-3 bg-[var(--sidebar-bg)] rounded-lg">
                            <div className="text-sm">
                              <div className="font-medium text-[var(--foreground)]">
                                {acc ? `${acc.code} · ${acc.name}` : l.accountId}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-[var(--foreground)]">
                              {l.debit > 0 ? `Dr ${l.debit.toFixed(2)}` : `Cr ${l.credit.toFixed(2)}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
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
              <h3 className="font-semibold text-[var(--foreground)]">Post Entry</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e)=>setDate(e.target.value)} 
                  className="input w-full" 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Memo</label>
                <input 
                  value={memo} 
                  onChange={(e)=>setMemo(e.target.value)} 
                  className="input w-full" 
                  placeholder="Description of transaction"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              <h4 className="font-medium text-[var(--foreground)] mb-3">Line A</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Account</label>
                  <select 
                    value={lineA.accountId} 
                    onChange={(e)=>setLineA({...lineA, accountId: e.target.value})} 
                    className="input w-full"
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.code} · {acc.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Debit</label>
                    <input 
                      type="number" 
                      min={0} 
                      step="0.01" 
                      value={lineA.debit} 
                      onChange={(e)=>setLineA({...lineA, debit: Number(e.target.value), credit: 0})} 
                      className="input w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Credit</label>
                    <input 
                      type="number" 
                      min={0} 
                      step="0.01" 
                      value={lineA.credit} 
                      onChange={(e)=>setLineA({...lineA, credit: Number(e.target.value), debit: 0})} 
                      className="input w-full" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              <h4 className="font-medium text-[var(--foreground)] mb-3">Line B</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Account</label>
                  <select 
                    value={lineB.accountId} 
                    onChange={(e)=>setLineB({...lineB, accountId: e.target.value})} 
                    className="input w-full"
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.code} · {acc.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Debit</label>
                    <input 
                      type="number" 
                      min={0} 
                      step="0.01" 
                      value={lineB.debit} 
                      onChange={(e)=>setLineB({...lineB, debit: Number(e.target.value), credit: 0})} 
                      className="input w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Credit</label>
                    <input 
                      type="number" 
                      min={0} 
                      step="0.01" 
                      value={lineB.credit} 
                      onChange={(e)=>setLineB({...lineB, credit: Number(e.target.value), debit: 0})} 
                      className="input w-full" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-[var(--text-muted)] bg-[var(--sidebar-bg)] p-3 rounded">
              <div className="flex justify-between">
                <span>Total Debit: ${totalDebit.toFixed(2)}</span>
                <span>Total Credit: ${totalCredit.toFixed(2)}</span>
              </div>
              <div className={`text-center mt-1 font-medium ${balanced ? 'text-[var(--primary-green)]' : 'text-red-500'}`}>
                {balanced ? "✓ Balanced" : "✗ Unbalanced"}
              </div>
            </div>

            <button 
              disabled={submitting || !balanced} 
              className="btn-primary w-full disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Entry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


