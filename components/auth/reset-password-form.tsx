"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import {
  clearAuthParamsFromUrl,
  recoverSessionFromUrl,
} from "@/lib/auth/recover-session-from-url";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const t = useTranslations();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function prepareSession() {
      const supabase = createClient();
      const recovery = await recoverSessionFromUrl(supabase);

      if (cancelled) return;

      if (recovery.status === "recovered") {
        clearAuthParamsFromUrl();
      } else if (recovery.status === "error") {
        setError(recovery.message);
        setCheckingSession(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      setHasSession(Boolean(session));
      setCheckingSession(false);
    }

    prepareSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError(t("register.passwordMin"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("register.passwordMismatch"));
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();

    setLoading(false);
    router.replace("/login?reset=success");
    router.refresh();
  }

  if (checkingSession) {
    return <p className="text-muted text-sm">{t("common.loading")}</p>;
  }

  if (!hasSession) {
    return (
      <div className="space-y-5">
        <p className="text-red-400 text-sm" role="alert">
          {error ?? t("passwordReset.invalidSession")}
        </p>
        <Link href="/login" className="block w-full btn-primary py-4 text-center">
          {t("passwordReset.requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="new-password" className="block mb-2 text-muted text-sm">
          {t("passwordReset.newPassword")}
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("register.passwordPlaceholder")}
          className="input-field"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block mb-2 text-muted text-sm">
          {t("passwordReset.confirmPassword")}
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t("register.confirmPlaceholder")}
          className="input-field"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-accent text-sm" role="status">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-4"
      >
        {loading ? t("passwordReset.updating") : t("passwordReset.updatePassword")}
      </button>
    </form>
  );
}
