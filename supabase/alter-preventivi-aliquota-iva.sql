-- Aliquota IVA per preventivo (0, 4, 10, 22).
-- Esegui nel SQL Editor di Supabase.
-- Compatibile con tutti i preventivi esistenti: i record già presenti ricevono 22%.

alter table preventivi
  add column if not exists aliquota_iva integer;

update preventivi
set aliquota_iva = 22
where aliquota_iva is null;

alter table preventivi
  alter column aliquota_iva set default 22;

alter table preventivi
  alter column aliquota_iva set not null;

comment on column preventivi.aliquota_iva is
  'Aliquota IVA applicata al preventivo (0, 4, 10, 22). prezzo resta imponibile IVA esclusa.';
