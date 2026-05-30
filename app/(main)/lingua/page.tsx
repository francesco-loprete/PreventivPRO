import { LanguageSelector } from "@/components/lingua/language-selector";
import { LinguaPageHeader } from "@/components/lingua/lingua-page-header";

export const metadata = {
  title: "Lingua",
};

export default function LinguaPage() {
  return (
    <>
      <LinguaPageHeader />
      <LanguageSelector />
    </>
  );
}
