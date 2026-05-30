import { jsPDF } from "jspdf";
import {
  BRAND_DARK_RGB,
  BRAND_GREEN_RGB,
  BRAND_NAME,
} from "@/lib/branding/constants";
import {
  getPdfLogoPaths,
  getStoredLogoDataUrl,
} from "@/lib/branding/settings";
import { SETTINGS_STORAGE_KEY } from "@/lib/settings/storage";
import { calcolaRiepilogoIva } from "@/lib/preventivi/iva";
import { parseVociFromDescrizione as parseVoci } from "@/lib/preventivi/voci";
import { downloadPdfBlob } from "@/lib/pdf/share-preventivo-pdf";
import {
  createTranslator,
  getDateLocale,
  getPdfMessages,
} from "@/lib/i18n/get-messages";
import { loadLocaleFromStorage } from "@/lib/i18n/load-locale";
import type { Messages } from "@/lib/i18n/types";
import { createClient } from "@/lib/supabase/client";
import type { Preventivo } from "@/lib/types/preventivo";
import { getPreventivoTotale } from "@/lib/types/preventivo";

const DARK: [number, number, number] = [...BRAND_DARK_RGB];
const GREEN: [number, number, number] = [...BRAND_GREEN_RGB];
const GRAY: [number, number, number] = [100, 116, 139];
const MUTED: [number, number, number] = [148, 163, 184];
const BLUE: [number, number, number] = [37, 99, 235];
const BLUE_SOFT: [number, number, number] = [239, 246, 255];
const BORDER: [number, number, number] = [226, 232, 240];

const PAGE_MARGIN = 15;
const HEADER_HEIGHT_MM = 46;
const LOGO_MAX_HEIGHT_MM = 34;
const LOGO_MAX_WIDTH_MM = 36;
const FIRMA_BOX_HEIGHT_MM = 14;

type PdfRenderContext = {
  labels: Messages["pdf"];
  euroFormatter: Intl.NumberFormat;
  dateFormatter: Intl.DateTimeFormat;
  dateLocale: string;
  t: ReturnType<typeof createTranslator>;
};

function createPdfRenderContext(): PdfRenderContext {
  const locale = loadLocaleFromStorage();
  const labels = getPdfMessages(locale);
  const dateLocale = getDateLocale(locale);

  return {
    labels,
    dateLocale,
    euroFormatter: new Intl.NumberFormat(dateLocale, {
      style: "currency",
      currency: "EUR",
    }),
    dateFormatter: new Intl.DateTimeFormat(dateLocale, { dateStyle: "long" }),
    t: createTranslator(locale),
  };
}

function formatValiditaLabel(
  validoFinoAl: string | null | undefined,
  ctx: PdfRenderContext
): string {
  const trimmed = validoFinoAl?.trim();
  if (!trimmed) return ctx.labels.expiryNotSpecified;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (match) {
    return ctx.t("pdf.validUntil", {
      date: `${match[3]}/${match[2]}/${match[1]}`,
    });
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return ctx.labels.expiryNotSpecified;

  return ctx.t("pdf.validUntil", {
    date: new Intl.DateTimeFormat(ctx.dateLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(parsed),
  });
}

type PdfClienteDetails = {
  nome: string;
  telefono?: string | null;
  email?: string | null;
  indirizzo?: string | null;
};

type PdfIssuerDetails = {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  partitaIva: string;
};

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

async function loadLogoDataUrl(): Promise<string | null> {
  const storedLogo = getStoredLogoDataUrl();
  if (storedLogo) return storedLogo;

  const paths = getPdfLogoPaths();

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

function drawLogoFallback(doc: jsPDF, x: number, y: number, size: number) {
  doc.setFillColor(...BLUE);
  doc.roundedRect(x, y, size, size, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size * 0.55);
  doc.setTextColor(255, 255, 255);
  doc.text("P", x + size * 0.28, y + size * 0.72);
}

function readStoredCompanyFields(): PdfIssuerDetails {
  const empty: PdfIssuerDetails = {
    companyName: "",
    phone: "",
    email: "",
    address: "",
    partitaIva: "",
  };

  if (typeof window === "undefined") return empty;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return empty;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const address =
      (typeof parsed.address === "string" ? parsed.address.trim() : "") ||
      (typeof parsed.indirizzo === "string" ? parsed.indirizzo.trim() : "");
    const partitaIva =
      (typeof parsed.partitaIva === "string" ? parsed.partitaIva.trim() : "") ||
      (typeof parsed.partita_iva === "string" ? parsed.partita_iva.trim() : "");

    return {
      companyName:
        typeof parsed.companyName === "string" ? parsed.companyName.trim() : "",
      phone: typeof parsed.phone === "string" ? parsed.phone.trim() : "",
      email: typeof parsed.email === "string" ? parsed.email.trim() : "",
      address,
      partitaIva,
    };
  } catch {
    return empty;
  }
}

function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata ?? {};

  for (const key of ["full_name", "name"] as const) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const emailLocal = user.email?.split("@")[0]?.trim();
  return emailLocal ?? "";
}

async function fetchAuthUserForPdf() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

async function getPdfIssuerDetails(): Promise<PdfIssuerDetails> {
  const stored = readStoredCompanyFields();
  let companyName = stored.companyName;
  let phone = stored.phone;
  let email = stored.email;

  if (!companyName || !email) {
    const user = await fetchAuthUserForPdf();
    if (user) {
      if (!companyName) {
        companyName = getUserDisplayName(user);
      }
      if (!email) {
        email = user.email?.trim() ?? "";
      }
    }
  }

  return {
    companyName,
    phone,
    email,
    address: stored.address,
    partitaIva: stored.partitaIva,
  };
}

async function fetchClienteForPdf(
  preventivo: Preventivo
): Promise<PdfClienteDetails | null> {
  if (!preventivo.cliente_id) return null;

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("clienti")
      .select("nome, telefono, email, indirizzo")
      .eq("id", preventivo.cliente_id)
      .maybeSingle();

    return data;
  } catch {
    return null;
  }
}

