import { redirect } from "next/navigation";
import { getUserClienti } from "@/lib/clienti/queries";
import { createClient } from "@/lib/supabase/server";
import { PreventivoForm } from "./preventivo-form";

export const dynamic = "force-dynamic";

export default async function NuovoPreventivo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/nuovo-preventivo");
  }

  const clientiResult = await getUserClienti();
  const clienti = clientiResult.ok ? clientiResult.clienti : [];

  return (
    <>
      <h1 className="text-4xl font-bold mb-10 tracking-tight">
        Nuovo <span className="text-accent">Preventivo</span>
      </h1>
      <PreventivoForm clienti={clienti} />
    </>
  );
}
