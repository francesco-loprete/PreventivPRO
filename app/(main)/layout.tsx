import { MainShell } from "@/components/layout/main-shell";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <MainShell userEmail={user?.email ?? ""} isLoggedIn={Boolean(user)}>
      {children}
    </MainShell>
  );
}
