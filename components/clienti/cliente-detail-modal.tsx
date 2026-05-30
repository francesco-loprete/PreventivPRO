"use client";

import Link from "next/link";
import { computeClienteStats } from "@/lib/clienti/cliente-stats";
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

type ClienteDetailModalProps = {
  cliente: Cliente;
  preventivi: Preventivo[];
  onClose: () => void;
};

export function ClienteDetailModal({
  cliente,
  preventivi,
  onClose,
}: ClienteDetailModalProps) {
  const stats = computeClienteStats(preventivi, cliente);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cliente-detail-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto card p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 id="cliente-detail-title" className="text-2xl font-bold">
              {cliente.nome}
            </h2>
            <p className="text-muted text-sm mt-1">Storico preventivi</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-3 py-2 text-sm shrink-0"
          >
            Chiudi
          </button>
        </div>

        {(cliente.telefono || cliente.email || cliente.indirizzo) && (
          <div className="mb-6 text-sm text-muted space-y-1">
            {cliente.telefono && <p>Telefono: {cliente.telefono}</p>}
            {cliente.email && <p>Email: {cliente.email}</p>}
            {cliente.indirizzo && <p>Indirizzo: {cliente.indirizzo}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-slate-950/40 p-4">
            <p className="text-xs text-muted uppercase tracking-wide">Preventivi</p>
            <p className="text-2xl font-bold mt-2">{stats.preventiviCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-slate-950/40 p-4">
            <p className="text-xs text-muted uppercase tracking-wide">Valore totale</p>
            <p className="text-2xl font-bold mt-2 text-accent">
              {euroFormatter.format(stats.totalePreventivi)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-slate-950/40 p-4">
            <p className="text-xs text-muted uppercase tracking-wide">Ultimo preventivo</p>
            <p className="text-sm font-medium mt-2">
              {stats.ultimoPreventivo?.created_at
                ? dateFormatter.format(new Date(stats.ultimoPreventivo.created_at))
                : "—"}
            </p>
          </div>
        </div>

        {stats.preventivi.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">
            Nessun preventivo associato a questo cliente.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted uppercase text-xs tracking-wide">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Totale</th>
                  <th className="px-4 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {stats.preventivi.map((preventivo) => (
                  <tr
                    key={preventivo.id}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-muted">
                      {preventivo.created_at
                        ? dateFormatter.format(new Date(preventivo.created_at))
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-accent">
                      {euroFormatter.format(getPreventivoTotaleVisualizzato(preventivo))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href="/preventivi"
                        className="text-accent hover:text-sky-400 text-sm font-medium"
                      >
                        Vai alla lista
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
