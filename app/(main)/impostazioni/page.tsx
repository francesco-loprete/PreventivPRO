import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = {
  title: "Impostazioni",
};

export default function ImpostazioniPage() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted mt-2">
          Logo e dati azienda salvati localmente nel browser.
        </p>
      </div>

      <SettingsForm />
    </>
  );
}
