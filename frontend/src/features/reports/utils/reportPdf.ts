import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

// Shared by all three report pages, so each one doesn't have to repeat
// the same "make a doc, print a title, add a table" boilerplate.

// Starts a new PDF with a title and subtitle at the top (e.g. the report
// name and the date/period it covers).
export function createReportDoc(title: string, subtitle: string) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(subtitle, 14, 25);
  doc.setTextColor(0);

  return doc;
}

// Adds one table to the doc (a report section, e.g. "Assets") starting
// at the given y position, and returns the y position right after it -
// so the next section/table knows where to start.
export function addReportTable(
  doc: jsPDF,
  startY: number,
  head: string[],
  body: (string | number)[][]
): number {
  autoTable(doc, {
    startY,
    head: [head],
    body,
    theme: "striped",
    headStyles: { fillColor: [39, 39, 42] },
    styles: { fontSize: 10 },
  });

  // jspdf-autotable stores where the table ended on the doc itself.
  return getFinalY(doc);
}

// Reads the y position where the last table added to this doc ended -
// useful for placing something (like a highlighted total) right below
// the last table, without hardcoding a guessed y value.
export function getFinalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}
