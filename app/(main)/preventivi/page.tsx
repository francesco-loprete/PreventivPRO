import { redirect } from "next/navigation";
import { PreventiviPageContent } from "@/components/preventivi/preventivi-page-content";
import { getUserClienti } from "@/lib/clienti/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUserPreventivi } from "@/lib/preventivi/queries";

export const dynamic = "force-dynamic";

export default async function PreventiviPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="card p-8 text-amber-300 border-amber-900/40">
        Supabase non configurato. Imposta{" "}
        <code className="text-accent">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
        <code className="text-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> su
        Vercel o in <code className="text-accent">.env.local</code>.
      </div>
    );
  }

  const result = await getUserPreventivi();
  const clientiResult = await getUserClienti();
  const clienti = clientiResult.ok ? clientiResult.clienti : [];

  if (!result.ok) {
    if (result.reason === "unauthenticated") {
      redirect("/login?redirectTo=/preventivi");
    }

    return (
      <PreventiviPageContent
        preventivi={[]}
        clienti={clienti}
        errorMessage={result.message}
      />
    );
  }

  return (
    <PreventiviPageContent
      preventivi={result.preventivi}
      clienti={clienti}
    />
  );
}
