"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Quick links into every planned module (plan.md), grouped the same way
// as the top nav categories. No stats or numbers here on purpose - there's
// no real data to summarize yet since none of these modules have their
// APIs built. This becomes a real overview (with actual counts, recent
// activity, etc.) once Reports (Module 13) lands.
const categories = [
  {
    label: "Sales",
    links: [
      { label: "Sales Orders", href: "/sales-orders" },
      { label: "Invoices", href: "/invoices" },
    ],
  },
  {
    label: "Purchase",
    links: [
      { label: "Purchase Orders", href: "/purchase-orders" },
      { label: "Vendor Bills", href: "/vendor-bills" },
    ],
  },
  {
    label: "Accounting",
    links: [
      { label: "Contacts", href: "/contacts" },
      { label: "Products", href: "/products" },
      { label: "Chart of Accounts", href: "/accounts" },
      { label: "Journals", href: "/journals" },
      { label: "Journal Entries", href: "/journal-entries" },
      { label: "Budgets", href: "/budgets" },
    ],
  },
  {
    label: "Reports",
    links: [{ label: "Balance Sheet, P&L, Budget Report", href: "/reports" }],
  },
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <div key={category.label} className="rounded-lg border bg-background p-4">
            <h2 className="mb-3 text-sm font-semibold">{category.label}</h2>
            <div className="flex flex-col gap-1">
              {category.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                  <ChevronRight className="size-4" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
