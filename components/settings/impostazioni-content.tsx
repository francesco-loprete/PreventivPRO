"use client";

import { SettingsForm } from "@/components/settings/settings-form";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

export function ImpostazioniContent() {
  return (
    <>
      <SettingsForm />
      <DeleteAccountSection />
    </>
  );
}
