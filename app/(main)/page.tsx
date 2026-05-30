import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getUserClientiCount } from "@/lib/clienti/queries";
import { computeDashboardStats } from "@/lib/dashboard/stats";
import { getUserPreventivi } from "@/lib/preventivi/queries";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let clientiCount = 0;
  let stats = {
    preventiviCount: 0,
    totaleEmesso: 0,
    ultimoPreventivo: null as Awaited<
      ReturnType<typeof computeDashboardStats>
    >["ultimoPreventivo"],
  };

  if (user) {
    const [preventiviResult, count] = await Promise.all([
      getUserPreventivi(),
      getUserClientiCount(),
    ]);

    clientiCount = count;

    if (preventiviResult.ok) {
      stats = computeDashboardStats(preventiviResult.preventivi);
    }
  }

  return (
    <DashboardView
      user={Boolean(user)}
      clientiCount={clientiCount}
      preventiviCount={stats.preventiviCount}
      totaleEmesso={stats.totaleEmesso}
      ultimoPreventivo={stats.ultimoPreventivo}
    />
  );
}
