import { redirect } from "next/navigation";
import { getUserClienti } from "@/lib/clienti/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUserPreventivi } from "@/lib/preventivi/queries";
import { ClienteFolder } from "./cliente-folder";

export const dynamic = "force-dynamic";

type ClienteFolderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClienteFolderPage({ params }: ClienteFolderPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="card p-8 text-amber-300 border-amber-900/40">
        Supabase non configurato.
      </div>
    );
  }

  const { id } = await params;
  const clienteId = Number(id);

  if (!Number.isFinite(clienteId) || clienteId <= 0) {
    redirect("/clienti");
  }

  const [clientiResult, preventiviResult] = await Promise.all([
    getUserClienti(),
    getUserPreventivi(),
  ]);

  if (!clientiResult.ok) {
    if (clientiResult.reason === "unauthenticated") {
      redirect(`/login?redirectTo=/clienti/${clienteId}`);
    }

    return (
      <div className="card p-8 text-red-400 border-red-900/40">
        Errore nel caricamento: {clientiResult.message}
      </div>
    );
  }

  const cliente = clientiResult.clienti.find((item) => item.id === clienteId);

  if (!cliente) {
    redirect("/clienti");
  }

  const preventivi = preventiviResult.ok ? preventiviResult.preventivi : [];

  return (
    <ClienteFolder
      cliente={cliente}
      preventivi={preventivi}
      clienti={clientiResult.clienti}
    />
  );
}
