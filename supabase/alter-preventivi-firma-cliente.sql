-- Firma cliente (PNG base64 data URL) collegata al preventivo.
-- Esegui manualmente nel SQL Editor di Supabase.

alter table preventivi
  add column if not exists firma_cliente text;

comment on column preventivi.firma_cliente is
  'Firma cliente in formato data URL PNG (image/png;base64,...).';
