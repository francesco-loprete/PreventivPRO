import { redirect } from "next/navigation";
import { NuovoPreventivoHeader } from "@/components/preventivo/nuovo-preventivo-header";
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
      <NuovoPreventivoHeader />
      <PreventivoForm clienti={clienti} initialClienteId={initialClienteId} />
    </>
  );
}
