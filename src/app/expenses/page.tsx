export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Expenses</h1>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-[var(--border-color)] rounded-lg px-3 py-2 bg-white">
            <option>All Categories</option>
            <option>Office Supplies</option>
            <option>Travel</option>
            <option>Meals</option>
          </select>
          <button className="btn-primary">
            + Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Recent Expenses</h3>
              <div className="text-sm text-[var(--text-muted)]">0 expenses</div>
            </div>
            <div className="text-center py-8 text-[var(--text-muted)]">
              <div className="w-16 h-16 bg-[var(--light-green)] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm">No expenses yet</p>
              <p className="text-xs text-[var(--text-muted)]">Track your business expenses</p>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--primary-green)] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">+</span>
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">Add Expense</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Description</label>
                <input className="input w-full" placeholder="Office supplies" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Amount</label>
                <input type="number" className="input w-full" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Category</label>
                <select className="input w-full">
                  <option>Select category</option>
                  <option>Office Supplies</option>
                  <option>Travel</option>
                  <option>Meals</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Date</label>
                <input type="date" className="input w-full" />
              </div>
              <button className="btn-primary w-full">
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


