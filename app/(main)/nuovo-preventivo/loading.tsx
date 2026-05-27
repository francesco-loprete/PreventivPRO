export default function NuovoPreventivoLoading() {
  return (
    <>
      <div className="h-10 w-72 rounded-lg bg-card animate-pulse mb-10" aria-hidden />
      <div className="card p-8 max-w-4xl space-y-6" role="status" aria-live="polite">
        <div className="h-12 rounded-xl bg-slate-950/60 animate-pulse" aria-hidden />
        <div className="h-32 rounded-xl bg-slate-950/60 animate-pulse" aria-hidden />
        <p className="text-muted text-sm">Caricamento formulario...</p>
      </div>
    </>
  );
}
