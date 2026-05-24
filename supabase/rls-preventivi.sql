-- Esegui nel SQL Editor di Supabase se l'insert fallisce per RLS (errore 42501).
-- La tabella nel progetto si chiama "Preventivi" (P maiuscola).

alter table "Preventivi" enable row level security;

create policy "Allow public read Preventivi"
  on "Preventivi"
  for select
  to anon, authenticated
  using (true);

create policy "Allow public insert Preventivi"
  on "Preventivi"
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow public update Preventivi"
  on "Preventivi"
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow public delete Preventivi"
  on "Preventivi"
  for delete
  to anon, authenticated
  using (true);
