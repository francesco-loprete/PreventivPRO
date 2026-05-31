import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content";

export const metadata = {
  title: "Informativa sulla privacy",
  description:
    "Informativa sulla privacy di PreventivPRO — trattamento dei dati personali conforme al GDPR.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link href="/" className="inline-block mb-8 hover:opacity-90 transition-opacity">
          <BrandLogo />
        </Link>

        <div className="card p-6 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Informativa sulla privacy
          </h1>
          <p className="text-muted text-sm mb-8">
            PreventivPRO — trattamento dei dati personali (GDPR)
          </p>

          <PrivacyPolicyContent />
        </div>

        <p className="text-center text-sm text-muted mt-8">
          <Link href="/login" className="text-accent hover:text-sky-400 font-medium">
            Torna al login
          </Link>
        </p>
      </div>
    </main>
  );
}
