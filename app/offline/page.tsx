import Link from "next/link";
import { BrandTitle } from "@/components/brand-title";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-md text-center card p-10">
        <h1 className="text-3xl font-bold mb-4">
          Sei <span className="text-accent">offline</span>
        </h1>
        <p className="text-muted mb-8">
          PreventivPRO non ha connessione. Le pagine già visitate potrebbero essere
          disponibili; per dati aggiornati torna online.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Riprova
        </Link>
        <p className="mt-8 text-sm text-muted/60">
          <BrandTitle size="sm" />
        </p>
      </div>
    </main>
  );
}
