"use client";

import { useRef } from "react";

type LogoUploadProps = {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
  onError?: (message: string) => void;
};

const MAX_SIZE_MB = 2;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export function LogoUpload({
  value,
  onChange,
  disabled = false,
  onError,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError?.("Formato non supportato. Usa PNG, JPG, WEBP o SVG.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError?.(`Il file supera ${MAX_SIZE_MB} MB.`);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.onerror = () => {
      onError?.("Errore durante il caricamento del logo.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleRemove() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6 flex-wrap">
        <div className="w-40 h-40 rounded-2xl border border-border bg-slate-950/60 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Anteprima logo"
              className="max-w-full max-h-full object-contain p-3"
            />
          ) : (
            <span className="text-muted/60 text-sm text-center px-4">
              Nessun logo
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
            id="logo-upload"
          />
          <label
            htmlFor="logo-upload"
            className={`inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
              disabled
                ? "bg-slate-800 text-muted cursor-not-allowed"
                : "btn-primary"
            }`}
          >
            Carica logo
          </label>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="px-5 py-3 rounded-xl border border-red-900/60 text-red-400 text-sm hover:bg-red-950/80 disabled:opacity-50"
            >
              Rimuovi logo
            </button>
          )}
          <p className="text-xs text-muted/70 max-w-xs">
            PNG, JPG, WEBP o SVG · max {MAX_SIZE_MB} MB. Usato nei PDF preventivo.
          </p>
        </div>
      </div>
    </div>
  );
}
