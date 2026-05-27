"use client";

type PreventiviErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PreventiviError({ error, reset }: PreventiviErrorProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Preventivi</h1>
      </div>
      <div className="card p-8 border-red-900/40">
        <p className="text-red-400" role="alert">
          Errore imprevisto: {error.message}
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-6">
          Riprova
        </button>
      </div>
    </>
  );
}
