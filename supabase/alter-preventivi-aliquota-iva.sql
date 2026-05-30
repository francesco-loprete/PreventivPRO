-- Aliquota IVA per preventivo (0, 4, 10, 22). Default 22% per nuovi record e compatibilità.
-- Esegui manualmente in Supabase SQL Editor.

alter table preventivi
  add column if not exists aliquota_iva numeric default 22;

comment on column preventivi.aliquota_iva is
  'Aliquota IVA applicata al preventivo (0, 4, 10, 22). prezzo resta imponibile IVA esclusa.';
