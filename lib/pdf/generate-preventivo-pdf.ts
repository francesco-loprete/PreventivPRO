import { jsPDF } from "jspdf";
import {
  BRAND_DARK_RGB,
  BRAND_GREEN_RGB,
  BRAND_ICON_PNG,
  BRAND_LOGO_PNG,
  BRAND_LOGO_SVG,
} from "@/lib/branding/constants";
import type { Preventivo } from "@/lib/types/preventivo";
import { getPreventivoTotale } from "@/lib/types/preventivo";
import { getStoredLogoDataUrl, loadSettings } from "@/lib/settings/storage";
import { downloadPdfBlob } from "@/lib/pdf/share-preventivo-pdf";

const GREEN: [number, number, number] = [...BRAND_GREEN_RGB];
const DARK: [number, number, number] = [...BRAND_DARK_RGB];
const GRAY: [number, number, number] = [107, 114, 128];
const LIGHT: [number, number, number] = [245, 245, 245];

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const HEADER_HEIGHT_MM = 48;
const LOGO_MAX_WIDTH_MM = 110;

function pxToMm(px: number): number {
  return px * 0.264583333;
}

function fitContain(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: maxWidth, height: maxHeight };
  }

  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
  return {
    width: naturalWidth * scale,
    height: naturalHeight * scale,
  };
}

function getImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) {
    return "JPEG";
  }
  if (dataUrl.startsWith("data:image/webp")) {
    return "WEBP";
  }
  return "PNG";
}

async function getImageNaturalSize(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
      });
    img.onerror = () => reject(new Error("Impossibile leggere il logo"));
    img.src = dataUrl;
  });
}

async function rasterizeToHighResPng(
  source: string,
  naturalWidth: number,
  naturalHeight: number
): Promise<string> {
  const scale = 3;
  const width = Math.max(Math.round(naturalWidth * scale), 1);
  const height = Math.max(Math.round(naturalHeight * scale), 1);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas non disponibile"));
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Rasterizzazione logo fallita"));
    img.src = source;
  });
}

async function prepareLogoForPdf(
  dataUrl: string
): Promise<{ dataUrl: string; width: number; height: number }> {
  const natural = await getImageNaturalSize(dataUrl);
  const isSvg = dataUrl.startsWith("data:image/svg");

  if (isSvg) {
    const png = await rasterizeToHighResPng(
      dataUrl,
      natural.width,
      natural.height
    );
    const rasterized = await getImageNaturalSize(png);
    return { dataUrl: png, width: rasterized.width, height: rasterized.height };
  }

  return { dataUrl, width: natural.width, height: natural.height };
}

async function drawHeaderLogo(
  doc: jsPDF,
  logoDataUrl: string,
  margin: number,
  maxWidthMm: number
): Promise<void> {
  const prepared = await prepareLogoForPdf(logoDataUrl);
  const maxHeightMm = pxToMm(80);

  const { width, height } = fitContain(
    prepared.width,
    prepared.height,
    maxWidthMm,
    maxHeightMm
  );

  const x = margin;
  const y = (HEADER_HEIGHT_MM - height) / 2;
  const format = getImageFormat(prepared.dataUrl);

  doc.addImage(
    prepared.dataUrl,
    format,
    x,
    y,
    width,
    height,
    undefined,
    "NONE"
  );
}

type VocePdf = {
  descrizione: string;
  quantita: number;
  unita: string;
  prezzo: number;
  totale: number;
};

function parseVociFromDescrizione(descrizione: string | null | undefined): VocePdf[] {
  if (!descrizione?.trim()) return [];

  const voci: VocePdf[] = [];

  for (const line of descrizione.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const withUnit =
      /^(.+?) \((\d+(?:[.,]\d+)?) (\S+) × €(\d+(?:[.,]\d+)?) = €(\d+(?:[.,]\d+)?)\)$/;
    const withoutUnit =
      /^(.+?) \((\d+(?:[.,]\d+)?) × €(\d+(?:[.,]\d+)?)(?: = €(\d+(?:[.,]\d+)?))?\)$/;

    const matchUnit = trimmed.match(withUnit);
    if (matchUnit) {
      voci.push({
        descrizione: matchUnit[1].trim(),
        quantita: Number(matchUnit[2].replace(",", ".")),
        unita: matchUnit[3],
        prezzo: Number(matchUnit[4].replace(",", ".")),
        totale: Number(matchUnit[5].replace(",", ".")),
      });
      continue;
    }

    const matchSimple = trimmed.match(withoutUnit);
    if (matchSimple) {
      const quantita = Number(matchSimple[2].replace(",", "."));
      const prezzo = Number(matchSimple[3].replace(",", "."));
      const totale = matchSimple[4]
        ? Number(matchSimple[4].replace(",", "."))
        : quantita * prezzo;
      voci.push({
        descrizione: matchSimple[1].trim(),
        quantita,
        unita: "pz",
        prezzo,
        totale,
      });
      continue;
    }

    voci.push({
      descrizione: trimmed,
      quantita: 1,
      unita: "—",
      prezzo: 0,
      totale: 0,
    });
  }

  return voci;
}

