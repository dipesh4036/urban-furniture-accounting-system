"use client";

import { useState } from "react";
import Link from "next/link";
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
  Activity,
  Plus,
  CheckCircle2,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Layers,
  ArrowDownLeft,
  X
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSalesOrders } from "@/features/sales-orders/hooks/useSalesOrders";
import { usePurchaseOrders } from "@/features/purchase-orders/hooks/usePurchaseOrders";
import { useCustomerInvoices } from "@/features/customer-invoices/hooks/useCustomerInvoices";
import { useVendorBills } from "@/features/vendor-bills/hooks/useVendorBills";
import { useBudgets } from "@/features/budgets/hooks/useBudgets";
import { useJournals } from "@/features/journals/hooks/useJournals";
import { useJournalEntries } from "@/features/journal-entries/hooks/useJournalEntries";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { SalesOrderForm } from "@/features/sales-orders/components/SalesOrderForm";
import { PurchaseOrderForm } from "@/features/purchase-orders/components/PurchaseOrderForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

const moduleCategories = [
  {
    title: "Sales & Fulfillment",
    description: "Manage customer orders, invoices, and payments",
    icon: ShoppingCart,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "hover:border-blue-500/30",
    links: [
      { label: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
      { label: "Customer Invoices", href: "/invoices", icon: FileText },
    ],
  },
  {
    title: "Purchasing",
    description: "Handle vendors, purchase orders, and supplier bills",
    icon: Package,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "hover:border-emerald-500/30",
    links: [
      { label: "Purchase Orders", href: "/purchase-orders", icon: Package },
      { label: "Vendor Bills", href: "/vendor-bills", icon: Receipt },
    ],
  },
  {
    title: "Core Accounting",
    description: "Chart of accounts, double-entry journals, and budgets",
    icon: BookOpen,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "hover:border-violet-500/30",
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
    description: "Financial statements, analytics, and performance reports",
    icon: PieChart,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "hover:border-amber-500/30",
    links: [
      { label: "Balance Sheet", href: "/reports/balance-sheet", icon: Activity },
      { label: "Profit & Loss", href: "/reports/profit-loss", icon: TrendingUp },
      { label: "Budget Report", href: "/reports/budget-report", icon: PieChart },
    ],
  },
];

type TabType = "all" | "sales" | "purchase" | "account" | "report";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  // Queries for live metrics
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useSalesOrders();
  const { data: purchaseData, isLoading: purchaseLoading, refetch: refetchPurchase } = usePurchaseOrders();
  const { data: invoiceData, isLoading: invoiceLoading, refetch: refetchInvoices } = useCustomerInvoices();
  const { data: billsData, isLoading: billsLoading, refetch: refetchBills } = useVendorBills();
  const { data: budgetsData, isLoading: budgetsLoading, refetch: refetchBudgets } = useBudgets();
  const { data: journalsData, isLoading: journalsLoading, refetch: refetchJournals } = useJournals();
  const { data: entriesData, isLoading: entriesLoading, refetch: refetchEntries } = useJournalEntries();
  const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = useAccounts();

  const isAnyLoading = salesLoading || purchaseLoading || invoiceLoading || billsLoading || budgetsLoading || journalsLoading;

  const handleRefreshAll = () => {
    refetchSales();
    refetchPurchase();
    refetchInvoices();
    refetchBills();
    refetchBudgets();
    refetchJournals();
    refetchEntries();
    refetchAccounts();
  };

  // Sales computations
  const salesOrders = salesData?.salesOrders ?? [];
  const salesTotalCount = salesOrders.length;
  const salesConfirmedCount = salesOrders.filter((s) => s.status === "CONFIRMED" || s.status === "BILLED").length;
  const salesDraftCount = salesOrders.filter((s) => s.status === "DRAFT").length;
  const salesTotalRevenue = salesOrders.reduce((sum, so) => {
    const orderSum = so.items.reduce((iSum, it) => iSum + it.quantity * Number(it.unitPrice) + Number(it.tax), 0);
    return sum + orderSum;
  }, 0);

  // Invoices computations
  const customerInvoices = invoiceData?.customerInvoices ?? [];
  const unpaidInvoicesCount = customerInvoices.filter((inv) => inv.status === "UNPAID" || inv.status === "PARTIALLY_PAID").length;

  // Purchase computations
  const purchaseOrders = purchaseData?.purchaseOrders ?? [];
  const purchaseTotalCount = purchaseOrders.length;
  const purchaseConfirmedCount = purchaseOrders.filter((p) => p.status === "CONFIRMED" || p.status === "BILLED").length;
  const purchaseDraftCount = purchaseOrders.filter((p) => p.status === "DRAFT").length;
  const purchaseTotalSpend = purchaseOrders.reduce((sum, po) => {
    const poSum = po.items.reduce((iSum, it) => iSum + it.quantity * Number(it.unitPrice), 0);
    return sum + poSum;
  }, 0);

  // Vendor Bills computations
  const vendorBills = billsData?.vendorBills ?? [];
  const pendingBillsCount = vendorBills.filter((bill) => bill.status === "UNPAID" || bill.status === "PARTIALLY_PAID").length;

  // Budgets computations
  const budgets = budgetsData?.budgets ?? [];
  const budgetsCount = budgets.length;
  const totalPlannedBudget = budgets.reduce((sum, b) => sum + Number(b.plannedAmount || 0), 0);
  const achievedCount = budgets.filter((b) => Number(b.plannedAmount) > 0).length;
  const committedCount = purchaseOrders.filter((p) => p.status === "CONFIRMED").length;

  // Accounting computations
  const journals = journalsData?.journals ?? [];
  const journalsCount = journals.length;
  const entries = entriesData?.entries ?? [];
  const entriesCount = entries.length;
  const accountsCount = accountsData?.accounts?.length ?? 0;

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* Sleek Minimal Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {user ? `Welcome, ${user.name}` : "Dashboard"}
          </h1>
          {user?.role && (
            <Badge variant="secondary" className="text-[11px] font-semibold uppercase tracking-wider">
              {user.role}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isAnyLoading}
            className="h-8 gap-1.5 text-xs bg-card shadow-2xs hover:bg-muted"
          >
            <RefreshCw className={`size-3.5 ${isAnyLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Tabs Filter Bar (Sales | Purchase | Account | Report) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Overview", icon: Layers, count: null },
              { id: "sales", label: "Sales", icon: ShoppingCart, count: salesTotalCount },
              { id: "purchase", label: "Purchase", icon: Package, count: purchaseTotalCount },
              { id: "account", label: "Account", icon: BookOpen, count: journalsCount },
              { id: "report", label: "Report", icon: PieChart, count: budgetsCount },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className={`size-4 transition-transform group-hover:scale-110 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            <span>Live Sync Active</span>
          </div>
        </div>

        {/* Section 1: Main Metric KPI Cards (Matching User's Sketch) */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Sales */}
          {(activeTab === "all" || activeTab === "sales") && (
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-500/40">
              <div className="flex flex-col gap-4">
                {/* Header with Title and "New" Action Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <ShoppingCart className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-foreground">Sales</h2>
                      <p className="text-xs text-muted-foreground">Customer orders & pipeline</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsSalesDialogOpen(true)}
                    className="gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs font-medium px-3.5"
                  >
                    <Plus className="size-3.5" />
                    <span>New</span>
                  </Button>
                </div>

                {/* 3 Metric Pills / Boxes (All, Confirmed, Draft) */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <Link
                    href="/sales-orders"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-blue-500/10 hover:border-blue-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-blue-600">All</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {salesLoading ? "..." : salesTotalCount}
                    </span>
                  </Link>

                  <Link
                    href="/sales-orders"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-emerald-600">Confirmed</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {salesLoading ? "..." : salesConfirmedCount}
                    </span>
                  </Link>

                  <Link
                    href="/sales-orders"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-amber-500/10 hover:border-amber-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-amber-600">Draft</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {salesLoading ? "..." : salesDraftCount}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Sub-indicator */}
              <div className="mt-5 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-blue-500" />
                  <span>Total Value: <strong className="text-foreground font-semibold">{formatMoney(salesTotalRevenue)}</strong></span>
                </div>
                <Link href="/invoices" className="flex items-center gap-1 font-medium text-blue-600 hover:underline">
                  <span>{customerInvoices.length} Invoices</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Card 2: Purchase */}
          {(activeTab === "all" || activeTab === "purchase") && (
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-500/40">
              <div className="flex flex-col gap-4">
                {/* Header with Title and "New" Action Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Package className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-foreground">Purchase</h2>
                      <p className="text-xs text-muted-foreground">Vendor procurement & POs</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsPurchaseDialogOpen(true)}
                    className="gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-medium px-3.5"
                  >
                    <Plus className="size-3.5" />
                    <span>New</span>
                  </Button>
                </div>

                {/* 3 Metric Pills / Boxes (All, Confirmed, Draft) */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <Link
                    href="/purchase-orders"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-emerald-600">All</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {purchaseLoading ? "..." : purchaseTotalCount}
                    </span>
                  </Link>

                  <Link
                    href="/purchase-orders"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-blue-500/10 hover:border-blue-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-blue-600">Confirmed</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {purchaseLoading ? "..." : purchaseConfirmedCount}
                    </span>
                  </Link>

                  <Link
                    href="/purchase-orders"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-amber-500/10 hover:border-amber-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-amber-600">Draft</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {purchaseLoading ? "..." : purchaseDraftCount}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Sub-indicator */}
              <div className="mt-5 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ArrowDownLeft className="size-3.5 text-emerald-500" />
                  <span>Total Spend: <strong className="text-foreground font-semibold">{formatMoney(purchaseTotalSpend)}</strong></span>
                </div>
                <Link href="/vendor-bills" className="flex items-center gap-1 font-medium text-emerald-600 hover:underline">
                  <span>{vendorBills.length} Bills</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Card 3: Budget Reports */}
          {(activeTab === "all" || activeTab === "report") && (
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-violet-500/40">
              <div className="flex flex-col gap-4">
                {/* Header with Title and "Report" Action Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                      <PieChart className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-foreground">Budget Reports</h2>
                      <p className="text-xs text-muted-foreground">Variance & planned allocations</p>
                    </div>
                  </div>
                  <Link href="/reports/budget-report">
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-2xs font-medium px-3.5"
                    >
                      <BarChart3 className="size-3.5" />
                      <span>Report</span>
                    </Button>
                  </Link>
                </div>

                {/* 3 Metric Pills / Boxes (Achieved, Budget, Committed) */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <Link
                    href="/reports/budget-report"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-violet-500/10 hover:border-violet-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-violet-600">Achieved</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {budgetsLoading ? "..." : achievedCount}
                    </span>
                  </Link>

                  <Link
                    href="/budgets"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-blue-500/10 hover:border-blue-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-blue-600">Budget</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {budgetsLoading ? "..." : budgetsCount}
                    </span>
                  </Link>

                  <Link
                    href="/purchase-orders"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-3 text-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 group/box"
                  >
                    <span className="text-xs font-medium text-muted-foreground group-hover/box:text-emerald-600">Committed</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                      {budgetsLoading ? "..." : committedCount}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Sub-indicator */}
              <div className="mt-5 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-violet-500" />
                  <span>Planned: <strong className="text-foreground font-semibold">{formatMoney(totalPlannedBudget)}</strong></span>
                </div>
                <Link href="/reports/profit-loss" className="flex items-center gap-1 font-medium text-violet-600 hover:underline">
                  <span>P&L Statement</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Card 4: Accounting & Journals */}
          {(activeTab === "all" || activeTab === "account") && (
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/40">
              <div className="flex flex-col gap-4">
                {/* Header with Title and "Manage" Action Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <BookOpen className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-foreground">Accounting & Journals</h2>
                      <p className="text-xs text-muted-foreground">General ledger & journal entries</p>
                    </div>
                  </div>
                  <Link href="/journal-entries">
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-2xs font-medium px-3.5"
                    >
                      <Plus className="size-3.5" />
                      <span>New Entry</span>
                    </Button>
                  </Link>
                </div>

                {/* 4 Metric Pills (Journals, Total Entries, Accounts, Budgets) */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <Link
                    href="/journals"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-2.5 text-center transition-all hover:bg-amber-500/10 hover:border-amber-500/30 group/box"
                  >
                    <span className="text-[11px] font-medium text-muted-foreground group-hover/box:text-amber-600">Journals</span>
                    <span className="text-lg font-bold tracking-tight text-foreground mt-0.5">
                      {journalsLoading ? "..." : journalsCount}
                    </span>
                  </Link>

                  <Link
                    href="/journal-entries"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-2.5 text-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 group/box"
                  >
                    <span className="text-[11px] font-medium text-muted-foreground group-hover/box:text-emerald-600">Entries</span>
                    <span className="text-lg font-bold tracking-tight text-foreground mt-0.5">
                      {entriesLoading ? "..." : entriesCount}
                    </span>
                  </Link>

                  <Link
                    href="/accounts"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-2.5 text-center transition-all hover:bg-blue-500/10 hover:border-blue-500/30 group/box"
                  >
                    <span className="text-[11px] font-medium text-muted-foreground group-hover/box:text-blue-600">Accounts</span>
                    <span className="text-lg font-bold tracking-tight text-foreground mt-0.5">
                      {accountsLoading ? "..." : accountsCount}
                    </span>
                  </Link>

                  <Link
                    href="/budgets"
                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 p-2.5 text-center transition-all hover:bg-violet-500/10 hover:border-violet-500/30 group/box"
                  >
                    <span className="text-[11px] font-medium text-muted-foreground group-hover/box:text-violet-600">Budgets</span>
                    <span className="text-lg font-bold tracking-tight text-foreground mt-0.5">
                      {budgetsLoading ? "..." : budgetsCount}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Sub-indicator */}
              <div className="mt-5 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Activity className="size-3.5 text-amber-500" />
                  <span>Double-Entry Balance: <strong className="text-emerald-600 font-semibold">In Balance</strong></span>
                </div>
                <Link href="/accounts" className="flex items-center gap-1 font-medium text-amber-600 hover:underline">
                  <span>Chart of Accounts</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deep-dive Tab Specific Highlights */}
      {activeTab === "sales" && (
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Recent Sales Activity</h3>
              <p className="text-xs text-muted-foreground">Latest customer orders awaiting delivery or payment</p>
            </div>
            <Link href="/sales-orders">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>View All Orders</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col divide-y">
            {salesOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 font-semibold text-xs">
                    SO
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.soNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.customer?.name || "Customer"} · {order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={order.status === "CONFIRMED" ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {formatMoney(order.items.reduce((s, it) => s + it.quantity * Number(it.unitPrice) + Number(it.tax), 0))}
                  </span>
                </div>
              </div>
            ))}
            {salesOrders.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No sales orders found.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "purchase" && (
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Recent Purchase Activity</h3>
              <p className="text-xs text-muted-foreground">Latest procurement orders with suppliers</p>
            </div>
            <Link href="/purchase-orders">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>View All POs</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col divide-y">
            {purchaseOrders.slice(0, 4).map((po) => (
              <div key={po.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold text-xs">
                    PO
                  </div>
                  <div>
                    <p className="text-sm font-medium">{po.poNumber}</p>
                    <p className="text-xs text-muted-foreground">{po.vendor?.name || "Vendor"} · {po.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={po.status === "CONFIRMED" ? "default" : "secondary"}>
                    {po.status}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {formatMoney(po.items.reduce((s, it) => s + it.quantity * Number(it.unitPrice), 0))}
                  </span>
                </div>
              </div>
            ))}
            {purchaseOrders.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No purchase orders found.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "report" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/reports/balance-sheet"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex flex-col gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity className="size-5" />
              </div>
              <h4 className="font-semibold tracking-tight text-foreground">Balance Sheet</h4>
              <p className="text-xs text-muted-foreground">Assets, Liabilities & Equity equation at a specific date.</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              <span>Generate Statement</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/reports/profit-loss"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex flex-col gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="size-5" />
              </div>
              <h4 className="font-semibold tracking-tight text-foreground">Profit & Loss</h4>
              <p className="text-xs text-muted-foreground">Revenue, Cost of Goods Sold, and Net Operating Income.</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span>View P&L Report</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/reports/budget-report"
            className="group flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex flex-col gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <PieChart className="size-5" />
              </div>
              <h4 className="font-semibold tracking-tight text-foreground">Budget vs Actual</h4>
              <p className="text-xs text-muted-foreground">Analytic account variances and planned spending limits.</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-violet-600">
              <span>Track Budget Report</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      )}

      {/* Section 2: Complete Module Directory & Navigation Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">System Navigation & Modules</h2>
            <p className="text-xs text-muted-foreground">Quick access to all operational areas and master data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {moduleCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div
                key={category.title}
                className={`group flex flex-col justify-between rounded-2xl border bg-card shadow-sm transition-all duration-200 ${category.borderColor} hover:shadow-md`}
              >
                <div>
                  <div className="flex items-start gap-3.5 border-b p-5">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${category.bgColor}`}>
                      <CategoryIcon className={`size-5 ${category.color}`} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-semibold tracking-tight text-sm">{category.title}</h3>
                      <p className="text-xs text-muted-foreground leading-snug">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col p-2">
                    {category.links.map((link) => {
                      const LinkIcon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="group/link flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-colors hover:bg-muted"
                        >
                          <LinkIcon className="size-3.5 text-muted-foreground group-hover/link:text-foreground" />
                          <span className="flex-1 text-muted-foreground group-hover/link:text-foreground">
                            {link.label}
                          </span>
                          <ArrowRight className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick "New Sales Order" Dialog Modal */}
      <Dialog open={isSalesDialogOpen} onOpenChange={setIsSalesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Sales Order</DialogTitle>
            <DialogDescription>
              Draft a new sales order with line items and taxes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <SalesOrderForm
              onSuccess={() => {
                setIsSalesDialogOpen(false);
                refetchSales();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick "New Purchase Order" Dialog Modal */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
            <DialogDescription>
              Draft a new purchase order for supplier goods and raw materials.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <PurchaseOrderForm
              onSuccess={() => {
                setIsPurchaseDialogOpen(false);
                refetchPurchase();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
