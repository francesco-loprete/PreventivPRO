"use client";

import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthConfirmHandler } from "@/components/auth/auth-confirm-handler";
import { useTranslations } from "@/components/i18n/locale-provider";

function AuthConfirmFallback() {
  const t = useTranslations();

  return (
    <AuthCard title={t("common.loading")} subtitle="">
      <p className="text-muted text-sm">{t("common.loading")}</p>
    </AuthCard>
  );
}

export function AuthConfirmPageContent() {
  const t = useTranslations();

  return (
    <AuthCard title={t("common.loading")} subtitle="">
      <Suspense
        fallback={<p className="text-muted text-sm">{t("common.loading")}</p>}
      >
        <AuthConfirmHandler />
      </Suspense>
    </AuthCard>
  );
}

export { AuthConfirmFallback };
