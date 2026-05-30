import type { Preventivo } from "@/lib/types/preventivo";
import { getPreventivoTotaleVisualizzato } from "@/lib/preventivi/iva";

export type DashboardStats = {
  preventiviCount: number;
  totaleEmesso: number;
  ultimoPreventivo: Preventivo | null;
};

export function computeDashboardStats(preventivi: Preventivo[]): DashboardStats {
  const sorted = [...preventivi].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  return {
    preventiviCount: preventivi.length,
    totaleEmesso: preventivi.reduce(
      (sum, p) => sum + getPreventivoTotaleVisualizzato(p),
      0
    ),
    ultimoPreventivo: sorted[0] ?? null,
  };
}
