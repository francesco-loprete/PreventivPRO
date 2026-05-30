-- Data di scadenza validità del preventivo.
-- Esegui manualmente nel SQL Editor di Supabase.

alter table preventivi
  add column if not exists valido_fino_al date;

comment on column preventivi.valido_fino_al is
  'Data fino alla quale il preventivo è valido (YYYY-MM-DD).';
