"use client";

import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Top-level nav categories for the staff dashboard, grouped to match
// plan.md's modules. Each links to the first page in that category - the
// individual pages inside each category get built out in later branches.
// No active-link highlighting or role-based show/hide yet.
const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Sales", href: "/sales-orders" },
  { label: "Purchase", href: "/purchase-orders" },
  { label: "Accounting", href: "/contacts" },
  // Temporary direct links so these pages are reachable while they're
  // being built - remove once they're folded into the "Accounting"
  // category link above, or given their own real place in the nav.
  { label: "Chart of Accounts", href: "/accounts" },
  { label: "Products", href: "/products" },
  { label: "Invoices", href: "/invoices" },
  { label: "Journals", href: "/journals" },
  { label: "Journal Entries", href: "/journal-entries" },
  { label: "Reports", href: "/reports" },
  { label: "Users", href: "/users" },
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Layout for every authenticated staff page (Admin/Accountant), e.g.
// /contacts, /products, /reports/balance-sheet. Just the visual shell -
// top nav bar, page content below. No auth redirect here (that's the
// proxy's job) - this just reads the current session to show who's
// logged in.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-6 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <span className="text-sm font-bold tracking-tighter">UF</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Urban<span className="font-medium text-muted-foreground">Furniture</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {isLoading || !user ? "" : initialsFor(user.name)}
            </div>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {isLoading ? "Loading..." : (user?.name ?? "")}
            </span>
          </div>

          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
