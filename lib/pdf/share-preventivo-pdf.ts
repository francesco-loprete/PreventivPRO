import type { AppLocale } from "@/lib/i18n/types";
import {
  createTranslator,
  getDateLocale,
  getWhatsAppMessages,
} from "@/lib/i18n/get-messages";
import type { Preventivo } from "@/lib/types/preventivo";
import { getPreventivoTotale } from "@/lib/types/preventivo";

export function buildPreventivoPdfFilename(cliente: string): string {
  const slug =
    cliente
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/gi, "") || "cliente";

  return `preventivo-${slug}.pdf`;
}

export function buildWhatsAppMessage(
  preventivo: Preventivo,
  locale: AppLocale = "it"
): string {
  const t = createTranslator(locale);
  const dateLocale = getDateLocale(locale);
  const totale = getPreventivoTotale(preventivo);
  const totaleFormatted = totale.toLocaleString(dateLocale, {
    style: "currency",
    currency: "EUR",
  });

  return t("whatsapp.message", {
    client: preventivo.cliente,
    id: preventivo.id,
    total: totaleFormatted,
  });
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function sharePdfWithNativeSheet(
  blob: Blob,
  filename: string,
  text: string
): Promise<boolean> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  const file = new File([blob], filename, { type: "application/pdf" });
  const shareData: ShareData = { text, files: [file] };

  if (typeof navigator.canShare === "function" && !navigator.canShare(shareData)) {
    return false;
  }

  await navigator.share(shareData);
  return true;
}

export function openWhatsAppText(message: string): void {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

export type SharePreventivoPdfResult = "shared" | "downloaded";

export async function sharePreventivoPdfViaWhatsApp(
  blob: Blob,
  filename: string,
  message: string,
  locale: AppLocale = "it"
): Promise<SharePreventivoPdfResult> {
  const whatsapp = getWhatsAppMessages(locale);

  try {
    const shared = await sharePdfWithNativeSheet(blob, filename, message);
    if (shared) {
      return "shared";
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
  }

  downloadPdfBlob(blob, filename);
  openWhatsAppText(`${message}\n\n${whatsapp.attachmentNote}`);

  return "downloaded";
}
