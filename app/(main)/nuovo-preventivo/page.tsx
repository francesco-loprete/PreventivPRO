import { redirect } from "next/navigation";
import { getUserClienti } from "@/lib/clienti/queries";
import { createClient } from "@/lib/supabase/server";
import { PreventivoForm } from "./preventivo-form";

export const dynamic = "force-dynamic";

type NuovoPreventivoProps = {
  searchParams: Promise<{ clienteId?: string }>;
};

export default async function NuovoPreventivo({ searchParams }: NuovoPreventivoProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/nuovo-preventivo");
  }

  const { clienteId: clienteIdParam } = await searchParams;
  const parsedClienteId = clienteIdParam ? Number(clienteIdParam) : undefined;
  const initialClienteId =
    parsedClienteId !== undefined &&
    Number.isFinite(parsedClienteId) &&
    parsedClienteId > 0
      ? parsedClienteId
      : undefined;

  const clientiResult = await getUserClienti();
  const clienti = clientiResult.ok ? clientiResult.clienti : [];

  return (
    <>
      <h1 className="text-4xl font-bold mb-10 tracking-tight">
        Nuovo <span className="text-accent">Preventivo</span>
      </h1>
      <PreventivoForm clienti={clienti} initialClienteId={initialClienteId} />
    </>
  );
}
