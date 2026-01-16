create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,

  author_name text,
  body text not null,

  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_created_at_idx on public.comments(created_at desc);

alter table public.comments enable row level security;

-- Anyone can read comments (public)
drop policy if exists "public can read comments" on public.comments;
create policy "public can read comments"
on public.comments for select
to anon, authenticated
using (true);

-- Logged-in users can add comments
drop policy if exists "users can insert comments" on public.comments;
create policy "users can insert comments"
on public.comments for insert
to authenticated
with check (true);

--  only owner can delete their comment
drop policy if exists "users can delete own comments" on public.comments;
create policy "users can delete own comments"
on public.comments for delete
to authenticated
using (user_id = auth.uid());
