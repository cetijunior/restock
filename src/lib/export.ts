import type { OrderLine } from "./types";
import { dateLabel, lek } from "./format";

type Doc = { lines: OrderLine[]; supplier: string; note: string; createdAt?: number };

const groupByCategory = (lines: OrderLine[]) => {
  const m = new Map<string, OrderLine[]>();
  for (const l of lines) m.set(l.category, [...(m.get(l.category) ?? []), l]);
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b, "sq"));
};

const totalOf = (lines: OrderLine[]) => lines.reduce((s, l) => s + l.buy * l.qty, 0);

export function toText({ lines, supplier, note, createdAt = Date.now() }: Doc) {
  const out = [`*Market Lami — Porosi furnizimi*`, dateLabel(createdAt)];
  if (supplier) out.push(`Furnitori: ${supplier}`);
  for (const [cat, ls] of groupByCategory(lines)) {
    out.push("", `_${cat}_`);
    for (const l of ls) out.push(`• ${l.qty} × ${l.name}`);
  }
  out.push("", `Artikuj: ${lines.length} · Copë: ${lines.reduce((s, l) => s + l.qty, 0)}`);
  out.push(`Totali (blerje): ${lek(totalOf(lines))}`);
  if (note) out.push("", `Shënim: ${note}`);
  return out.join("\n");
}

export async function toPdf({ lines, supplier, note, createdAt = Date.now() }: Doc) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, w, 4, "F");
  doc.setFont("helvetica", "bold").setFontSize(20).text("Market Lami", 14, 20);
  doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(110);
  doc.text("Lista e furnizimit", 14, 27);
  doc.text(dateLabel(createdAt), w - 14, 20, { align: "right" });
  if (supplier) doc.text(`Furnitori: ${supplier}`, w - 14, 27, { align: "right" });
  doc.setTextColor(0);

  const body: (string | { content: string; colSpan: number; styles: object })[][] = [];
  for (const [cat, ls] of groupByCategory(lines)) {
    body.push([{ content: cat.toUpperCase(), colSpan: 4, styles: { fillColor: [240, 244, 242], fontStyle: "bold", fontSize: 8, textColor: 90 } }]);
    for (const l of ls) body.push([l.name, String(l.qty), lek(l.buy), lek(l.buy * l.qty)]);
  }
  autoTable(doc, {
    startY: 34,
    head: [["Produkti", "Sasia", "Çmimi", "Totali"]],
    body,
    theme: "plain",
    headStyles: { fillColor: [12, 15, 14], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 2.5 },
    columnStyles: { 1: { halign: "center", cellWidth: 20 }, 2: { halign: "right", cellWidth: 30 }, 3: { halign: "right", cellWidth: 34, fontStyle: "bold" } },
    didDrawCell: (d) => {
      if (d.section === "body") doc.setDrawColor(230).line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
    },
  });
  let y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold").setFontSize(14).text(`Totali: ${lek(totalOf(lines))}`, w - 14, y, { align: "right" });
  if (note) {
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(90);
    doc.text(doc.splitTextToSize(`Shënim: ${note}`, w - 28), 14, (y += 10));
  }
  const stamp = new Date(createdAt).toISOString().slice(0, 10);
  doc.save(`Furnizim_${supplier ? supplier.replace(/\W+/g, "_") + "_" : ""}${stamp}.pdf`);
}

export async function share(text: string) {
  if (navigator.share) {
    try { await navigator.share({ text }); return "shared"; } catch { /* cancelled */ }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

export const whatsapp = (text: string) => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");

export function downloadJson(data: unknown, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
