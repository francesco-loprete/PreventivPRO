"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PreventivoEditModal } from "@/components/preventivo/preventivo-edit-modal";
import { PreventivoViewModal } from "@/components/preventivo/preventivo-view-modal";
import { FormFeedback } from "@/components/ui/form-feedback";
import { computeClienteStats } from "@/lib/clienti/cliente-stats";
import { usePreventivoActions } from "@/hooks/use-preventivo-actions";
import { getPreventivoTotaleVisualizzato } from "@/lib/preventivi/iva";
import type { Cliente } from "@/lib/types/cliente";
import type { Preventivo } from "@/lib/types/preventivo";

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ClienteFolderProps = {
  cliente: Cliente;
  preventivi: Preventivo[];
  clienti: Cliente[];
};

type PreventivoCardProps = {
  preventivo: Preventivo;
  isBusy: boolean;
  modificaDisabled: boolean;
  pdfGeneratingId: number | null;
  whatsappSharingId: number | null;
  onApri: () => void;
  onModifica: () => void;
  onPdf: () => void;
  onWhatsApp: () => void;
};

function PreventivoCard({
  preventivo,
  isBusy,
  modificaDisabled,
  pdfGeneratingId,
  whatsappSharingId,
  onApri,
  onModifica,
  onPdf,
  onWhatsApp,
}: PreventivoCardProps) {
  return (
    <article className="card p-4 sm:p-5 min-w-0">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-xs text-muted uppercase tracking-wide">
            Preventivo N° {preventivo.id}
          </p>
          <p className="text-sm text-muted mt-1">
            {preventivo.created_at
              ? dateFormatter.format(new Date(preventivo.created_at))
              : "—"}
          </p>
        </div>
        <p className="text-lg sm:text-xl font-bold text-accent shrink-0 tabular-nums">
          {euroFormatter.format(getPreventivoTotaleVisualizzato(preventivo))}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onApri}
          disabled={isBusy}
          className="btn-ghost hover:border-accent hover:text-accent w-full py-2.5 text-sm font-medium"
        >
          Apri
        </button>
        <button
          type="button"
          onClick={onModifica}
          disabled={modificaDisabled}
          className="btn-ghost hover:border-accent hover:text-accent w-full py-2.5 text-sm font-medium"
        >
          Modifica
        </button>
        <button
          type="button"
          onClick={onPdf}
          disabled={isBusy}
          className="btn-ghost hover:border-accent hover:text-accent w-full py-2.5 text-sm font-medium"
          aria-label={`Scarica PDF preventivo N° ${preventivo.id}`}
        >
          {pdfGeneratingId === preventivo.id ? "PDF..." : "PDF"}
        </button>
        <button
          type="button"
          onClick={onWhatsApp}
          disabled={isBusy}
          className="btn-ghost hover:border-[#25D366] hover:text-[#25D366] w-full py-2.5 text-sm font-medium"
          aria-label={`Condividi preventivo N° ${preventivo.id} su WhatsApp`}
        >
          {whatsappSharingId === preventivo.id ? "..." : "WhatsApp"}
        </button>
      </div>
    </article>
  );
}

export function ClienteFolder({
  cliente,
  preventivi,
  clienti,
}: ClienteFolderProps) {
  const stats = computeClienteStats(preventivi, cliente);
  const [viewing, setViewing] = useState<Preventivo | null>(null);
  const [editing, setEditing] = useState<Preventivo | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    pdfGeneratingId,
    whatsappSharingId,
    actionError,
    setActionError,
    anyActionBusy,
    isRowBusy,
    handlePdf,
    handleWhatsApp,
  } = usePreventivoActions();

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const modalsOpen = viewing !== null || editing !== null;
  const modificaDisabled = anyActionBusy || editing !== null;

  return (
    <>
      <div className="mb-8 min-w-0">
        <Link
          href="/clienti"
          className="text-sm text-accent/80 hover:text-sky-400 inline-block"
        >
          ← Torna ai clienti
        </Link>

        <Link
          href={`/nuovo-preventivo?clienteId=${cliente.id}`}
          className="btn-primary w-full text-center mt-4 mb-6 block sm:w-auto sm:inline-block"
        >
          Nuovo preventivo per questo cliente
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight break-words">
          {cliente.nome}
        </h1>
        <p className="text-muted mt-2 text-sm">Cartella cliente</p>
      </div>

      {(cliente.telefono || cliente.email || cliente.indirizzo || cliente.note) && (
        <div className="card p-4 sm:p-6 mb-6 text-sm text-muted space-y-1">
          {cliente.telefono && <p>Telefono: {cliente.telefono}</p>}
          {cliente.email && <p>Email: {cliente.email}</p>}
          {cliente.indirizzo && <p>Indirizzo: {cliente.indirizzo}</p>}
          {cliente.note && <p>Note: {cliente.note}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide">Preventivi</p>
          <p className="text-2xl font-bold mt-2">{stats.preventiviCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide">Valore totale</p>
          <p className="text-2xl font-bold mt-2 text-accent">
            {euroFormatter.format(stats.totalePreventivi)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wide">Ultimo preventivo</p>
          <p className="text-sm font-medium mt-2">
            {stats.ultimoPreventivo?.created_at
              ? dateFormatter.format(new Date(stats.ultimoPreventivo.created_at))
              : "—"}
          </p>
        </div>
      </div>

      <FormFeedback
        error={!modalsOpen ? actionError : null}
        success={!modalsOpen ? success : null}
        className="mb-4 space-y-2"
      />

      {stats.preventivi.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <p className="text-muted mb-6">
            Nessun preventivo associato a questo cliente.
          </p>
          <Link
            href={`/nuovo-preventivo?clienteId=${cliente.id}`}
            className="btn-primary inline-block"
          >
            Crea il primo preventivo
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4 list-none p-0 m-0">
          {stats.preventivi.map((preventivo) => (
            <li key={preventivo.id}>
              <PreventivoCard
                preventivo={preventivo}
                isBusy={isRowBusy(preventivo.id)}
                modificaDisabled={modificaDisabled}
                pdfGeneratingId={pdfGeneratingId}
                whatsappSharingId={whatsappSharingId}
                onApri={() => {
                  setActionError(null);
                  setViewing(preventivo);
                }}
                onModifica={() => {
                  setActionError(null);
                  setEditing(preventivo);
                }}
                onPdf={() => handlePdf(preventivo)}
                onWhatsApp={() => handleWhatsApp(preventivo)}
              />
            </li>
          ))}
        </ul>
      )}

      <PreventivoViewModal
        preventivo={viewing}
        onClose={() => setViewing(null)}
      />

      <PreventivoEditModal
        preventivo={editing}
        clienti={clienti}
        onClose={() => setEditing(null)}
        onSuccess={(message) => {
          setSuccess(message);
          setActionError(null);
        }}
        idPrefix="cliente-folder"
      />
    </>
  );
}
