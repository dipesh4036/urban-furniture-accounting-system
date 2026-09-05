import { jsPDF } from "jspdf";
import { autoTable, UserOptions } from "jspdf-autotable";

export interface KpiCard {
  label: string;
  value: string;
  subtext?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export interface ReportDocOptions {
  title: string;
  subtitle: string;
  category?: string;
  asOfDate?: string;
  kpiCards?: KpiCard[];
}

export interface TableColumnConfig {
  align?: "left" | "center" | "right";
  width?: number;
}

export interface AddTableOptions {
  sectionTitle?: string;
  sectionSubtitle?: string;
  columnAlignments?: ("left" | "center" | "right")[];
  highlightTotalRow?: boolean;
}

/**
 * Loads the brand logo from /logo.jpg and converts it into a Base64 data URL.
 * Falls back gracefully to null if running in an environment without browser fetch.
 */
async function loadLogoBase64(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/logo.jpg");
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Fallback vector badge if logo image cannot be loaded.
 */
function drawVectorLogo(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(x, y, 14, 14, 2.5, 2.5, "F");
  doc.setTextColor(212, 160, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("UF", x + 3.5, y + 9.5);
}

/**
 * Initializes an enterprise-grade financial report PDF with:
 * - Top corporate brand ribbon & accent gold highlight
 * - High-resolution Urban Furniture logo mark
 * - Company header & metadata (GAAP/Accrual standard, timestamp, currency)
 * - Styled report title & period pill
 * - Optional Executive KPI Summary cards
 */
export async function createReportDoc(
  title: string,
  subtitle: string,
  options?: {
    category?: string;
    kpiCards?: KpiCard[];
  }
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm

  // 1. Top Corporate Brand Bar
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, pageWidth, 4.5, "F");
  // Golden architectural accent strip
  doc.setFillColor(202, 138, 4); // warm gold / amber
  doc.rect(14, 0, 36, 4.5, "F");

  // 2. Brand Logo & Company Info (Y: 11 - 25)
  const logoData = await loadLogoBase64();
  if (logoData) {
    try {
      doc.addImage(logoData, "JPEG", 14, 11, 14, 14);
    } catch {
      drawVectorLogo(doc, 14, 11);
    }
  } else {
    drawVectorLogo(doc, 14, 11);
  }

  // Company Name & Tagline
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(24, 24, 27);
  doc.text("URBAN FURNITURE", 32, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text("Accounting & Enterprise Financial Intelligence", 32, 22);

  // Corporate Metadata (Right aligned)
  const rightX = pageWidth - 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(161, 161, 170);
  doc.text("OFFICIAL FINANCIAL RECORD", rightX, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(113, 113, 122);
  const printDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.text(`Generated: ${printDate} • Standard: US GAAP / Accrual`, rightX, 19.5, { align: "right" });
  doc.text("Reporting Currency: USD ($)", rightX, 23.5, { align: "right" });

  // Thin Divider Line
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.4);
  doc.line(14, 28, rightX, 28);

  // 3. Report Title Block (Y: 34 - 44)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 37);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, 14, 43);

  let currentY = 48;

  // 4. Executive KPI Summary Cards
  if (options?.kpiCards && options.kpiCards.length > 0) {
    currentY = addKpiCards(doc, currentY, options.kpiCards);
  }

  return doc;
}

/**
 * Renders high-impact executive summary KPI cards side-by-side
 */
export function addKpiCards(doc: jsPDF, startY: number, cards: KpiCard[]): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 14;
  const rightMargin = 14;
  const totalWidth = pageWidth - leftMargin - rightMargin; // 182mm
  const gap = 3.5;
  const cardCount = Math.min(cards.length, 4);
  const cardWidth = (totalWidth - gap * (cardCount - 1)) / cardCount;
  const cardHeight = 18;

  cards.slice(0, 4).forEach((card, index) => {
    const x = leftMargin + index * (cardWidth + gap);

    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, "FD");

    // Left accent pill
    let pillColor = [148, 163, 184]; // default slate
    if (card.variant === "success") pillColor = [16, 185, 129];
    else if (card.variant === "warning") pillColor = [245, 158, 11];
    else if (card.variant === "danger") pillColor = [239, 68, 68];

    doc.setFillColor(pillColor[0], pillColor[1], pillColor[2]);
    doc.rect(x, startY + 2.5, 1.8, cardHeight - 5, "F");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label.toUpperCase(), x + 4.5, startY + 5.5);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    if (card.variant === "success") {
      doc.setTextColor(15, 118, 110);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(card.value, x + 4.5, startY + 11.5);

    // Subtext
    if (card.subtext) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(card.subtext, x + 4.5, startY + 15.5);
    }
  });

  return startY + cardHeight + 6;
}

