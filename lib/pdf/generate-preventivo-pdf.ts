import { jsPDF } from "jspdf";
import type { Preventivo } from "@/lib/supabase/client";

const GREEN: [number, number, number] = [34, 197, 94];
const DARK: [number, number, number] = [15, 15, 15];
const GRAY: [number, number, number] = [107, 114, 128];
const LIGHT: [number, number, number] = [245, 245, 245];

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch("/logo-preventivpro.svg");
    if (!response.ok) return null;

    const svgText = await response.text();
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 560;
        canvas.height = 128;
        const context = canvas.getContext("2d");
        if (!context) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0, 560, 128);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      image.src = objectUrl;
    });
  } catch {
    return null;
  }
}

function drawLogoFallback(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(...GREEN);
  doc.roundedRect(x, y, 14, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text("P", x + 4.2, y + 10);
  doc.setFontSize(18);
  doc.setTextColor(...GREEN);
  doc.text("PreventivPRO", x + 18, y + 10.5);
}

export async function generatePreventivoPdf(preventivo: Preventivo) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageWidth, 48, "F");

  const logo = await loadLogoDataUrl();
  if (logo) {
    doc.addImage(logo, "PNG", margin, 14, 62, 14);
  } else {
    drawLogoFallback(doc, margin, 16);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(220, 220, 220);
  doc.text("PREVENTIVO", pageWidth - margin, 22, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 160);
  const dateLabel = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
  }).format(new Date());
  doc.text(`N° ${preventivo.id} · ${dateLabel}`, pageWidth - margin, 30, {
    align: "right",
  });

  let y = 62;

  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, "F");
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("CLIENTE", margin + 8, y + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...DARK);
  doc.text(preventivo.cliente, margin + 8, y + 20);

  y += 38;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("DESCRIZIONE LAVORO", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(55, 55, 55);
  const descriptionLines = doc.splitTextToSize(preventivo.descrizione, contentWidth);
  doc.text(descriptionLines, margin, y);
  y += descriptionLines.length * 6 + 14;

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setFillColor(...DARK);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text("TOTALE PREVENTIVO", margin + 10, y + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...GREEN);
  doc.text(euroFormatter.format(preventivo.prezzo), pageWidth - margin - 10, y + 19, {
    align: "right",
  });

  y += 40;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    "Documento generato automaticamente da PreventivPRO.",
    margin,
    y
  );
  doc.text("Valido salvo diversa indicazione scritta.", margin, y + 5);

  const safeName = preventivo.cliente
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/gi, "");

  doc.save(`preventivo-${safeName || "cliente"}-${preventivo.id}.pdf`);
}
