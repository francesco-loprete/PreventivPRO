-- Crea tabella clienti (archivio)
-- Esegui manualmente nel SQL Editor di Supabase.
-- Non modifica preventivi né altre tabelle.

create table if not exists public.clienti (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  telefono text,
  email text,
  indirizzo text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists clienti_user_id_idx on public.clienti (user_id);
create index if not exists clienti_nome_idx on public.clienti (user_id, nome);

alter table public.clienti enable row level security;

drop policy if exists "Users read own clienti" on public.clienti;
drop policy if exists "Users insert own clienti" on public.clienti;
drop policy if exists "Users update own clienti" on public.clienti;
drop policy if exists "Users delete own clienti" on public.clienti;

create policy "Users read own clienti"
  on public.clienti
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own clienti"
  on public.clienti
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own clienti"
  on public.clienti
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own clienti"
  on public.clienti
  for delete
  to authenticated
  using (auth.uid() = user_id);
