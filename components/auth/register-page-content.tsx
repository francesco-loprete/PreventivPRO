"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { useTranslations } from "@/components/i18n/locale-provider";

export function RegisterPageContent() {
  const t = useTranslations();

  return (
    <AuthCard title={t("register.title")} subtitle={t("register.subtitle")}>
      <RegisterForm />
    </AuthCard>
  );
}
