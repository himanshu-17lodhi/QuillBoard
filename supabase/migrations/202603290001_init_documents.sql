create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'document_kind'
  ) then
    create type public.document_kind as enum ('folder', 'document');
  end if;
end
$$;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.documents(id) on delete cascade,
  kind public.document_kind not null default 'document',
  title text not null,
  slug text not null,
  content_json jsonb,
  plaintext text,
  plugin_data jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  version integer not null default 1,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_owner_slug_unique unique (owner_id, slug)
);

create index if not exists documents_owner_parent_sort_idx
  on public.documents (owner_id, parent_id, sort_order);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.bump_document_version()
returns trigger
language plpgsql
as $$
begin
  new.version = old.version + 1;
  return new;
end;
$$;

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at
before update on public.documents
for each row
execute function public.touch_updated_at();

drop trigger if exists documents_bump_version on public.documents;
create trigger documents_bump_version
before update on public.documents
for each row
execute function public.bump_document_version();

alter table public.documents enable row level security;

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
on public.documents
for select
using (auth.uid() = owner_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
on public.documents
for insert
with check (auth.uid() = owner_id);

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own"
on public.documents
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
on public.documents
for delete
using (auth.uid() = owner_id);

alter publication supabase_realtime add table public.documents;