/**
 * Draws a clean section heading with an accent indicator before a table
 */
export function addSectionHeading(doc: jsPDF, y: number, title: string, subtitle?: string): number {
  doc.setFillColor(24, 24, 27);
  doc.rect(14, y, 2.5, 5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(24, 24, 27);
  doc.text(title.toUpperCase(), 18.5, y + 4);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(113, 113, 122);
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    doc.text(`—  ${subtitle}`, 21 + titleWidth, y + 4);
  }

  return y + 7;
}

/**
 * Adds an enterprise-formatted table to the PDF document with:
 * - Dark charcoal high-contrast header styling
 * - Auto column alignments (numbers right-aligned, text left-aligned)
 * - Subtle alternating zebra striping
 * - Highlighted total row if specified or detected
 */
export function addReportTable(
  doc: jsPDF,
  startY: number,
  head: string[],
  body: (string | number)[][],
  options?: AddTableOptions
): number {
  let tableStartY = startY;
  if (options?.sectionTitle) {
    tableStartY = addSectionHeading(doc, startY, options.sectionTitle, options.sectionSubtitle);
  }

  // Construct columnStyles based on alignments
  const columnStyles: Record<number, { halign: "left" | "center" | "right" }> = {};
  if (options?.columnAlignments) {
    options.columnAlignments.forEach((align, colIdx) => {
      columnStyles[colIdx] = { halign: align };
    });
  } else {
    // Default heuristic: last column or columns with currency/amounts right-aligned
    head.forEach((colName, colIdx) => {
      const lower = colName.toLowerCase();
      if (
        lower.includes("balance") ||
        lower.includes("amount") ||
        lower.includes("planned") ||
        lower.includes("actual") ||
        lower.includes("variance") ||
        lower.includes("price") ||
        lower.includes("total")
      ) {
        columnStyles[colIdx] = { halign: "right" };
      } else if (lower.includes("type") || lower.includes("period") || lower.includes("date") || lower.includes("status")) {
        columnStyles[colIdx] = { halign: "center" };
      } else {
        columnStyles[colIdx] = { halign: "left" };
      }
    });
  }

  const isTotalRow = (rowIdx: number): boolean => {
    if (options?.highlightTotalRow && rowIdx === body.length - 1) return true;
    const firstCell = String(body[rowIdx]?.[0] || "").toLowerCase();
    return firstCell.startsWith("total") || firstCell.startsWith("net ");
  };

  const autoTableOptions: UserOptions = {
    startY: tableStartY,
    head: [head],
    body,
    theme: "plain",
    margin: { left: 14, right: 14 },
    headStyles: {
      fillColor: [24, 24, 27], // Dark slate
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: {
      textColor: [39, 39, 42],
      fontSize: 8,
      cellPadding: { top: 2.8, bottom: 2.8, left: 3, right: 3 },
      lineColor: [228, 228, 231],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles,
    didParseCell: (data) => {
      if (data.section === "body" && isTotalRow(data.row.index)) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.textColor = [15, 23, 42];
        data.cell.styles.fontSize = 8.5;
      }
    },
  };

  autoTable(doc, autoTableOptions);
  return getFinalY(doc);
}

/**
 * Adds an official corporate certification and signature block
 */
export function addCertificationBlock(doc: jsPDF, startY: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // If not enough space on current page, create new page
  let y = startY + 8;
  if (y + 32 > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }

  // Certification note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "CERTIFICATION: This official statement has been prepared from the Urban Furniture General Ledger in compliance with standard double-entry accounting principles and reflects all verified journal postings as of the reporting date.",
    14,
    y,
    { maxWidth: pageWidth - 28 }
  );

  y += 14;

  // Sign-off columns
  // Left: Controller / Accounting
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, y + 8, 85, y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("PREPARED BY: Senior Accountant / Controller", 14, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Signature & Date Verified", 14, y + 15.5);

  // Right: Management / Executive
  const rightColX = 125;
  doc.line(rightColX, y + 8, pageWidth - 14, y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("APPROVED BY: Chief Financial Officer / Auditor", rightColX, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Signature & Date Certified", rightColX, y + 15.5);

  return y + 18;
}

/**
 * Applies a running footer with page numbering and security metadata to all pages,
 * then saves the document.
 */
export function finalizeReportDoc(doc: jsPDF, filename: string): void {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.35);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    // Left security notice
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Urban Furniture Inc. • Confidential Financial Report • Official General Ledger Record",
      14,
      pageHeight - 9
    );

    // Center timestamp
    doc.text(
      `Printed: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`,
      pageWidth / 2,
      pageHeight - 9,
      { align: "center" }
    );

    // Right Page Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 9, { align: "right" });
  }

  doc.save(filename);
}

/**
 * Reads the y position where the last autoTable ended.
 */
export function getFinalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 32;
}
