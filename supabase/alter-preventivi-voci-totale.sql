-- Opzionale: esegui solo se vuoi colonne dedicate voci/totale
-- (lo schema attuale usa descrizione + prezzo)

alter table preventivi
  add column if not exists voci jsonb,
  add column if not exists totale numeric;

-- Migra dati esistenti (prezzo -> totale)
update preventivi
set totale = prezzo
where totale is null and prezzo is not null;

-- Esempio policy RLS (adatta a auth.users se usi login)
-- alter table preventivi enable row level security;
-- create policy "Authenticated insert preventivi"
--   on preventivi for insert to authenticated with check (true);
-- create policy "Authenticated read preventivi"
--   on preventivi for select to authenticated using (true);
