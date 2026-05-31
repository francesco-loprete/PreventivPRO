"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import {
  clearAuthParamsFromUrl,
  recoverSessionFromUrl,
  resolveAuthNextPath,
} from "@/lib/auth/recover-session-from-url";
import { createClient } from "@/lib/supabase/client";

export function AuthConfirmHandler() {
  const router = useRouter();
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function confirmSession() {
      const supabase = createClient();
      const next = resolveAuthNextPath(
        new URLSearchParams(window.location.search),
        new URLSearchParams(window.location.search).get("type")
      );

      const result = await recoverSessionFromUrl(supabase);

      if (cancelled) return;

      if (result.status === "recovered") {
        clearAuthParamsFromUrl();
        router.replace(next);
        router.refresh();
        return;
      }

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        router.replace(next);
        router.refresh();
        return;
      }

      setError(t("login.authCallbackError"));
    }

    confirmSession();

    return () => {
      cancelled = true;
    };
  }, [router, t]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="w-full btn-secondary py-4"
        >
          {t("login.backToLogin")}
        </button>
      </div>
    );
  }

  return <p className="text-muted text-sm">{t("common.loading")}</p>;
}
