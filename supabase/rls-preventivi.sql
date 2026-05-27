-- DEPRECATO: policy pubbliche anon. Usa invece supabase/auth-rls-preventivi.sql
-- per ownership per utente con colonna user_id.

-- Esegui nel SQL Editor di Supabase se l'insert fallisce per RLS (errore 42501).
-- La tabella nel progetto si chiama preventivi (minuscolo).

alter table preventivi enable row level security;

create policy "Allow public read Preventivi"
  on preventivi
  for select
  to anon, authenticated
  using (true);

create policy "Allow public insert Preventivi"
  on preventivi
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow public update Preventivi"
  on preventivi
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow public delete Preventivi"
  on preventivi
  for delete
  to anon, authenticated
  using (true);
