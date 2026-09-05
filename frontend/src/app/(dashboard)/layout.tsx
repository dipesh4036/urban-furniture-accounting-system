"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BookOpen, 
  FileText, 
  Calculator, 
  Receipt, 
  CreditCard,
  PieChart,
  BarChart,
  TrendingUp,
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Top-level nav categories for the staff dashboard, grouped to match
// plan.md's modules. Each links to the first page in that category - the
// individual pages inside each category get built out in later branches.
const navGroups = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Sales & Purchases",
    items: [
      { label: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
      { label: "Customer Invoices", href: "/invoices", icon: FileText },
      { label: "Purchase Orders", href: "/purchase-orders", icon: Package },
      { label: "Vendor Bills", href: "/vendor-bills", icon: Receipt },
    ]
  },
  {
    title: "Accounting",
    items: [
      { label: "Contacts", href: "/contacts", icon: Users },
      { label: "Products", href: "/products", icon: Package },
      { label: "Chart of Accounts", href: "/accounts", icon: BookOpen },
      { label: "Journals", href: "/journals", icon: BookOpen },
      { label: "Journal Entries", href: "/journal-entries", icon: FileText },
      { label: "Analytic Accounts", href: "/analytic-accounts", icon: Calculator },
      { label: "Budgets", href: "/budgets", icon: CreditCard },
    ]
  },
  {
    title: "Reports",
    items: [
      { label: "Balance Sheet", href: "/reports/balance-sheet", icon: PieChart },
      { label: "Profit & Loss", href: "/reports/profit-loss", icon: BarChart },
      { label: "Budget Report", href: "/reports/budget-report", icon: TrendingUp },
    ]
  },
  {
    title: "Settings",
    items: [
      { label: "Users", href: "/users", icon: Settings },
    ]
  }
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/50 shadow-xs">
            <Image
              src="/logo.jpg"
              alt="Urban Furniture Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Urban<span className="font-medium text-muted-foreground">Furniture</span>
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-muted">
        <nav className="flex flex-col gap-6">
          {navGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </h3>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {isLoading || !user ? "" : initialsFor(user.name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {isLoading ? "Loading..." : (user?.name ?? "")}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.role ?? ""}
            </span>
          </div>
          <div className="shrink-0">
            <LogoutButton variant="ghost" size="icon" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden supports-[backdrop-filter]:bg-background/60">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-border/50 shadow-xs">
            <Image
              src="/logo.jpg"
              alt="Urban Furniture Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Urban<span className="font-medium text-muted-foreground">Furniture</span>
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <Menu className="size-5" />
          <span className="sr-only">Open sidebar</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-background shadow-lg border-r transition-transform">
            <div className="absolute right-4 top-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
                <span className="sr-only">Close sidebar</span>
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r bg-background lg:flex sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

