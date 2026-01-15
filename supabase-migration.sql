-- =========================
-- BLOG POSTS TABLE + RLS
-- =========================

-- 1) Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),

  -- owner of the post (important for RLS)
  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null,
  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Helpful indexes (optional but recommended)
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);

-- 3) Auto-update updated_at whenever a row is updated
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;

create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

-- =========================
-- 4) RLS Policies
-- =========================
alter table public.posts enable row level security;

-- (A) VIEWER: anyone can read posts (public)
drop policy if exists "public can read posts" on public.posts;

create policy "public can read posts"
on public.posts
for select
to anon, authenticated
using (true);

-- (B) OWNER: only logged-in users can create their own posts
drop policy if exists "users can insert own posts" on public.posts;

create policy "users can insert own posts"
on public.posts
for insert
to authenticated
with check (user_id = auth.uid());

-- (C) OWNER: only owner can update their own posts
drop policy if exists "users can update own posts" on public.posts;

create policy "users can update own posts"
on public.posts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- (D) OWNER: only owner can delete their own posts
drop policy if exists "users can delete own posts" on public.posts;

create policy "users can delete own posts"
on public.posts
for delete
to authenticated
using (user_id = auth.uid());

alter table public.posts
add column if not exists author_name text;

