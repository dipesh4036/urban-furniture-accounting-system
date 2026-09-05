"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, Receipt, FileText, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { logout } from "@/features/auth/services/auth.service";

const portalNavLinks = [
  { label: "My Invoices", href: "/portal/invoices", icon: Receipt },
  { label: "My Bills", href: "/portal/bills", icon: FileText },
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "CONTACT")) {
      router.push("/portal/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/portal/login");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "CONTACT") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Top Navigation Shell */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/portal/invoices" className="flex items-center gap-3 group">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/50 shadow-xs">
                <Image
                  src="/logo.jpg"
                  alt="Urban Furniture Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
                  Urban Furniture
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">Partner Portal</span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center gap-1 ml-4 border-l border-border pl-6">
              {portalNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info and Sign out */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground leading-none">{user.name}</span>
                {"type" in user && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 uppercase font-semibold">
                    {user.type}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-0.5">{user.email}</span>
            </div>

            <div className="size-9 rounded-full bg-secondary text-secondary-foreground border border-border flex items-center justify-center text-xs font-semibold">
              {initialsFor(user.name)}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sign out"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline ml-1.5">Sign out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Sub-Nav */}
        <div className="sm:hidden border-t border-border px-4 py-2 flex items-center gap-2 bg-background">
          {portalNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
