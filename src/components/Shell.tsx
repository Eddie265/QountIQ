"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Bell,
  ChartPie,
  ChevronDown,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Monitor,
  Moon,
  PanelLeft,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import type { SessionUser } from "@/lib/auth/server";
import { initials } from "@/lib/format";
import { LocalDate } from "./LocalDate";
import type { Message, Profile } from "@/types";
import { InsightsPanel } from "./InsightsPanel";

const menu = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/payments", label: "Payment", icon: Send },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/analytics", label: "Analytics", icon: ChartPie },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/inbox", label: "Inbox", icon: Inbox },
];
const tools = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: LifeBuoy },
];

/* ---------- theme ---------- */

type Theme = "light" | "dark" | "system";
const themeListeners = new Set<() => void>();
function readTheme(): Theme {
  try {
    return (localStorage.getItem("theme") as Theme) || "system";
  } catch {
    return "system";
  }
}
function writeTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = theme;
  themeListeners.forEach((l) => l());
}
function useTheme() {
  return useSyncExternalStore(
    (cb) => (themeListeners.add(cb), () => themeListeners.delete(cb)),
    readTheme,
    () => "system" as Theme
  );
}

/* ---------- click-outside helper ---------- */

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

/* ---------- Shell ---------- */

export function Shell({
  profile,
  user,
  unread,
  notifications,
  children,
}: {
  profile: Profile;
  user: SessionUser;
  unread: number;
  notifications: Message[];
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile drawer on navigation.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  return (
    <div className="min-h-dvh p-0 lg:p-3">
      <div className="flex min-h-dvh gap-3 lg:min-h-[calc(100dvh-1.5rem)]">
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-[var(--overlay)] lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          unread={unread}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 pb-3 pt-3 lg:px-0 lg:pb-0 lg:pt-0">
          <Topbar profile={profile} user={user} unread={unread} notifications={notifications} onMenu={() => setMobileOpen(true)} />
          <main className="panel flex-1 bg-surface-muted/60 p-4 sm:p-5 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
  unread,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unread: number;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const link = (item: (typeof menu)[number]) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          active ? "bg-surface font-medium text-ink shadow-sm" : "text-muted hover:bg-surface/70 hover:text-ink"
        } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
      >
        <Icon className={`size-4 shrink-0 ${active ? "text-primary" : ""}`} />
        <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
        {item.href === "/inbox" && unread > 0 && (
          <span className={`ml-auto rounded-full bg-primary px-1.5 text-[11px] font-medium text-white ${collapsed ? "lg:hidden" : ""}`}>
            {unread}
          </span>
        )}
      </Link>
    );
  };

  const nextTheme: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <aside
      className={`panel fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar p-4 transition-transform max-lg:rounded-none lg:sticky lg:top-3 lg:z-auto lg:h-[calc(100dvh-1.5rem)] lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "lg:w-[72px] lg:px-3" : "lg:w-60"}`}
    >
      <div className={`mb-6 flex items-center gap-2.5 ${collapsed ? "lg:flex-col" : ""}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">C</span>
          <span className={`text-lg font-semibold tracking-tight ${collapsed ? "lg:hidden" : ""}`}>CountIQ</span>
        </Link>
        <button onClick={onToggle} className={`btn-ghost ml-auto hidden size-8 px-0 lg:inline-flex ${collapsed ? "lg:ml-0" : ""}`} aria-label="Toggle sidebar">
          <PanelLeft className="size-4" />
        </button>
        <button onClick={onCloseMobile} className="btn-ghost ml-auto size-8 px-0 lg:hidden" aria-label="Close menu">
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto">
        <p className={`mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-faint ${collapsed ? "lg:hidden" : ""}`}>Menu</p>
        <div className="flex flex-col gap-0.5">{menu.map(link)}</div>
        <p className={`mb-2 mt-6 px-3 text-[11px] font-medium uppercase tracking-wider text-faint ${collapsed ? "lg:hidden" : ""}`}>Tools</p>
        <div className="flex flex-col gap-0.5">
          {tools.map(link)}
          <button
            onClick={() => writeTheme(nextTheme[theme])}
            title={`Appearance: ${theme}`}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface/70 hover:text-ink ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <Monitor className="size-4 shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Appearance</span>
            <span className={`ml-auto inline-flex items-center gap-1 text-xs capitalize text-faint ${collapsed ? "lg:hidden" : ""}`}>
              {theme}
              <ThemeIcon className="size-4" />
            </span>
          </button>
        </div>

        <div className={`mt-auto rounded-xl border border-line bg-surface p-4 text-center ${collapsed ? "lg:hidden" : ""}`}>
          <p className="text-lg font-semibold">Go Pro!</p>
          <p className="mt-1 text-xs text-muted">Unlock deep analytics and forecasting.</p>
          <Link href="/analytics" className="btn-primary mt-3 w-full">
            <Sparkles className="size-4" /> Explore analytics
          </Link>
        </div>
      </nav>
    </aside>
  );
}

/* ---------- Topbar ---------- */

type SearchResult = { kind: string; id: string; title: string; subtitle: string; href: string };

function Topbar({
  profile,
  user,
  unread,
  notifications,
  onMenu,
}: {
  profile: Profile;
  user: SessionUser;
  unread: number;
  notifications: Message[];
  onMenu: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [open, setOpen] = useState<null | "search" | "bell" | "profile" | "insights">(null);
  const close = () => setOpen(null);
  const searchRef = useDismiss(open === "search", close);
  const bellRef = useDismiss(open === "bell", close);
  const profileRef = useDismiss(open === "profile", close);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (res.ok) setResults(await res.json());
      } catch {}
    }, 200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  // "/" focuses search, like most dashboards.
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (e.key === "/" && !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const shown = q.trim().length >= 2 ? results : null;

  return (
    <header className="panel flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
      <button onClick={onMenu} className="icon-btn lg:hidden" aria-label="Open menu">
        <Menu className="size-4" />
      </button>

      <div ref={searchRef} className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen("search");
          }}
          onFocus={() => setOpen("search")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) {
              router.push(`/transactions?q=${encodeURIComponent(q.trim())}`);
              close();
            }
          }}
          placeholder="Search"
          aria-label="Search"
          className="input h-9 bg-surface-muted pl-9"
        />
        {open === "search" && shown && (
          <div className="panel absolute left-0 right-0 top-11 z-30 max-h-96 overflow-y-auto p-1.5 shadow-lg">
            {shown.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">No results for “{q}”.</p>
            ) : (
              shown.map((r) => (
                <Link
                  key={`${r.kind}-${r.id}`}
                  href={r.href}
                  onClick={() => {
                    close();
                    setQ("");
                  }}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-surface-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{r.title}</span>
                    <span className="block truncate text-xs text-muted">{r.subtitle}</span>
                  </span>
                  <span className="badge bg-surface-muted text-muted">{r.kind}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => setOpen("insights")} className="btn-secondary hidden sm:inline-flex">
          <Sparkles className="size-4 text-primary" /> Insights
        </button>
        <button onClick={() => setOpen("insights")} className="icon-btn sm:hidden" aria-label="Insights">
          <Sparkles className="size-4 text-primary" />
        </button>

        <div ref={bellRef} className="relative">
          <button onClick={() => setOpen(open === "bell" ? null : "bell")} className="icon-btn relative" aria-label={`Notifications (${unread} unread)`}>
            <Bell className="size-4" />
            {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-surface" />}
          </button>
          {open === "bell" && (
            <div className="panel absolute right-0 top-11 z-30 w-80 p-1.5 shadow-lg">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-sm font-semibold">Notifications</p>
                <span className="text-xs text-muted">{unread} unread</span>
              </div>
              {notifications.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted">You&apos;re all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <Link key={n.id} href={`/inbox?open=${n.id}`} onClick={close} className="block rounded-lg px-3 py-2 hover:bg-surface-muted">
                    <span className="block truncate text-sm font-medium">{n.subject}</span>
                    <span className="block text-xs text-muted">
                      {n.sender} · <LocalDate value={n.created_at} format="relative" />
                    </span>
                  </Link>
                ))
              )}
              <Link href="/inbox" onClick={close} className="btn-ghost mt-1 w-full">
                Open inbox
              </Link>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button onClick={() => setOpen(open === "profile" ? null : "profile")} className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-surface-muted">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
              {initials(user.name)}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="block text-xs text-muted">{profile.role}</span>
            </span>
            <ChevronDown className="hidden size-4 text-muted md:block" />
          </button>
          {open === "profile" && (
            <div className="panel absolute right-0 top-12 z-30 w-56 p-1.5 shadow-lg">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              <Link href="/settings" onClick={close} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
                Profile & settings
              </Link>
              <Link href="/help" onClick={close} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
                Help & support
              </Link>
              <button
                onClick={async () => {
                  close();
                  await authClient.signOut();
                  router.replace("/auth/sign-in");
                  router.refresh();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-surface-muted"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <InsightsPanel open={open === "insights"} onClose={close} currency={profile.currency} />
    </header>
  );
}
