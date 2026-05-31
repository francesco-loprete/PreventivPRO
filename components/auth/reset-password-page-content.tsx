"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { useTranslations } from "@/components/i18n/locale-provider";

export function ResetPasswordPageContent() {
  const t = useTranslations();

  return (
    <AuthCard
      title={t("passwordReset.title")}
      subtitle={t("passwordReset.subtitle")}
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}

export function ResetPasswordPageFallback() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <p className="text-muted text-sm">{t("common.loading")}</p>
    </main>
  );
}