function ensureSpace(
  doc: jsPDF,
  y: number,
  needed: number,
  pageHeight: number
): number {
  if (y + needed > pageHeight - PAGE_MARGIN) {
    doc.addPage();
    return PAGE_MARGIN;
  }
  return y;
}

async function drawPremiumHeader(
  doc: jsPDF,
  preventivo: Preventivo,
  pageWidth: number,
  margin: number,
  ctx: PdfRenderContext
): Promise<void> {
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageWidth, 2.5, "F");
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 2.5, pageWidth, HEADER_HEIGHT_MM - 2.5, "F");
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.35);
  doc.line(margin, HEADER_HEIGHT_MM, pageWidth - margin, HEADER_HEIGHT_MM);

  const logoY = 2.5 + (HEADER_HEIGHT_MM - 2.5 - LOGO_MAX_HEIGHT_MM) / 2;
  let brandTextX = margin;

  const logo = await loadLogoDataUrl();
  if (logo) {
    try {
      const prepared = await prepareLogoForPdf(logo);
      const { width, height } = fitContain(
        prepared.width,
        prepared.height,
        LOGO_MAX_WIDTH_MM,
        LOGO_MAX_HEIGHT_MM
      );
      doc.addImage(
        prepared.dataUrl,
        getImageFormat(prepared.dataUrl),
        margin,
        logoY + (LOGO_MAX_HEIGHT_MM - height) / 2,
        width,
        height,
        undefined,
        "NONE"
      );
      brandTextX = margin + width + 6;
    } catch {
      drawLogoFallback(doc, margin, logoY, LOGO_MAX_HEIGHT_MM);
      brandTextX = margin + LOGO_MAX_HEIGHT_MM + 6;
    }
  } else {
    drawLogoFallback(doc, margin, logoY, LOGO_MAX_HEIGHT_MM);
    brandTextX = margin + LOGO_MAX_HEIGHT_MM + 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...DARK);
  doc.text(BRAND_NAME, brandTextX, logoY + LOGO_MAX_HEIGHT_MM * 0.58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(ctx.labels.tagline, brandTextX, logoY + LOGO_MAX_HEIGHT_MM * 0.82);

  const dateLabel = preventivo.created_at
    ? ctx.dateFormatter.format(new Date(preventivo.created_at))
    : ctx.dateFormatter.format(new Date());

  const metaY = logoY + LOGO_MAX_HEIGHT_MM * 0.45;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...BLUE);
  doc.text(
    ctx.t("pdf.quoteNumberFull", { id: preventivo.id }),
    pageWidth - margin,
    metaY,
    { align: "right" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(dateLabel, pageWidth - margin, metaY + 6, { align: "right" });
}

function drawClienteSection(
  doc: jsPDF,
  clienteNome: string,
  clienteDetails: PdfClienteDetails | null,
  margin: number,
  contentWidth: number,
  startY: number,
  ctx: PdfRenderContext
): number {
  const lines: string[] = [];
  const telefono = clienteDetails?.telefono?.trim();
  const email = clienteDetails?.email?.trim();
  const indirizzo = clienteDetails?.indirizzo?.trim();

  if (telefono) lines.push(`${ctx.labels.tel} ${telefono}`);
  if (email) lines.push(email);
  if (indirizzo) lines.push(indirizzo);

  const hasDetails = lines.length > 0;
  const boxHeight = hasDetails ? 13 + lines.length * 4.2 : 11;

  doc.setFillColor(...BLUE_SOFT);
  doc.roundedRect(margin, startY, contentWidth, boxHeight, 2.5, 2.5, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, startY, contentWidth, boxHeight, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...BLUE);
  doc.text(ctx.labels.client, margin + 6, startY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(clienteNome, margin + 6, startY + (hasDetails ? 11.5 : 8.5));

  if (hasDetails) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);

    let lineY = startY + 15.5;
    for (const line of lines) {
      doc.text(line, margin + 6, lineY);
      lineY += 4.2;
    }
  }

  return startY + boxHeight + 6;
}

