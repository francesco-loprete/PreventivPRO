import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-md text-center card p-10">
        <div className="flex justify-center mb-6">
          <BrandLogo />
        </div>
        <h1 className="text-3xl font-bold mb-4">
          Sei <span className="text-[#22C55E]">offline</span>
        </h1>
        <p className="text-muted mb-8">
          PreventivPRO non ha connessione. Le pagine già visitate potrebbero essere
          disponibili; per dati aggiornati torna online.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Riprova
        </Link>
      </div>
    </main>
  );
}
