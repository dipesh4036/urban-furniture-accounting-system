import Link from "next/link";

// Placeholder nav links for the staff dashboard. Matches the page list in
// plan.md. Just static links for now - no active-link highlighting, no
// role-based show/hide yet. That comes later once auth is wired up.
const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Contacts", href: "/contacts" },
  { label: "Products", href: "/products" },
  { label: "Chart of Accounts", href: "/accounts" },
  { label: "Journals", href: "/journals" },
  { label: "Journal Entries", href: "/journal-entries" },
  { label: "Purchase Orders", href: "/purchase-orders" },
  { label: "Vendor Bills", href: "/vendor-bills" },
  { label: "Sales Orders", href: "/sales-orders" },
  { label: "Invoices", href: "/invoices" },
  { label: "Budgets", href: "/budgets" },
  { label: "Reports", href: "/reports" },
  { label: "Users", href: "/users" },
];

// Layout for every authenticated staff page (Admin/Accountant), e.g.
// /contacts, /products, /reports/balance-sheet. Just the visual shell -
// sidebar on the left, topbar on top, page content in the middle.
// No data fetching and no auth check here yet - that's added when the
// auth feature is wired up.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r bg-background">
        <div className="flex h-16 items-center border-b px-6 font-semibold">Urban Furniture</div>
        <nav className="flex flex-col gap-1 p-4">
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
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <span className="text-sm text-muted-foreground">Dashboard</span>
          <span className="text-sm text-muted-foreground">Account</span>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
