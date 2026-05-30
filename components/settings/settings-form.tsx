"use client";

import { BRAND_COMPANY } from "@/lib/branding/constants";
import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { LogoUpload } from "@/components/settings/logo-upload";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/settings/storage";

export function SettingsForm() {
  const t = useTranslations();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  function updateField<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      saveSettings({ ...settings, locale: loadSettings().locale });
      setSuccess(true);
    } catch {
      setError(t("settings.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <div className="card p-8 text-muted">
        {t("settings.loading")}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-8 max-w-2xl space-y-8"
    >
      <section>
        <h2 className="text-lg font-semibold text-accent mb-4">
          {t("settings.logoSection")}
        </h2>
        <LogoUpload
          value={settings.logoDataUrl}
          onChange={(logoDataUrl) => updateField("logoDataUrl", logoDataUrl)}
          disabled={saving}
          onError={setError}
        />
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-accent mb-4">
          {t("settings.companySection")}
        </h2>

        <div>
          <label htmlFor="companyName" className="block mb-2 text-muted text-sm">
            {t("settings.companyName")}
          </label>
          <input
            id="companyName"
            type="text"
            value={settings.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder={BRAND_COMPANY.companyName}
            className="input-field"
            disabled={saving}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block mb-2 text-muted text-sm">
            {t("common.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={settings.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder={BRAND_COMPANY.phone || "+39 333 1234567"}
            className="input-field"
            disabled={saving}
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 text-muted text-sm">
            {t("common.email")}
          </label>
          <input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder={BRAND_COMPANY.email || "info@azienda.it"}
            className="input-field"
            disabled={saving}
          />
        </div>
      </section>

      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-accent text-sm" role="status">
          {t("settings.saveSuccess")}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary px-6 py-4"
      >
        {saving ? t("common.saving") : t("settings.save")}
      </button>
    </form>
  );
}
