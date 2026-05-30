type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Cerca...",
  id = "search",
  disabled = false,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="input-field pl-10 pr-10"
        aria-label={placeholder}
      />
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        aria-hidden
      >
        ⌕
      </span>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-sm"
          aria-label="Cancella ricerca"
        >
          ✕
        </button>
      )}
    </div>
  );
}
