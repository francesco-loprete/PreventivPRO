import { redirect } from "next/navigation";
import {
  ClientiPageError,
  ClientiPageHeader,
} from "@/components/clienti/clienti-page-header";
import { getUserClienti } from "@/lib/clienti/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ClientiTable } from "./clienti-table";

export const dynamic = "force-dynamic";

export default async function ClientiPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="card p-8 text-amber-300 border-amber-900/40">
        Supabase non configurato.
      </div>
    );
  }

  const result = await getUserClienti();

  if (!result.ok) {
    if (result.reason === "unauthenticated") {
      redirect("/login?redirectTo=/clienti");
    }

    return <ClientiPageError message={result.message} />;
  }

  return (
    <>
      <ClientiPageHeader />
      <ClientiTable clienti={result.clienti} />
    </>
  );
}
