"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PreventivoEditModal } from "@/components/preventivo/preventivo-edit-modal";
import { PreventivoRowActions } from "@/components/preventivo/preventivo-row-actions";
import { FormFeedback } from "@/components/ui/form-feedback";
import { SearchInput } from "@/components/ui/search-input";
import { usePreventivoActions } from "@/hooks/use-preventivo-actions";
import { getPreventivoTotaleVisualizzato } from "@/lib/preventivi/iva";
import { createClient } from "@/lib/supabase/client";
import { matchesAnyField } from "@/lib/utils/search";
import type { Cliente } from "@/lib/types/cliente";
import type { Preventivo } from "@/lib/types/preventivo";
import { rlsErrorHint } from "@/lib/types/preventivo";

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
});

type PreventiviTableProps = {
  preventivi: Preventivo[];
  clienti: Cliente[];
};

export function PreventiviTable({
  preventivi: initialPreventivi,
  clienti,
}: PreventiviTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<Preventivo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
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
  } = usePreventivoActions({
    onDuplicateSuccess: (copied) => {
      setSuccess("Preventivo duplicato. Modifica la copia qui sotto.");
      setEditing(copied);
    },
  });

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filteredPreventivi = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return initialPreventivi;

    return initialPreventivi.filter((preventivo) =>
      matchesAnyField([preventivo.cliente, preventivo.descrizione], query)
    );
  }, [initialPreventivi, searchQuery]);

  const listError = error ?? (!editing ? actionError : null);
  const listSuccess = !editing ? success : null;

  async function handleDelete(preventivo: Preventivo) {
    const confirmed = window.confirm(
      `Eliminare il preventivo di ${preventivo.cliente}?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setActionError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Sessione scaduta. Accedi di nuovo.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("preventivi")
      .delete()
      .eq("id", preventivo.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message + rlsErrorHint(deleteError.code));
      return;
    }

    setSuccess("Preventivo eliminato.");
    router.refresh();
  }

  return (
    <>
      <div className="mb-6">
        <SearchInput
          id="preventivi-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cerca per cliente o descrizione..."
          disabled={loading || anyActionBusy}
        />
      </div>

      <FormFeedback
        error={listError}
        success={listSuccess}
        className="mb-4 space-y-2"
      />

      {filteredPreventivi.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted">
            {searchQuery.trim()
              ? "Nessun preventivo corrisponde alla ricerca."
              : "Nessun preventivo salvato."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-slate-950/40">
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wide text-right">
                    Totale
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wide">
                    Data
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted uppercase tracking-wide text-right">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPreventivi.map((preventivo) => (
                  <tr
                    key={preventivo.id}
                    className="border-b border-border/80 last:border-b-0 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {preventivo.cliente}
                    </td>
                    <td className="px-6 py-4 text-accent font-semibold text-right whitespace-nowrap">
                      {euroFormatter.format(getPreventivoTotaleVisualizzato(preventivo))}
                    </td>
                    <td className="px-6 py-4 text-muted whitespace-nowrap">
                      {preventivo.created_at
                        ? dateFormatter.format(new Date(preventivo.created_at))
                        : "—"}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <PreventivoRowActions
                        preventivo={preventivo}
                        onModifica={() => {
                          setError(null);
                          setActionError(null);
                          setEditing(preventivo);
                        }}
                        onPdf={() => handlePdf(preventivo)}
                        onWhatsApp={() => handleWhatsApp(preventivo)}
                        onDuplica={() => handleDuplicate(preventivo)}
                        onElimina={() => handleDelete(preventivo)}
                        showElimina
                        isBusy={isRowBusy(preventivo.id, loading)}
                        modificaDisabled={
                          loading || anyActionBusy || editing !== null
                        }
                        duplicatingId={duplicatingId}
                        pdfGeneratingId={pdfGeneratingId}
                        whatsappSharingId={whatsappSharingId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PreventivoEditModal
        preventivo={editing}
        clienti={clienti}
        onClose={() => setEditing(null)}
        onSuccess={(message) => {
          setSuccess(message);
          setError(null);
          setActionError(null);
        }}
        idPrefix="preventivi-list"
      />
    </>
  );
}
