-- Esegui nel SQL Editor di Supabase dopo aver abilitato Auth.
-- Tabella usata dall'app: preventivi (minuscolo).

alter table preventivi
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table preventivi enable row level security;

-- Rimuovi policy pubbliche (anon) se presenti.
drop policy if exists "Allow public read Preventivi" on preventivi;
drop policy if exists "Allow public insert Preventivi" on preventivi;
drop policy if exists "Allow public update Preventivi" on preventivi;
drop policy if exists "Allow public delete Preventivi" on preventivi;
drop policy if exists "Authenticated insert preventivi" on preventivi;
drop policy if exists "Authenticated read preventivi" on preventivi;

drop policy if exists "Users read own preventivi" on preventivi;
drop policy if exists "Users insert own preventivi" on preventivi;
drop policy if exists "Users update own preventivi" on preventivi;
drop policy if exists "Users delete own preventivi" on preventivi;

create policy "Users read own preventivi"
  on preventivi
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own preventivi"
  on preventivi
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own preventivi"
  on preventivi
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own preventivi"
  on preventivi
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Opzionale: assegna preventivi esistenti al primo utente (solo sviluppo).
-- update preventivi set user_id = '<uuid-utente>' where user_id is null;
-- alter table preventivi alter column user_id set not null;
