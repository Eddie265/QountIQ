import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/SidebarNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataTitle = "CountIQ | Accounting OS";

export const metadata: Metadata = {
  title: metadataTitle,
  description:
    "CountIQ keeps finance teams aligned with real-time accounting, payouts, payroll, and forecasts.",
  manifest: "/manifest.json",
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/payments", label: "Payments" },
  { href: "/transactions", label: "Transactions" },
  { href: "/invoices", label: "Invoices" },
  { href: "/cards", label: "Cards" },
  { href: "/savings", label: "Saving Plans" },
  { href: "/payroll", label: "Payroll" },
  { href: "/investments", label: "Investments" },
  { href: "/promos", label: "Promos" },
  { href: "/insights", label: "Insights" },
  { href: "/inbox", label: "Inbox" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="font-sans min-h-screen lg:grid lg:grid-cols-[260px_1fr] lg:grid-rows-[auto_1fr]">
          {/* Sidebar */}
          <aside className="bg-[var(--sidebar-bg)] p-4 border-b border-[var(--border-color)] lg:border-b-0 lg:border-r lg:p-6 lg:row-span-2">
            <div className="flex items-center gap-3 mb-4 lg:mb-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--primary-green)] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-base">CIQ</span>
                </div>
                <div className="text-xl font-bold text-[var(--foreground)] hidden sm:block">
                  CountIQ
                </div>
              </Link>
            </div>
            <SidebarNav items={navItems} />

            {/* Pro Card */}
            <div className="hidden lg:block mt-8 p-4 bg-[var(--dark-green)] rounded-xl text-white">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-semibold text-sm">Get Pro</span>
              </div>
              <p className="text-xs text-green-100 mb-3">
                Gain full access to your finances with detailed analytics and graphs
              </p>
              <button className="w-full bg-white text-[var(--dark-green)] py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                Get Pro
              </button>
            </div>
          </aside>

          {/* Top bar */}
          <header className="border-b border-[var(--border-color)] flex flex-wrap gap-4 items-center justify-between px-4 py-4 bg-white lg:px-8">
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    Organization
                  </p>
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    Acme Corporation
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    FY 2025 · USD
                  </p>
                </div>
                <button className="btn-secondary text-xs px-3 py-1">
                  Switch
                </button>
              </div>
              <div className="relative w-full max-w-md">
                <input
                  type="search"
                  placeholder="Search vendors, invoices, reports..."
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[var(--text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17H12l-2.586-2.586a2 2 0 00-2.828 0L4.828 17z" />
                </svg>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[var(--text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[var(--text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--foreground)]">Andrew Forbist</span>
                <div className="w-8 h-8 bg-[var(--primary-green)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  AF
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="col-start-2 p-8 bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
