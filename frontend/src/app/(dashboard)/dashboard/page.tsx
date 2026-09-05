"use client";

import { 
  ShoppingCart, 
  Package, 
  Users, 
  BookOpen, 
  FileText, 
  Calculator, 
  Receipt, 
  CreditCard,
  PieChart,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";

const categories = [
  {
    title: "Sales & Fulfillment",
    description: "Manage customer orders and invoicing",
    icon: ShoppingCart,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    links: [
      { label: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
      { label: "Customer Invoices", href: "/invoices", icon: FileText },
    ],
  },
  {
    title: "Purchasing",
    description: "Handle vendors and supply chain",
    icon: Package,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    links: [
      { label: "Purchase Orders", href: "/purchase-orders", icon: Package },
      { label: "Vendor Bills", href: "/vendor-bills", icon: Receipt },
    ],
  },
  {
    title: "Core Accounting",
    description: "Chart of accounts, journals and budgets",
    icon: BookOpen,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    links: [
      { label: "Chart of Accounts", href: "/accounts", icon: BookOpen },
      { label: "Journals", href: "/journals", icon: BookOpen },
      { label: "Journal Entries", href: "/journal-entries", icon: FileText },
      { label: "Budgets", href: "/budgets", icon: CreditCard },
      { label: "Analytic Accounts", href: "/analytic-accounts", icon: Calculator },
    ],
  },
  {
    title: "Business Intelligence",
    description: "Financial reports and performance metrics",
    icon: PieChart,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    links: [
      { label: "Balance Sheet", href: "/reports/balance-sheet", icon: Activity },
      { label: "Profit & Loss", href: "/reports/profit-loss", icon: TrendingUp },
      { label: "Budget Report", href: "/reports/budget-report", icon: PieChart },
    ],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          {user ? `Welcome back, ${user.name}` : "Welcome back"}
        </h1>
        <p className="max-w-[42rem] text-muted-foreground">
          Here is your Urban Furniture business overview. Select a module below to get started with your daily tasks, 
          manage accounts, or view recent performance reports.
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.title} className="group flex flex-col rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-4 border-b p-6">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${category.bgColor}`}>
                  <CategoryIcon className={`size-6 ${category.color}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-semibold tracking-tight">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <div className="flex flex-col p-2">
                {category.links.map((link) => {
                  const LinkIcon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group/link flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <LinkIcon className="size-4 text-muted-foreground group-hover/link:text-foreground" />
                      <span className="flex-1 text-muted-foreground group-hover/link:text-foreground">
                        {link.label}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
