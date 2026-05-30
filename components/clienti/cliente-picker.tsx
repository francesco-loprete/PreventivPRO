"use client";

import type { Cliente } from "@/lib/types/cliente";
import type { ClientePickerValue } from "@/lib/clienti/resolve-cliente";
import { useTranslations } from "@/components/i18n/locale-provider";

export type ClientePickerState = ClientePickerValue;

type ClientePickerProps = {
  clienti: Cliente[];
  value: ClientePickerState;
  onChange: (value: ClientePickerState) => void;
  disabled?: boolean;
  idPrefix?: string;
};

export function createClientePickerState(
  clienti: Cliente[],
  options?: { clienteId?: number | null; nomeFallback?: string }
): ClientePickerState {
  const { clienteId, nomeFallback = "" } = options ?? {};

  if (clienteId) {
    const found = clienti.find((c) => c.id === clienteId);
    if (found) {
      return { mode: "existing", clienteId: found.id, nome: found.nome };
    }
  }

  if (nomeFallback.trim()) {
    const match = clienti.find(
      (c) => c.nome.trim().toLowerCase() === nomeFallback.trim().toLowerCase()
    );
    if (match) {
      return { mode: "existing", clienteId: match.id, nome: match.nome };
    }

    return {
      mode: "new",
      nome: nomeFallback,
      telefono: "",
      email: "",
      indirizzo: "",
      note: "",
    };
  }

  if (clienti.length > 0) {
    return {
      mode: "existing",
      clienteId: clienti[0].id,
      nome: clienti[0].nome,
    };
  }

  return {
    mode: "new",
    nome: "",
    telefono: "",
    email: "",
    indirizzo: "",
    note: "",
  };
}

export function ClientePicker({
  clienti,
  value,
  onChange,
  disabled = false,
  idPrefix = "cliente",
}: ClientePickerProps) {
  const t = useTranslations();

  function setExisting(clienteId: number) {
    const found = clienti.find((c) => c.id === clienteId);
    if (!found) return;
    onChange({ mode: "existing", clienteId: found.id, nome: found.nome });
  }

  function setNewField(
    field: "nome" | "telefono" | "email" | "indirizzo" | "note",
    fieldValue: string
  ) {
    if (value.mode !== "new") return;
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || clienti.length === 0}
          onClick={() => {
            if (clienti.length === 0) return;
            const first = clienti[0];
            onChange({
              mode: "existing",
              clienteId: first.id,
              nome: first.nome,
            });
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value.mode === "existing"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:border-accent/50"
          } disabled:opacity-40`}
        >
          {t("preventivo.existingClient")}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onChange({
              mode: "new",
              nome: value.mode === "new" ? value.nome : "",
              telefono: value.mode === "new" ? value.telefono : "",
              email: value.mode === "new" ? value.email : "",
              indirizzo: value.mode === "new" ? value.indirizzo : "",
              note: value.mode === "new" ? value.note : "",
            })
          }
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value.mode === "new"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:border-accent/50"
          }`}
        >
          {t("preventivo.newClient")}
        </button>
      </div>

      {value.mode === "existing" ? (
        <div>
          <label
            htmlFor={`${idPrefix}-select`}
            className="block mb-2 text-muted text-sm"
          >
            {t("preventivo.selectClient")}
          </label>
          {clienti.length === 0 ? (
            <p className="text-sm text-muted">
              {t("preventivo.noClientsInArchive")}
            </p>
          ) : (
            <select
              id={`${idPrefix}-select`}
              value={value.clienteId}
              onChange={(e) => setExisting(Number(e.target.value))}
              className="input-field"
              disabled={disabled}
              required
            >
              {clienti.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                  {cliente.telefono ? ` · ${cliente.telefono}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={`${idPrefix}-nome`}
              className="block mb-2 text-muted text-sm"
            >
              {t("preventivo.nameRequired")}
            </label>
            <input
              id={`${idPrefix}-nome`}
              type="text"
              required
              value={value.nome}
              onChange={(e) => setNewField("nome", e.target.value)}
              placeholder="Mario Rossi"
              className="input-field"
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`${idPrefix}-telefono`}
                className="block mb-2 text-muted text-sm"
              >
                {t("common.phone")}
              </label>
              <input
                id={`${idPrefix}-telefono`}
                type="tel"
                value={value.telefono}
                onChange={(e) => setNewField("telefono", e.target.value)}
                placeholder="+39 333 1234567"
                className="input-field"
                disabled={disabled}
              />
            </div>
            <div>
              <label
                htmlFor={`${idPrefix}-email`}
                className="block mb-2 text-muted text-sm"
              >
                {t("common.email")}
              </label>
              <input
                id={`${idPrefix}-email`}
                type="email"
                value={value.email}
                onChange={(e) => setNewField("email", e.target.value)}
                placeholder="mario@email.it"
                className="input-field"
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-indirizzo`}
              className="block mb-2 text-muted text-sm"
            >
              {t("common.address")}
            </label>
            <input
              id={`${idPrefix}-indirizzo`}
              type="text"
              value={value.indirizzo}
              onChange={(e) => setNewField("indirizzo", e.target.value)}
              placeholder="Via Roma 1, Milano"
              className="input-field"
              disabled={disabled}
            />
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-note`}
              className="block mb-2 text-muted text-sm"
            >
              {t("common.notes")}
            </label>
            <textarea
              id={`${idPrefix}-note`}
              value={value.note}
              onChange={(e) => setNewField("note", e.target.value)}
              placeholder="Note interne sul cliente..."
              rows={2}
              className="input-field resize-y min-h-[72px]"
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
