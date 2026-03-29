create extension if not exists pgcrypto;

create table if not exists public.daily_notes_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timezone text not null default 'UTC',
  date_format text not null default 'YYYY-MM-DD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.markdown_previewer_snapshots (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  html text not null,
  created_at timestamptz not null default now()
);

create index if not exists markdown_previewer_snapshots_document_created_idx
  on public.markdown_previewer_snapshots (document_id, created_at desc);

alter table public.daily_notes_preferences enable row level security;
alter table public.markdown_previewer_snapshots enable row level security;

drop policy if exists "daily_notes_preferences_own" on public.daily_notes_preferences;
create policy "daily_notes_preferences_own"
on public.daily_notes_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "markdown_previewer_snapshots_own" on public.markdown_previewer_snapshots;
create policy "markdown_previewer_snapshots_own"
on public.markdown_previewer_snapshots
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

