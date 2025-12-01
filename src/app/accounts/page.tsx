export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Chart of Accounts</h1>
        <button className="btn-primary">
          + Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Account Categories</h3>
            <div className="space-y-4">
              <div className="border border-[var(--border-color)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[var(--foreground)]">Assets</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-[var(--sidebar-bg)] rounded">
                    <span>1000 · Cash</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[var(--sidebar-bg)] rounded">
                    <span>1100 · Accounts Receivable</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="border border-[var(--border-color)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[var(--foreground)]">Liabilities</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-[var(--sidebar-bg)] rounded">
                    <span>2000 · Accounts Payable</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="border border-[var(--border-color)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[var(--foreground)]">Equity</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-[var(--sidebar-bg)] rounded">
                    <span>3000 · Owner&apos;s Equity</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="border border-[var(--border-color)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[var(--foreground)]">Income</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-[var(--sidebar-bg)] rounded">
                    <span>4000 · Sales</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="border border-[var(--border-color)] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[var(--light-green)] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[var(--foreground)]">Expenses</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-[var(--sidebar-bg)] rounded">
                    <span>5000 · Expense</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left">
                <svg className="w-4 h-4 text-[var(--primary-green)] inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>View Trial Balance
              </button>
              <button className="w-full btn-secondary text-left">
                <svg className="w-4 h-4 text-[var(--primary-green)] inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17H12l-2.586-2.586a2 2 0 00-2.828 0L4.828 17z" />
                </svg>
                Export Chart
              </button>
              <button className="w-full btn-secondary text-left">
                <svg className="w-4 h-4 text-[var(--primary-green)] inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>Reconcile Accounts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


