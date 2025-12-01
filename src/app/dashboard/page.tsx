"use client";

import { DonutChart, BarChart } from '@/components/Charts';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { ChartProvider } from '@/components/ChartProvider';

export default function DashboardPage() {
  return (
    <ChartProvider>
      <div className="space-y-6">
      {/* Andrew Forbist Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card bg-[var(--dark-green)] text-white relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <span className="text-xs">📶</span>
              </div>
            </div>
            <div className="absolute top-4 left-4 flex gap-1">
              <div className="w-2 h-2 bg-white/40 rounded"></div>
              <div className="w-2 h-2 bg-white/40 rounded"></div>
              <div className="w-2 h-2 bg-white/40 rounded"></div>
              <div className="w-2 h-2 bg-white/40 rounded"></div>
            </div>
            <div className="pt-8">
              <div className="text-sm text-green-100 mb-1">Andrew Forbist</div>
              <div className="text-xs text-green-200 mb-2">Balance Amount</div>
              <div className="text-4xl font-bold mb-2">$562,000</div>
              <div className="text-xs text-green-200">EXP 11/29 • CVV 323</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button className="card hover:shadow-md transition-all duration-200 group">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[var(--primary-green)] rounded-full flex items-center justify-center group-hover:bg-[var(--dark-green)] transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">Top Up</span>
              </div>
            </button>
            <button className="card hover:shadow-md transition-all duration-200 group">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[var(--primary-green)] rounded-full flex items-center justify-center group-hover:bg-[var(--dark-green)] transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">Transfer</span>
              </div>
            </button>
            <button className="card hover:shadow-md transition-all duration-200 group">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[var(--primary-green)] rounded-full flex items-center justify-center group-hover:bg-[var(--dark-green)] transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">Request</span>
              </div>
            </button>
            <button className="card hover:shadow-md transition-all duration-200 group">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[var(--primary-green)] rounded-full flex items-center justify-center group-hover:bg-[var(--dark-green)] transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">History</span>
              </div>
            </button>
          </div>
        </div>

        {/* Charts Section - Moved to Top */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cashflow Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Cashflow</h3>
                <div className="text-sm text-[var(--text-muted)]">Total Balance $562,000</div>
              </div>
              <select className="text-sm border border-[var(--border-color)] rounded-lg px-3 py-1 bg-white">
                <option>This Year</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            
            {/* Legend */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--dark-green)] rounded"></div>
                <span className="text-sm text-[var(--text-muted)]">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--light-green)] rounded"></div>
                <span className="text-sm text-[var(--text-muted)]">Expense</span>
              </div>
            </div>

            {/* Bar Chart */}
            <BarChart />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--light-green)] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[var(--text-muted)]">Total Income</div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">$78,000</div>
                  <div className="text-xs text-[var(--primary-green)] font-medium">+1.78%</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--light-green)] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[var(--text-muted)]">Total Expense</div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">$45,200</div>
                  <div className="text-xs text-red-500 font-medium">-2.1%</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--light-green)] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[var(--text-muted)]">Total Savings</div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">$32,800</div>
                  <div className="text-xs text-[var(--primary-green)] font-medium">+5.2%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Limit */}
          <div className="card">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Daily Limit</h3>
            <div className="space-y-3">
              <div className="text-sm text-[var(--text-muted)]">$2,500.00 spent of $20,000.00</div>
              <ProgressBar value={2500} max={20000} />
            </div>
          </div>

          {/* Saving Plans */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Saving Plans</h3>
              <div className="text-sm text-[var(--text-muted)]">Total Savings $84,500</div>
            </div>
            <button className="btn-secondary mb-4">+ Add Plan</button>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--light-green)] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)]">Emergency Fund</div>
                    <div className="text-sm text-[var(--text-muted)]">Target $10,000</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[var(--foreground)]">$7,500</div>
                  <div className="text-xs text-[var(--text-muted)]">75%</div>
                </div>
              </div>
              <ProgressBar value={7500} max={10000} showPercentage={false} />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--light-green)] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)]">Vacation Fund</div>
                    <div className="text-sm text-[var(--text-muted)]">Target $5,000</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[var(--foreground)]">$3,200</div>
                  <div className="text-xs text-[var(--text-muted)]">64%</div>
                </div>
              </div>
              <ProgressBar value={3200} max={5000} showPercentage={false} />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--light-green)] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)]">Home Down Payment</div>
                    <div className="text-sm text-[var(--text-muted)]">Target $50,000</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[var(--foreground)]">$15,800</div>
                  <div className="text-xs text-[var(--text-muted)]">32%</div>
                </div>
              </div>
              <ProgressBar value={15800} max={50000} showPercentage={false} />
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Recent Transactions</h3>
              <select className="text-sm border border-[var(--border-color)] rounded-lg px-3 py-1 bg-white">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="overflow-x-auto table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="text-left py-2 text-sm font-medium text-[var(--text-muted)]">Transaction Name</th>
                    <th className="text-left py-2 text-sm font-medium text-[var(--text-muted)]">Date & Time</th>
                    <th className="text-left py-2 text-sm font-medium text-[var(--text-muted)]">Amount</th>
                    <th className="text-left py-2 text-sm font-medium text-[var(--text-muted)]">Note</th>
                    <th className="text-left py-2 text-sm font-medium text-[var(--text-muted)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  <tr>
                    <td className="py-3 font-medium text-[var(--foreground)] flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Electricity Bill
                    </td>
                    <td className="py-3 text-sm text-[var(--text-muted)]">Today, 2:30 PM</td>
                    <td className="py-3 font-medium text-[var(--foreground)]">-$120.00</td>
                    <td className="py-3 text-sm text-[var(--text-muted)]">Monthly utility</td>
                    <td className="py-3"><StatusBadge status="completed">Completed</StatusBadge></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-[var(--foreground)] flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      Weekly Groceries
                    </td>
                    <td className="py-3 text-sm text-[var(--text-muted)]">Yesterday, 4:15 PM</td>
                    <td className="py-3 font-medium text-[var(--foreground)]">-$85.50</td>
                    <td className="py-3 text-sm text-[var(--text-muted)]">Supermarket</td>
                    <td className="py-3"><StatusBadge status="pending">Pending</StatusBadge></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-[var(--foreground)] flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Coffee Shop
                    </td>
                    <td className="py-3 text-sm text-[var(--text-muted)]">Yesterday, 10:30 AM</td>
                    <td className="py-3 font-medium text-[var(--foreground)]">-$12.50</td>
                    <td className="py-3 text-sm text-[var(--text-muted)]">Morning coffee</td>
                    <td className="py-3"><StatusBadge status="failed">Failed</StatusBadge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Statistics Donut Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">Statistic</h3>
              <select className="text-sm border border-[var(--border-color)] rounded-lg px-3 py-1 bg-white">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="text-center mb-4">
              <div className="text-sm text-[var(--text-muted)] mb-1">Income ($4,800)</div>
              <div className="text-sm text-[var(--text-muted)] mb-4">Expense ($3,500)</div>
              
              {/* Donut Chart */}
              <DonutChart />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[var(--primary-green)] rounded"></div>
                  <span className="text-sm text-[var(--foreground)]">Rent & Living</span>
                </div>
                <div className="text-sm text-[var(--foreground)]">60% $2,100</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm text-[var(--foreground)]">Food & Dining</span>
                </div>
                <div className="text-sm text-[var(--foreground)]">25% $875</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-sm text-[var(--foreground)]">Transportation</span>
                </div>
                <div className="text-sm text-[var(--foreground)]">15% $525</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Today</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials="AF" />
                    <div className="flex-1">
                      <div className="text-sm text-[var(--foreground)]">Payment received from John Doe</div>
                      <div className="text-xs text-[var(--text-muted)]">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar initials="JD" className="bg-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm text-[var(--foreground)]">Invoice #INV-001 created</div>
                      <div className="text-xs text-[var(--text-muted)]">4 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Yesterday</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials="SM" className="bg-orange-500" />
                    <div className="flex-1">
                      <div className="text-sm text-[var(--foreground)]">Expense report submitted</div>
                      <div className="text-xs text-[var(--text-muted)]">1 day ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar initials="AL" className="bg-purple-500" />
                    <div className="flex-1">
                      <div className="text-sm text-[var(--foreground)]">Bank reconciliation completed</div>
                      <div className="text-xs text-[var(--text-muted)]">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ChartProvider>
  );
}


