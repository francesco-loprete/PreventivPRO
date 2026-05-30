type FormFeedbackProps = {
  error?: string | null;
  success?: string | null;
  loading?: boolean;
  loadingMessage?: string;
  className?: string;
};

export function FormFeedback({
  error,
  success,
  loading = false,
  loadingMessage = "Operazione in corso...",
  className = "",
}: FormFeedbackProps) {
  return (
    <div className={className}>
      {loading && (
        <p className="text-muted text-sm animate-pulse" role="status" aria-live="polite">
          {loadingMessage}
        </p>
      )}
      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
      {success && !loading && (
        <p className="text-accent text-sm" role="status">
          {success}
        </p>
      )}
    </div>
  );
}
