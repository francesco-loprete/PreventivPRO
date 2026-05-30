"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { duplicatePreventivo } from "@/lib/preventivi/duplicate-preventivo";
import { downloadPreventivoPdf, buildPreventivoPdfBlob } from "@/lib/pdf/generate-preventivo-pdf";
import {
  buildWhatsAppMessage,
  sharePreventivoPdfViaWhatsApp,
} from "@/lib/pdf/share-preventivo-pdf";
import { createClient } from "@/lib/supabase/client";
import type { Preventivo } from "@/lib/types/preventivo";
import { rlsErrorHint } from "@/lib/types/preventivo";

type UsePreventivoActionsOptions = {
  onDuplicateSuccess?: (preventivo: Preventivo) => void;
};

export function usePreventivoActions(options: UsePreventivoActionsOptions = {}) {
  const router = useRouter();
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [pdfGeneratingId, setPdfGeneratingId] = useState<number | null>(null);
  const [whatsappSharingId, setWhatsappSharingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const anyActionBusy =
    duplicatingId !== null ||
    pdfGeneratingId !== null ||
    whatsappSharingId !== null;

  function isRowBusy(preventivoId: number, extraBusy = false) {
    return (
      extraBusy ||
      duplicatingId === preventivoId ||
      pdfGeneratingId === preventivoId ||
      whatsappSharingId === preventivoId
    );
  }

  async function handlePdf(preventivo: Preventivo) {
    setActionError(null);
    setPdfGeneratingId(preventivo.id);

    try {
      await downloadPreventivoPdf(preventivo);
    } catch {
      setActionError("Errore durante la generazione del PDF.");
    } finally {
      setPdfGeneratingId(null);
    }
  }

  async function handleWhatsApp(preventivo: Preventivo) {
    setActionError(null);
    setWhatsappSharingId(preventivo.id);

    try {
      const { blob, filename } = await buildPreventivoPdfBlob(preventivo);
      const message = buildWhatsAppMessage(preventivo);
      await sharePreventivoPdfViaWhatsApp(blob, filename, message);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setActionError("Errore durante la condivisione su WhatsApp.");
    } finally {
      setWhatsappSharingId(null);
    }
  }

  async function handleDuplicate(preventivo: Preventivo) {
    setActionError(null);
    setDuplicatingId(preventivo.id);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setDuplicatingId(null);
      setActionError("Sessione scaduta. Accedi di nuovo.");
      return;
    }

    const result = await duplicatePreventivo(supabase, user.id, preventivo);
    setDuplicatingId(null);

    if (!result.ok) {
      setActionError(result.message + rlsErrorHint(result.code));
      return;
    }

    options.onDuplicateSuccess?.(result.preventivo);
    router.refresh();
  }

  return {
    duplicatingId,
    pdfGeneratingId,
    whatsappSharingId,
    actionError,
    setActionError,
    anyActionBusy,
    isRowBusy,
    handlePdf,
    handleWhatsApp,
    handleDuplicate,
  };
}
