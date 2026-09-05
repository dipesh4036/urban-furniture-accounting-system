"use client";

import { Search } from "lucide-react";
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
      <header className="flex h-16 items-center gap-6 border-b px-6">
        <span className="text-lg font-bold">Urban Furniture</span>

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
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              disabled
              className="h-9 w-56 rounded-md border bg-transparent pl-8 text-sm text-muted-foreground placeholder:text-muted-foreground"
            />
          </div>

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
