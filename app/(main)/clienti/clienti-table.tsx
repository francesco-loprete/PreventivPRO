"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { FormFeedback } from "@/components/ui/form-feedback";
import { SearchInput } from "@/components/ui/search-input";
import { createClient } from "@/lib/supabase/client";
import { matchesAnyField } from "@/lib/utils/search";
import type { Cliente } from "@/lib/types/cliente";
import { rlsClientiErrorHint } from "@/lib/types/cliente";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
});

type ClientiTableProps = {
  clienti: Cliente[];
};

type ClienteFormData = {
  nome: string;
  telefono: string;
  email: string;
  indirizzo: string;
  note: string;
};

const emptyForm: ClienteFormData = {
  nome: "",
  telefono: "",
  email: "",
  indirizzo: "",
  note: "",
};

export function ClientiTable({ clienti: initialClienti }: ClientiTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState<ClienteFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 4000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filteredClienti = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return initialClienti;

    return initialClienti.filter((cliente) =>
      matchesAnyField(
        [cliente.nome, cliente.telefono, cliente.email, cliente.indirizzo, cliente.note],
        query
      )
    );
  }, [initialClienti, searchQuery]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  }

  function openEdit(cliente: Cliente) {
    setEditing(cliente);
    setForm({
      nome: cliente.nome,
      telefono: cliente.telefono ?? "",
      email: cliente.email ?? "",
      indirizzo: cliente.indirizzo ?? "",
      note: cliente.note ?? "",
    });
    setError(null);
    setSuccess(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setError(null);
  }

  function updateField(field: keyof ClienteFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nomeTrimmed = form.nome.trim();
    if (!nomeTrimmed) {
      setError("Inserisci il nome del cliente.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Sessione scaduta. Accedi di nuovo.");
      return;
    }

    const payload = {
      nome: nomeTrimmed,
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
      indirizzo: form.indirizzo.trim() || null,
      note: form.note.trim() || null,
    };

    const { error: saveError } = editing
      ? await supabase
          .from("clienti")
          .update(payload)
          .eq("id", editing.id)
          .eq("user_id", user.id)
      : await supabase.from("clienti").insert({ ...payload, user_id: user.id });

    setLoading(false);

    if (saveError) {
      setError(saveError.message + rlsClientiErrorHint(saveError.code));
      return;
    }

    closeForm();
    setSuccess(
      editing ? "Cliente aggiornato con successo." : "Cliente aggiunto con successo."
    );
    router.refresh();
  }

  async function handleDelete(cliente: Cliente) {
    const confirmed = window.confirm(`Eliminare ${cliente.nome} dall'archivio?`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Sessione scaduta. Accedi di nuovo.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("clienti")
      .delete()
      .eq("id", cliente.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message + rlsClientiErrorHint(deleteError.code));
      return;
    }

    setSuccess("Cliente eliminato.");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-muted text-sm">
          {filteredClienti.length} di {initialClienti.length} clienti
        </p>
        <button
          type="button"
          onClick={openCreate}
          disabled={loading}
          className="btn-primary"
        >
          + Nuovo cliente
        </button>
      </div>

      <div className="mb-6">
        <SearchInput
          id="clienti-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cerca cliente per nome, telefono, email..."
          disabled={loading}
        />
      </div>

      <FormFeedback
        error={!showForm ? error : null}
        success={!showForm ? success : null}
        className="mb-4 space-y-2"
      />

      {!initialClienti.length ? (
        <div className="card p-12 text-center">
          <p className="text-muted mb-6">Nessun cliente in archivio.</p>
          <button type="button" onClick={openCreate} className="text-accent font-semibold">
            Aggiungi il primo cliente
          </button>
        </div>
      ) : filteredClienti.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted">Nessun cliente corrisponde alla ricerca.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted uppercase text-xs tracking-wide">
                  <th className="px-4 sm:px-6 py-4">Nome</th>
                  <th className="px-4 sm:px-6 py-4 hidden sm:table-cell">Telefono</th>
                  <th className="px-4 sm:px-6 py-4 hidden md:table-cell">Email</th>
                  <th className="px-4 sm:px-6 py-4 hidden lg:table-cell">Creato</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredClienti.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-border/60 hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 font-medium">{cliente.nome}</td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell text-muted">
                      {cliente.telefono || "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell text-muted">
                      {cliente.email || "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell text-muted">
                      {cliente.created_at
                        ? dateFormatter.format(new Date(cliente.created_at))
                        : "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => router.push(`/clienti/${cliente.id}`)}
                          disabled={loading}
                          className="btn-ghost hover:border-accent hover:text-accent"
                        >
                          Dettagli
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(cliente)}
                          disabled={loading}
                          className="btn-ghost hover:border-accent hover:text-accent"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cliente)}
                          disabled={loading}
                          className="px-3 py-1.5 text-sm rounded-lg border border-red-900/60 text-red-400 hover:bg-red-950/80 hover:border-red-700 transition-colors disabled:opacity-50"
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cliente-form-title"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto card p-6 sm:p-8 shadow-2xl shadow-black/40"
          >
            <h2 id="cliente-form-title" className="text-2xl font-bold mb-6">
              {editing ? "Modifica" : "Nuovo"}{" "}
              <span className="text-accent">cliente</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="cliente-nome" className="block mb-2 text-muted text-sm">
                  Nome *
                </label>
                <input
                  id="cliente-nome"
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => updateField("nome", e.target.value)}
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cliente-telefono" className="block mb-2 text-muted text-sm">
                    Telefono
                  </label>
                  <input
                    id="cliente-telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => updateField("telefono", e.target.value)}
                    className="input-field"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="cliente-email" className="block mb-2 text-muted text-sm">
                    Email
                  </label>
                  <input
                    id="cliente-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cliente-indirizzo" className="block mb-2 text-muted text-sm">
                  Indirizzo
                </label>
                <input
                  id="cliente-indirizzo"
                  type="text"
                  value={form.indirizzo}
                  onChange={(e) => updateField("indirizzo", e.target.value)}
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="cliente-note" className="block mb-2 text-muted text-sm">
                  Note
                </label>
                <textarea
                  id="cliente-note"
                  value={form.note}
                  onChange={(e) => updateField("note", e.target.value)}
                  rows={3}
                  className="input-field resize-y min-h-[80px]"
                  disabled={loading}
                />
              </div>
            </div>

            <FormFeedback
              error={error}
              loading={loading}
              loadingMessage="Salvataggio in corso..."
              className="mt-4 space-y-2"
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-6">
              <button
                type="button"
                onClick={closeForm}
                disabled={loading}
                className="btn-secondary disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Salvataggio..." : editing ? "Salva modifiche" : "Aggiungi cliente"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