function drawRiepilogoEconomico(
  doc: jsPDF,
  riepilogo: ReturnType<typeof calcolaRiepilogoIva>,
  margin: number,
  contentWidth: number,
  pageWidth: number,
  pageHeight: number,
  startY: number,
  ctx: PdfRenderContext
): number {
  let y = ensureSpace(doc, startY, 46, pageHeight);

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.35);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...BLUE);
  doc.text(ctx.labels.summary, margin, y);
  y += 6;

  const labelX = margin + contentWidth * 0.4;
  const valueX = pageWidth - margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);

  const summaryLines = [
    {
      label: ctx.labels.taxableAmount,
      value: ctx.euroFormatter.format(riepilogo.imponibile),
    },
    { label: ctx.labels.vatRate, value: `${riepilogo.aliquota}%` },
    {
      label: ctx.labels.vatAmount,
      value: ctx.euroFormatter.format(riepilogo.iva),
    },
  ];

  for (const line of summaryLines) {
    doc.text(line.label, labelX, y);
    doc.text(line.value, valueX, y, { align: "right" });
    y += 5;
  }

  y += 3;
  y = ensureSpace(doc, y, 20, pageHeight);

  doc.setFillColor(...DARK);
  doc.roundedRect(margin, y, contentWidth, 20, 2.5, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text(ctx.labels.totalWithVat, margin + 7, y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...GREEN);
  doc.text(
    ctx.euroFormatter.format(riepilogo.totaleIvaInclusa),
    pageWidth - margin - 7,
    y + 14,
    { align: "right" }
  );

  return y + 24;
}

function drawValidityNote(
  doc: jsPDF,
  margin: number,
  pageHeight: number,
  startY: number,
  validoFinoAl: string | null | undefined,
  ctx: PdfRenderContext
): number {
  let y = ensureSpace(doc, startY, 8, pageHeight);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(formatValiditaLabel(validoFinoAl, ctx), margin, y);

  return y + 5;
}

function drawEmessoDaBlock(
  doc: jsPDF,
  issuer: PdfIssuerDetails,
  margin: number,
  contentWidth: number,
  pageHeight: number,
  startY: number,
  ctx: PdfRenderContext
): number {
  const rows: string[] = [];
  if (issuer.companyName.trim()) rows.push(issuer.companyName.trim());
  if (issuer.address.trim()) rows.push(issuer.address.trim());
  if (issuer.phone.trim()) rows.push(`${ctx.labels.tel} ${issuer.phone.trim()}`);
  if (issuer.email.trim()) rows.push(issuer.email.trim());
  if (issuer.partitaIva.trim()) {
    rows.push(`${ctx.labels.vatNumber} ${issuer.partitaIva.trim()}`);
  }

  if (rows.length === 0) return startY;

  const boxHeight = 8 + rows.length * 4.2;
  let y = ensureSpace(doc, startY, boxHeight + 4, pageHeight);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2.5, 2.5, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...BLUE);
  doc.text(ctx.labels.issuedBy, margin + 6, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);

  let lineY = y + 10.5;
  for (const row of rows) {
    doc.text(row, margin + 6, lineY);
    lineY += 4.2;
  }

  return y + boxHeight + 5;
}

