export default function PreventiviLoading() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="h-10 w-48 rounded-lg bg-card animate-pulse" aria-hidden />
        <div className="h-12 w-44 rounded-xl bg-card animate-pulse" aria-hidden />
      </div>
      <div className="card p-12 text-center" role="status" aria-live="polite">
        <p className="text-muted">Caricamento preventivi...</p>
      </div>
    </>
  );
}
