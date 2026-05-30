import { ImpostazioniContent } from "@/components/settings/impostazioni-content";
import { ImpostazioniPageHeader } from "@/components/settings/impostazioni-page-header";

export const metadata = {
  title: "Impostazioni",
};

export default function ImpostazioniPage() {
  return (
    <>
      <ImpostazioniPageHeader />
      <ImpostazioniContent />
    </>
  );
}
