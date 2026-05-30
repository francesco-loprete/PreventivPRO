"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { useTranslations } from "@/components/i18n/locale-provider";

export function LoginPageContent() {
  const t = useTranslations();

  return (
    <AuthCard title={t("login.title")} subtitle={t("login.subtitle")}>
      <LoginForm />
    </AuthCard>
  );
}

export function LoginPageFallback() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <p className="text-muted text-sm">{t("common.loading")}</p>
    </main>
  );
}
