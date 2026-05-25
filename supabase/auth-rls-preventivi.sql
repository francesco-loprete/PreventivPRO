-- Esegui nel SQL Editor di Supabase dopo aver abilitato Auth.
-- Associa ogni preventivo all'utente autenticato.

alter table "Preventivi"
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- Rimuovi policy pubbliche anon (se presenti) prima di creare quelle per utenti autenticati.
drop policy if exists "Allow public read Preventivi" on "Preventivi";
drop policy if exists "Allow public insert Preventivi" on "Preventivi";
drop policy if exists "Allow public update Preventivi" on "Preventivi";
drop policy if exists "Allow public delete Preventivi" on "Preventivi";

create policy "Users read own preventivi"
  on "Preventivi"
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own preventivi"
  on "Preventivi"
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own preventivi"
  on "Preventivi"
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own preventivi"
  on "Preventivi"
  for delete
  to authenticated
  using (auth.uid() = user_id);
