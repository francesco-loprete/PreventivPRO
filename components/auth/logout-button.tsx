"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-left text-sm text-muted hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {loading ? t("nav.logoutLoading") : t("nav.logout")}
    </button>
  );
}
