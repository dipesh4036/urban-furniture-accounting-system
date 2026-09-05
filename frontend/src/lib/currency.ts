export const CURRENCY_CODE = "INR";
export const CURRENCY_SYMBOL = "₹";

/**
 * Format a numeric or string value as Indian Rupees (INR) with the ₹ symbol.
 * Example: formatCurrency(125000) => "₹1,25,000.00"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  if (amount === null || amount === undefined || amount === "") {
    return options?.showSymbol !== false ? "₹0.00" : "0.00";
  }

  const num = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(num)) {
    return options?.showSymbol !== false ? "₹0.00" : "0.00";
  }

  const minDigits = options?.minimumFractionDigits ?? 2;
  const maxDigits = options?.maximumFractionDigits ?? 2;

  const formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  return options?.showSymbol !== false ? `₹${formatted}` : formatted;
}

/**
 * Format a numeric or string value as INR for PDF reports (where ASCII/standard text is preferred for font compatibility)
 * Example: formatPdfCurrency(125000) => "INR 1,25,000.00"
 */
export function formatPdfCurrency(
  amount: number | string | null | undefined,
  prefix: string = "INR "
): string {
  if (amount === null || amount === undefined || amount === "") {
    return `${prefix}0.00`;
  }

  const num = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(num)) {
    return `${prefix}0.00`;
  }

  return `${prefix}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
