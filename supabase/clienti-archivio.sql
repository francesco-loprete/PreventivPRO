-- Archivio clienti + collegamento preventivi
-- Esegui nel SQL Editor di Supabase (dopo auth-rls-preventivi.sql).

create table if not exists clienti (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  telefono text,
  email text,
  indirizzo text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists clienti_user_id_idx on clienti (user_id);
create index if not exists clienti_nome_idx on clienti (user_id, nome);

alter table preventivi
  add column if not exists cliente_id bigint references clienti (id) on delete set null;

create index if not exists preventivi_cliente_id_idx on preventivi (cliente_id);

-- Migra clienti distinti dai preventivi esistenti
insert into clienti (user_id, nome)
select distinct p.user_id, trim(p.cliente)
from preventivi p
where p.cliente is not null
  and trim(p.cliente) <> ''
  and p.user_id is not null
  and not exists (
    select 1
    from clienti c
    where c.user_id = p.user_id
      and lower(trim(c.nome)) = lower(trim(p.cliente))
  );

update preventivi p
set cliente_id = c.id
from clienti c
where p.cliente_id is null
  and p.user_id = c.user_id
  and lower(trim(p.cliente)) = lower(trim(c.nome));

alter table clienti enable row level security;

drop policy if exists "Users read own clienti" on clienti;
drop policy if exists "Users insert own clienti" on clienti;
drop policy if exists "Users update own clienti" on clienti;
drop policy if exists "Users delete own clienti" on clienti;

create policy "Users read own clienti"
  on clienti
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own clienti"
  on clienti
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own clienti"
  on clienti
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own clienti"
  on clienti
  for delete
  to authenticated
  using (auth.uid() = user_id);
