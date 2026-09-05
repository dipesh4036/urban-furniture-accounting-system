"use client";

import React from "react";
import { cn } from "cn";

export interface StatusBadgeProps {
  status: string | boolean | null | undefined;
  label?: string;
  showDot?: boolean;
  className?: string;
  size?: "sm" | "default";
}

function normalizeStatus(status: string | boolean | null | undefined): string {
  if (status === true) return "ACTIVE";
  if (status === false) return "INACTIVE";
  if (!status) return "UNKNOWN";
  return String(status).toUpperCase().trim();
}

function formatStatusLabel(status: string | boolean | null | undefined, customLabel?: string): string {
  if (customLabel) return customLabel;
  const raw = normalizeStatus(status);
  
  // Custom readable mappings
  const labelMap: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DRAFT: "Draft",
    CONFIRMED: "Confirmed",
    BILLED: "Billed",
    PAID: "Paid",
    POSTED: "Posted",
    CANCELLED: "Cancelled",
    VOID: "Void",
    PENDING: "Pending",
    OVERDUE: "Overdue",
    PARTIALLY_PAID: "Partially Paid",
    ACTIVATION_PENDING: "Activation Pending",
    CUSTOMER: "Customer",
    VENDOR: "Vendor",
    BOTH: "Customer & Vendor",
    ADMIN: "Admin",
    ACCOUNTANT: "Accountant",
    PORTAL: "Portal User",
    GOODS: "Goods (Storable)",
    SERVICE: "Service",
    SALE: "Sales",
    PURCHASE: "Purchase",
    BANK: "Bank",
    CASH: "Cash",
    GENERAL: "Miscellaneous",
    ASSET: "Asset",
    LIABILITY: "Liability",
    EQUITY: "Equity",
    INCOME: "Income",
    EXPENSE: "Expense",
    COST: "Cost Center",
    REVENUE: "Revenue Center",
  };

  if (labelMap[raw]) {
    return labelMap[raw];
  }

  // Fallback: title case snake/kebab case
  return raw
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BadgeStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

function getBadgeStyle(statusKey: string): BadgeStyle {
  switch (statusKey) {
    // Success / Green
    case "PAID":
    case "BILLED":
    case "POSTED":
    case "ACTIVE":
    case "CONFIRMED":
    case "REVENUE":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/50",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200/80 dark:border-emerald-800/60",
        dot: "bg-emerald-500",
      };

    // Primary / Blue
    case "ADMIN":
    case "CUSTOMER":
    case "SALE":
    case "BANK":
    case "ASSET":
    case "INCOME":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/50",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200/80 dark:border-blue-800/60",
        dot: "bg-blue-500",
      };

    // Warning / Amber
    case "PENDING":
    case "PARTIALLY_PAID":
    case "ACTIVATION_PENDING":
    case "OVERDUE":
    case "EXPENSE":
    case "COST":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/50",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200/80 dark:border-amber-800/60",
        dot: "bg-amber-500",
      };

    // Indigo / Purple
    case "BOTH":
    case "ACCOUNTANT":
    case "SERVICE":
    case "LIABILITY":
    case "EQUITY":
      return {
        bg: "bg-indigo-50 dark:bg-indigo-950/50",
        text: "text-indigo-700 dark:text-indigo-300",
        border: "border-indigo-200/80 dark:border-indigo-800/60",
        dot: "bg-indigo-500",
      };

    // Cyan / Teal
    case "VENDOR":
    case "PURCHASE":
    case "CASH":
    case "GOODS":
      return {
        bg: "bg-cyan-50 dark:bg-cyan-950/50",
        text: "text-cyan-700 dark:text-cyan-300",
        border: "border-cyan-200/80 dark:border-cyan-800/60",
        dot: "bg-cyan-500",
      };

    // Danger / Rose
    case "CANCELLED":
    case "VOID":
    case "INACTIVE":
    case "FAILED":
    case "REJECTED":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/50",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-200/80 dark:border-rose-800/60",
        dot: "bg-rose-500",
      };

    // Neutral / Slate / Gray (Draft, Unknown)
    case "DRAFT":
    case "GENERAL":
    default:
      return {
        bg: "bg-slate-100 dark:bg-slate-800/70",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700/60",
        dot: "bg-slate-400 dark:bg-slate-500",
      };
  }
}

export function StatusBadge({
  status,
  label,
  showDot = true,
  className = "",
  size = "default",
}: StatusBadgeProps) {
  const norm = normalizeStatus(status);
  const displayLabel = formatStatusLabel(status, label);
  const style = getBadgeStyle(norm);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap transition-colors select-none",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            size === "sm" ? "size-1.5" : "size-1.5",
            style.dot
          )}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
