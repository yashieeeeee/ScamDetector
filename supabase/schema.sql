-- ============================================================
-- ScamDetector — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- ── 1. Profiles ──────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  email         text,
  display_name  text,
  avatar_color  text default '#E24B4A',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. Scans ─────────────────────────────────────────────────
create table if not exists public.scans (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  scan_type       text not null check (scan_type in ('text', 'url', 'image')),
  content_preview text,
  risk_level      text not null check (risk_level in ('DANGER', 'WARNING', 'SAFE')),
  risk_score      integer not null check (risk_score between 0 and 100),
  verdict         text,
  summary         text,
  advice          text,
  flags           jsonb,
  url_details     jsonb,
  created_at      timestamptz default now()
);

create index if not exists scans_user_id_idx on public.scans (user_id);
create index if not exists scans_created_at_idx on public.scans (created_at desc);

alter table public.scans enable row level security;

create policy "Users can view own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.scans for delete
  using (auth.uid() = user_id);


-- ── 3. Shared results ────────────────────────────────────────
create table if not exists public.shared_results (
  id          uuid default gen_random_uuid() primary key,
  slug        text unique not null,
  verdict     text,
  risk_level  text,
  risk_score  integer,
  summary     text,
  advice      text,
  flags       jsonb,
  scan_type   text,
  created_at  timestamptz default now(),
  -- Expire after 30 days (optional — enforce via pg_cron or just ignore)
  expires_at  timestamptz default (now() + interval '30 days')
);

create index if not exists shared_results_slug_idx on public.shared_results (slug);

alter table public.shared_results enable row level security;

-- Anyone can read shared results (they're public by design)
create policy "Anyone can read shared results"
  on public.shared_results for select
  using (true);

-- Any authenticated user can create a share
create policy "Authenticated users can create shared results"
  on public.shared_results for insert
  with check (auth.role() = 'authenticated');


-- ── 4. Family members ────────────────────────────────────────
create table if not exists public.family_members (
  id              uuid default gen_random_uuid() primary key,
  owner_id        uuid references auth.users on delete cascade not null,
  invited_email   text not null,
  member_user_id  uuid references auth.users on delete set null,
  status          text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at      timestamptz default now()
);

create index if not exists family_members_owner_idx on public.family_members (owner_id);

alter table public.family_members enable row level security;

create policy "Owners can manage their family members"
  on public.family_members for all
  using (auth.uid() = owner_id);

create policy "Members can view their own invites"
  on public.family_members for select
  using (auth.uid() = member_user_id);

create policy "Members can accept/decline invites"
  on public.family_members for update
  using (auth.uid() = member_user_id);

-- Family members can read each other's scans
create policy "Family members can read owner's members scans"
  on public.scans for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.family_members fm
      where fm.owner_id = auth.uid()
        and fm.member_user_id = scans.user_id
        and fm.status = 'accepted'
    )
  );

-- ============================================================
-- Done! Your ScamDetector database is ready.
-- ============================================================
