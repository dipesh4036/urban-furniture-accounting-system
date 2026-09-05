"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, Home, HelpCircle, Layers, ShieldAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";


export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16 sm:px-6 lg:px-8">
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl text-center flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border/80 shadow-sm bg-card">
            <Image
              src="/logo.jpg"
              alt="Urban Furniture Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            URBAN FURNITURE
          </span>
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4">
          <ShieldAlert className="size-3.5" />
          <span>Error 404 • Resource Not Found</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Lost in the Ledgers?
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          The financial document, ledger entry, or accounting route you requested cannot be located or has been archived.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-md">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "default", size: "lg", className: "w-full sm:w-auto gap-2" })}
          >
            <Home className="size-4" />
            Back to Dashboard
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
          >
            <ArrowLeft className="size-4" />
            Previous Page
          </Button>
        </div>


        {/* Quick Navigation Cards */}
        <div className="mt-12 w-full border-t border-border/60 pt-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Popular Destinations
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <Link
              href="/invoices"
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/50 hover:border-border transition-colors group"
            >
              <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">Invoices</p>
                <p className="text-[11px] text-muted-foreground truncate">Customer billing</p>
              </div>
            </Link>

            <Link
              href="/accounts"
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/50 hover:border-border transition-colors group"
            >
              <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
                <Layers className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">Chart of Accounts</p>
                <p className="text-[11px] text-muted-foreground truncate">General ledger</p>
              </div>
            </Link>

            <Link
              href="/reports/balance-sheet"
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/50 hover:border-border transition-colors group"
            >
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 group-hover:scale-105 transition-transform">
                <BookOpen className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">Financial Reports</p>
                <p className="text-[11px] text-muted-foreground truncate">Balance Sheet & P&L</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Support Info */}
        <p className="mt-8 text-xs text-muted-foreground/80">
          Need assistance? Sign in to the{" "}
          <Link href="/portal/login" className="underline underline-offset-4 hover:text-foreground">
            Customer Portal
          </Link>{" "}
          or contact your system administrator.
        </p>
      </div>
    </div>
  );
}