async function loadLogoDataUrl(): Promise<string | null> {
  const storedLogo = getStoredLogoDataUrl();
  if (storedLogo) return storedLogo;

  const paths = [
    BRAND_LOGO_PNG,
    BRAND_ICON_PNG,
    BRAND_LOGO_SVG,
  ];

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;

      if (path.endsWith(".png")) {
        const blob = await response.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }

      const svgText = await response.text();
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);

      try {
        const natural = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            const image = new Image();
            image.onload = () =>
              resolve({
                width: image.naturalWidth || 560,
                height: image.naturalHeight || 128,
              });
            image.onerror = reject;
            image.src = objectUrl;
          }
        );

        const png = await rasterizeToHighResPng(
          objectUrl,
          natural.width,
          natural.height
        );
        return png;
      } catch {
        return null;
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      continue;
    }
  }

  return null;
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

function drawPdfCompanyFooter(
  doc: jsPDF,
  margin: number,
  startY: number,
  pageWidth: number
): void {
  let y = startY;

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Documento generato da PreventivPRO", margin, y);
  y += 6;

  const settings = loadSettings();
  const companyName = settings.companyName.trim();
  const phone = settings.phone.trim();
  const email = settings.email.trim();

  if (companyName || phone || email) {
    if (companyName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...GREEN);
      doc.text(companyName, margin, y);
      y += 6;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);

    if (phone) {
      doc.text(`Telefono: ${phone}`, margin, y);
      y += 5;
    }

    if (email) {
      doc.text(`Email: ${email}`, margin, y);
      y += 5;
    }
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Valido salvo diversa indicazione scritta.", margin, y + 1);
}

function sanitizeFilename(cliente: string): string {
  return (
    cliente
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/gi, "") || "cliente"
  );
}

export type PreventivoPdfOutput = {
  doc: jsPDF;
  filename: string;
};

export async function buildPreventivoPdfDocument(
  preventivo: Preventivo
): Promise<PreventivoPdfOutput> {
  const filename = `preventivo-${sanitizeFilename(preventivo.cliente)}.pdf`;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const totaleGenerale = getPreventivoTotale(preventivo);
  const voci = parseVociFromDescrizione(preventivo.descrizione);

  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT_MM, "F");

  const logo = await loadLogoDataUrl();
  if (logo) {
    try {
      await drawHeaderLogo(doc, logo, margin, LOGO_MAX_WIDTH_MM);
    } catch {
      drawLogoFallback(doc, margin, (HEADER_HEIGHT_MM - 14) / 2);
    }
  } else {
    drawLogoFallback(doc, margin, (HEADER_HEIGHT_MM - 14) / 2);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(220, 220, 220);
  doc.text("PREVENTIVO", pageWidth - margin, 22, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 160);
  const dateLabel = preventivo.created_at
    ? new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(
        new Date(preventivo.created_at)
      )
    : new Intl.DateTimeFormat("it-IT", { dateStyle: "long" }).format(new Date());
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
  doc.text("VOCI PREVENTIVO", margin, y);
  y += 8;

  const colDesc = margin;
  const colQty = margin + 78;
  const colUnit = margin + 98;
  const colPrice = margin + 118;
  const colTotal = margin + 148;

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 2, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Descrizione", colDesc + 2, y + 4);
  doc.text("Q.tà", colQty, y + 4);
  doc.text("U.M.", colUnit, y + 4);
  doc.text("Prezzo", colPrice, y + 4);
  doc.text("Totale", colTotal, y + 4);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 55, 55);

  const rows =
    voci.length > 0
      ? voci
      : [
          {
            descrizione: preventivo.descrizione?.trim() || "—",
            quantita: 1,
            unita: "—",
            prezzo: totaleGenerale,
            totale: totaleGenerale,
          },
        ];

  for (const voce of rows) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    const descLines = doc.splitTextToSize(voce.descrizione, 72);
    const rowHeight = Math.max(descLines.length * 5, 7);

    doc.text(descLines, colDesc + 2, y + 4);
    doc.text(String(voce.quantita), colQty, y + 4);
    doc.text(voce.unita, colUnit, y + 4);
    doc.text(euroFormatter.format(voce.prezzo), colPrice, y + 4);
    doc.text(euroFormatter.format(voce.totale), colTotal, y + 4);

    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y + rowHeight + 2, pageWidth - margin, y + rowHeight + 2);
    y += rowHeight + 4;
  }

  y += 6;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setFillColor(...DARK);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text("TOTALE GENERALE", margin + 10, y + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...GREEN);
  doc.text(
    euroFormatter.format(totaleGenerale),
    pageWidth - margin - 10,
    y + 19,
    { align: "right" }
  );

  y += 40;

  drawPdfCompanyFooter(doc, margin, y, pageWidth);

  return { doc, filename };
}

export async function buildPreventivoPdfBlob(
  preventivo: Preventivo
): Promise<{ blob: Blob; filename: string }> {
  const { doc, filename } = await buildPreventivoPdfDocument(preventivo);
  return { blob: doc.output("blob"), filename };
}

export async function downloadPreventivoPdf(preventivo: Preventivo): Promise<void> {
  const { doc, filename } = await buildPreventivoPdfDocument(preventivo);

  try {
    downloadPdfBlob(doc.output("blob"), filename);
  } catch {
    doc.save(filename);
  }
}

export async function generatePreventivoPdf(preventivo: Preventivo): Promise<void> {
  return downloadPreventivoPdf(preventivo);
}
