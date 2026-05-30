import type { Cliente } from "@/lib/types/cliente";
import type { Preventivo } from "@/lib/types/preventivo";
import { getPreventivoTotaleVisualizzato } from "@/lib/preventivi/iva";

export type ClienteStats = {
  preventiviCount: number;
  totalePreventivi: number;
  ultimoPreventivo: Preventivo | null;
  preventivi: Preventivo[];
};

export function getPreventiviForCliente(
  preventivi: Preventivo[],
  cliente: Cliente
): Preventivo[] {
  const byId = preventivi.filter((p) => p.cliente_id === cliente.id);

  if (byId.length > 0) {
    return sortPreventiviByDate(byId);
  }

  const nome = cliente.nome.trim().toLowerCase();
  return sortPreventiviByDate(
    preventivi.filter((p) => p.cliente.trim().toLowerCase() === nome)
  );
}

function sortPreventiviByDate(items: Preventivo[]): Preventivo[] {
  return [...items].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

export function computeClienteStats(
  preventivi: Preventivo[],
  cliente: Cliente
): ClienteStats {
  const associated = getPreventiviForCliente(preventivi, cliente);

  return {
    preventiviCount: associated.length,
    totalePreventivi: associated.reduce(
      (sum, p) => sum + getPreventivoTotaleVisualizzato(p),
      0
    ),
    ultimoPreventivo: associated[0] ?? null,
    preventivi: associated,
  };
}