function drawAccettazioneFirma(
  doc: jsPDF,
  firmaDataUrl: string | null | undefined,
  margin: number,
  contentWidth: number,
  pageWidth: number,
  pageHeight: number,
  startY: number,
  ctx: PdfRenderContext
): number {
  const boxHeight = FIRMA_BOX_HEIGHT_MM;
  let y = ensureSpace(doc, startY, boxHeight + 10, pageHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...BLUE);
  doc.text(ctx.labels.acceptance, margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text(ctx.labels.clientSignature, margin, y);
  y += 4;

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.25);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");

  const lineY = y + boxHeight - 3.5;

  if (firmaDataUrl?.startsWith("data:image")) {
    try {
      const format = firmaDataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(
        firmaDataUrl,
        format,
        margin + 5,
        y + 1.5,
        52,
        9,
        undefined,
        "FAST"
      );
    } catch {
      doc.setDrawColor(...MUTED);
      doc.setLineWidth(0.25);
      doc.line(margin + 10, lineY, pageWidth - margin - 10, lineY);
    }
  } else {
    doc.setDrawColor(...MUTED);
    doc.setLineWidth(0.25);
    doc.line(margin + 10, lineY, pageWidth - margin - 10, lineY);
  }

  return y + boxHeight + 4;
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
  const ctx = createPdfRenderContext();
  const filename = `preventivo-${sanitizeFilename(preventivo.cliente)}.pdf`;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PAGE_MARGIN;
  const contentWidth = pageWidth - margin * 2;
  const totaleGenerale = getPreventivoTotale(preventivo);
  const voci = parseVoci(preventivo.descrizione);
  const riepilogo = calcolaRiepilogoIva(totaleGenerale, preventivo.aliquota_iva);
  const issuer = await getPdfIssuerDetails();
  const clienteDetails = await fetchClienteForPdf(preventivo);

  await drawPremiumHeader(doc, preventivo, pageWidth, margin, ctx);

  let y = HEADER_HEIGHT_MM + 4;
  y = drawClienteSection(
    doc,
    preventivo.cliente,
    clienteDetails,
    margin,
    contentWidth,
    y,
    ctx
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text(ctx.labels.detail, margin, y);
  y += 5;

  const colDesc = margin;
  const colQty = margin + 78;
  const colUnit = margin + 98;
  const colPrice = margin + 118;
  const colTotal = margin + 148;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y - 2, contentWidth, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(ctx.labels.description, colDesc + 2, y + 4);
  doc.text(ctx.labels.qty, colQty, y + 4);
  doc.text(ctx.labels.unit, colUnit, y + 4);
  doc.text(ctx.labels.price, colPrice, y + 4);
  doc.text(ctx.labels.total, colTotal, y + 4);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
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
          },
        ];

  for (const voce of rows) {
    y = ensureSpace(doc, y, 14, pageHeight);

    const rigaTotale = voce.quantita * voce.prezzo;
    const descLines = doc.splitTextToSize(voce.descrizione, 72);
    const rowHeight = Math.max(descLines.length * 4.5, 6);

    doc.text(descLines, colDesc + 2, y + 3.5);
    doc.text(String(voce.quantita), colQty, y + 3.5);
    doc.text(voce.unita, colUnit, y + 3.5);
    doc.text(ctx.euroFormatter.format(voce.prezzo), colPrice, y + 3.5);
    doc.text(ctx.euroFormatter.format(rigaTotale), colTotal, y + 3.5);

    doc.setDrawColor(...BORDER);
    doc.line(margin, y + rowHeight + 1.5, pageWidth - margin, y + rowHeight + 1.5);
    y += rowHeight + 2.5;
  }

  y += 2;
  y = drawRiepilogoEconomico(
    doc,
    riepilogo,
    margin,
    contentWidth,
    pageWidth,
    pageHeight,
    y,
    ctx
  );
  y = drawEmessoDaBlock(doc, issuer, margin, contentWidth, pageHeight, y, ctx);
  y = drawAccettazioneFirma(
    doc,
    preventivo.firma_cliente,
    margin,
    contentWidth,
    pageWidth,
    pageHeight,
    y,
    ctx
  );
  drawValidityNote(doc, margin, pageHeight, y, preventivo.valido_fino_al, ctx);

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
