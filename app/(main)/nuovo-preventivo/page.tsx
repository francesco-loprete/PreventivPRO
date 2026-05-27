import { redirect } from "next/navigation";
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

  return (
    <>
      <h1 className="text-4xl font-bold mb-10 tracking-tight">
        Nuovo <span className="text-accent">Preventivo</span>
      </h1>
      <PreventivoForm />
    </>
  );
}
