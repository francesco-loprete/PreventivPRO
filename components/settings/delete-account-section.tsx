"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { FormFeedback } from "@/components/ui/form-feedback";
import { clearSettings } from "@/lib/settings/storage";
import { createClient } from "@/lib/supabase/client";

type DeleteStep = "idle" | "confirm" | "final";

export function DeleteAccountSection() {
  const router = useRouter();
  const t = useTranslations();
  const [step, setStep] = useState<DeleteStep>("idle");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled) {
        setIsLoggedIn(Boolean(user));
        setCheckingAuth(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  function resetFlow() {
    setStep("idle");
    setError(null);
    setSuccess(null);
  }

  async function handleDeleteAccount() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? t("settings.deleteAccountError"));
        setLoading(false);
        return;
      }

      clearSettings();

      const supabase = createClient();
      await supabase.auth.signOut();

      setSuccess(t("settings.deleteAccountSuccess"));
      router.push("/login");
      router.refresh();
    } catch {
      setError(t("settings.deleteAccountError"));
      setLoading(false);
    }
  }

  if (checkingAuth || !isLoggedIn) {
    return null;
  }

  return (
    <section className="card p-8 max-w-2xl mt-8 border border-red-900/40">
      <h2 className="text-lg font-semibold text-red-400 mb-3">
        {t("settings.deleteAccountSection")}
      </h2>

      <p className="text-muted text-sm mb-2">{t("settings.deleteAccountWarning")}</p>
      <p className="text-muted text-sm mb-6">{t("settings.deleteAccountDetails")}</p>

      <FormFeedback
        error={error}
        success={success}
        className="mb-4 space-y-2"
      />

      {step === "idle" && (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setStep("confirm");
          }}
          disabled={loading}
          className="px-6 py-3 text-sm rounded-lg border border-red-900/60 text-red-400 hover:bg-red-950/80 hover:border-red-700 transition-colors disabled:opacity-50"
        >
          {t("settings.deleteAccountButton")}
        </button>
      )}

      {step === "confirm" && (
        <div className="space-y-3">
          <p className="text-sm text-foreground/90">{t("settings.deleteAccountWarning")}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={resetFlow}
              disabled={loading}
              className="btn-secondary px-6 py-3"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={() => setStep("final")}
              disabled={loading}
              className="px-6 py-3 text-sm rounded-lg border border-red-900/60 text-red-400 hover:bg-red-950/80 hover:border-red-700 transition-colors disabled:opacity-50"
            >
              {t("settings.deleteAccountProceed")}
            </button>
          </div>
        </div>
      )}

      {step === "final" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-red-400">
            {t("settings.deleteAccountWarning")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={resetFlow}
              disabled={loading}
              className="btn-secondary px-6 py-3"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="px-6 py-3 text-sm rounded-lg border border-red-700 bg-red-950/60 text-red-300 hover:bg-red-950 transition-colors disabled:opacity-50 font-semibold"
            >
              {loading
                ? t("settings.deleteAccountDeleting")
                : t("settings.deleteAccountFinal")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
