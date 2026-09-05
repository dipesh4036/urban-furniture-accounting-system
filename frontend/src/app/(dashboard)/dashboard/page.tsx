"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Quick links into every planned module (plan.md). No stats or numbers
// here on purpose - there's no real data to summarize yet since none of
// these modules have their APIs built. This becomes a real overview (with
// actual counts, recent activity, etc.) once Reports (Module 13) lands.
const quickLinks = [
  { label: "Contacts", href: "/contacts", description: "Customers and vendors" },
  { label: "Products", href: "/products", description: "Goods and services you sell or buy" },
  { label: "Chart of Accounts", href: "/accounts", description: "Ledger accounts" },
  { label: "Journals", href: "/journals", description: "Sales, purchase, bank, cash" },
  { label: "Journal Entries", href: "/journal-entries", description: "Manual debit/credit entries" },
  { label: "Purchase Orders", href: "/purchase-orders", description: "Orders placed with vendors" },
  { label: "Vendor Bills", href: "/vendor-bills", description: "Bills to pay" },
  { label: "Sales Orders", href: "/sales-orders", description: "Orders from customers" },
  { label: "Invoices", href: "/invoices", description: "Invoices to collect" },
  { label: "Budgets", href: "/budgets", description: "Planned vs actual spend" },
  { label: "Reports", href: "/reports", description: "Balance sheet, P&L, budget report" },
  { label: "Users", href: "/users", description: "Staff accounts" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {user ? `Welcome back, ${user.name}` : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">Jump into any module below.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col gap-1 rounded-lg border bg-background p-4 transition-colors hover:bg-muted"
          >
            <span className="text-sm font-medium">{link.label}</span>
            <span className="text-sm text-muted-foreground">{link.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
