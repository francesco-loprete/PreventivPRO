"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { sanitizeInternalRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/client";

type LoginMode = "login" | "forgot" | "forgot-sent";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const redirectTo = sanitizeInternalRedirectPath(
    searchParams.get("redirectTo")
  );
  const authError = searchParams.get("error");
  const resetSuccess = searchParams.get("reset") === "success";

  const [mode, setMode] = useState<LoginMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === "auth_callback" ? t("login.authCallbackError") : null
  );

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleForgotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMode("forgot-sent");
  }

  function showForgotForm() {
    setError(null);
    setMode("forgot");
  }

  function showLoginForm() {
    setError(null);
    setMode("login");
  }

  if (mode === "forgot-sent") {
    return (
      <div className="space-y-5">
        <p className="text-accent text-sm" role="status">
          {t("login.resetEmailSent")}
        </p>
        <button
          type="button"
          onClick={showLoginForm}
          className="w-full btn-secondary py-4"
        >
          {t("login.backToLogin")}
        </button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={handleForgotSubmit} className="space-y-5">
        <p className="text-muted text-sm">{t("login.forgotSubtitle")}</p>

        <div>
          <label htmlFor="forgot-email" className="block mb-2 text-muted text-sm">
            {t("common.email")}
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("login.emailPlaceholder")}
            className="input-field"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4"
        >
          {loading ? t("login.sendingResetLink") : t("login.sendResetLink")}
        </button>

        <p className="text-center text-sm text-muted">
          <button
            type="button"
            onClick={showLoginForm}
            className="text-accent hover:text-sky-400 font-medium"
          >
            {t("login.backToLogin")}
          </button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-5">
      {resetSuccess && (
        <p className="text-accent text-sm" role="status">
          {t("passwordReset.success")}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block mb-2 text-muted text-sm">
          {t("common.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("login.emailPlaceholder")}
          className="input-field"
          disabled={loading}
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <label htmlFor="password" className="text-muted text-sm">
            {t("login.password")}
          </label>
          <button
            type="button"
            onClick={showForgotForm}
            className="text-xs text-accent hover:text-sky-400 font-medium"
          >
            {t("login.forgotLink")}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-field"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-4"
      >
        {loading ? t("login.signingIn") : t("login.signIn")}
      </button>

      <p className="text-center text-sm text-muted">
        {t("login.noAccount")}{" "}
        <Link href="/registrazione" className="text-accent hover:text-sky-400 font-medium">
          {t("login.register")}
        </Link>
      </p>
    </form>
  );
}
