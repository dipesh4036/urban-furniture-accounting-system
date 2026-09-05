import { jsPDF } from "jspdf";
import { autoTable, UserOptions } from "jspdf-autotable";

export interface KpiCard {
  label: string;
  value: string;
  subtext?: string;
  variant?: "default" | "success" | "warning" | "danger";
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
  doc.roundedRect(x, y, 13, 13, 2, 2, "F");
  doc.setTextColor(212, 160, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("UF", x + 3.2, y + 8.8);
}

/**
 * Initializes an enterprise-grade financial report PDF with:
 * - Top corporate brand ribbon & accent gold highlight
 * - High-resolution Urban Furniture logo mark
 * - Company header & metadata
 * - Styled report title & period
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
  const rightX = pageWidth - 14;

  // 1. Top Corporate Brand Ribbon
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, pageWidth, 4, "F");
  doc.setFillColor(202, 138, 4); // warm gold
  doc.rect(14, 0, 32, 4, "F");

  // 2. Brand Logo & Company Info (Y: 10 - 24)
  const logoData = await loadLogoBase64();
  if (logoData) {
    try {
      doc.addImage(logoData, "JPEG", 14, 10, 13, 13);
    } catch {
      drawVectorLogo(doc, 14, 10);
    }
  } else {
    drawVectorLogo(doc, 14, 10);
  }

  // Company Name & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(24, 24, 27);
  doc.text("URBAN FURNITURE", 30, 15.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text("Enterprise Financial Intelligence", 30, 20.5);

  // Corporate Metadata (Right aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("OFFICIAL FINANCIAL RECORD", rightX, 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(113, 113, 122);
  const printDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.text(`Generated: ${printDate}`, rightX, 18, { align: "right" });
  doc.text("US GAAP • Accrual Basis • Currency: USD ($)", rightX, 22, { align: "right" });

  // Thin Divider Line
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.35);
  doc.line(14, 26, rightX, 26);

  // 3. Report Title Block (Y: 33 - 44)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, 14, 40);

  let currentY = 46;

  // 4. Executive KPI Summary Cards
  if (options?.kpiCards && options.kpiCards.length > 0) {
    currentY = addKpiCards(doc, currentY, options.kpiCards);
  }

  // Store starting Y for the first table
  (doc as any).contentStartY = currentY;

  return doc;
}

/**
 * Renders high-impact executive summary KPI cards with strict boundary clipping
 * so text can never overflow or overlap with adjacent cards.
 */
export function addKpiCards(doc: jsPDF, startY: number, cards: KpiCard[]): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 14;
  const rightMargin = 14;
  const totalWidth = pageWidth - leftMargin - rightMargin; // 182mm
  const gap = 3;
  const cardCount = Math.min(cards.length, 4);
  const cardWidth = (totalWidth - gap * (cardCount - 1)) / cardCount;
  const cardHeight = 18;
  const maxTextWidth = cardWidth - 8; // Leave 4mm on left, 4mm on right

  cards.slice(0, 4).forEach((card, index) => {
    const x = leftMargin + index * (cardWidth + gap);

    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 1.5, 1.5, "FD");

    // Left accent pill
    let pillColor = [148, 163, 184];
    if (card.variant === "success") pillColor = [16, 185, 129];
    else if (card.variant === "warning") pillColor = [245, 158, 11];
    else if (card.variant === "danger") pillColor = [239, 68, 68];

    doc.setFillColor(pillColor[0], pillColor[1], pillColor[2]);
    doc.rect(x, startY + 2.5, 1.5, cardHeight - 5, "F");

    // Label with strict maxWidth
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label.toUpperCase(), x + 4, startY + 5.5, { maxWidth: maxTextWidth });

    // Value with strict maxWidth
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    if (card.variant === "success") {
      doc.setTextColor(15, 118, 110);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(card.value, x + 4, startY + 11.2, { maxWidth: maxTextWidth });

    // Subtext with strict maxWidth
    if (card.subtext) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(card.subtext, x + 4, startY + 15.2, { maxWidth: maxTextWidth });
    }
  });

  return startY + cardHeight + 7;
}

/**
 * Draws a clean section heading with an accent indicator before a table.
 * If subtitle is provided, it is rendered on its own line beneath the title
 * to completely eliminate horizontal text collisions.
 */
export function addSectionHeading(doc: jsPDF, y: number, title: string, subtitle?: string): number {
  doc.setFillColor(24, 24, 27);
  doc.rect(14, y, 2.5, 5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text(title.toUpperCase(), 18.5, y + 4);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(113, 113, 122);
    doc.text(subtitle, 18.5, y + 8.5);
    return y + 11;
  }

  return y + 7;
}

/**
 * Adds an enterprise-formatted table to the PDF document.
 * Automatically guards against orphan headings and footer collisions.
 */
export function addReportTable(
  doc: jsPDF,
  startY: number,
  head: string[],
  body: (string | number)[][],
  options?: AddTableOptions
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  let tableStartY = startY;

  // If remaining space on the current page is insufficient for a heading + 2 rows,
  // push to a clean new page before drawing the section heading.
  if (tableStartY + 35 > pageHeight - 20) {
    doc.addPage();
    tableStartY = 16;
  }

  if (options?.sectionTitle) {
    tableStartY = addSectionHeading(doc, tableStartY, options.sectionTitle, options.sectionSubtitle);
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
    margin: { left: 14, right: 14, bottom: 18, top: 16 },
    headStyles: {
      fillColor: [24, 24, 27], // Dark slate
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 2.8, bottom: 2.8, left: 3, right: 3 },
    },
    bodyStyles: {
      textColor: [39, 39, 42],
      fontSize: 7.8,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: [228, 228, 231],
      lineWidth: 0.15,
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
        data.cell.styles.fontSize = 8;
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

  let y = startY + 8;
  // If not enough space for certification paragraph and signature lines, create new page
  if (y + 36 > pageHeight - 20) {
    doc.addPage();
    y = 18;
  }

  // Certification note with controlled wrapping
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "CERTIFICATION: This statement has been generated from the Urban Furniture General Ledger in accordance with standard double-entry accounting principles and accurately represents verified ledger transactions as of the reporting date.",
    14,
    y,
    { maxWidth: pageWidth - 28 }
  );

  y += 10;

  // Sign-off columns
  // Left: Controller / Accounting
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.line(14, y + 6, 85, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("PREPARED BY: Senior Accountant / Controller", 14, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Verified from Ledger Records", 14, y + 13.5);

  // Right: Management / Executive
  const rightColX = 125;
  doc.line(rightColX, y + 6, pageWidth - 14, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("APPROVED BY: Chief Financial Officer / Auditor", rightColX, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Official Financial Endorsement", rightColX, y + 13.5);

  return y + 16;
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
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 13, pageWidth - 14, pageHeight - 13);

    // Left security notice
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Urban Furniture Inc. • Confidential Financial Report • Official General Ledger Record",
      14,
      pageHeight - 8.5
    );

    // Center timestamp
    doc.text(
      `Printed: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`,
      pageWidth / 2,
      pageHeight - 8.5,
      { align: "center" }
    );

    // Right Page Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 8.5, { align: "right" });
  }

  doc.save(filename);
}

/**
 * Reads the y position where the last autoTable ended.
 */
export function getFinalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 32;
}
