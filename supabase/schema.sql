-- ============================================================
-- Schéma Supabase — à exécuter dans SQL Editor (supabase.com)
-- ============================================================

-- Profils utilisateurs (lié à auth.users)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  role         text not null default 'student' check (role in ('student', 'admin')),
  created_at   timestamptz default now()
);

-- Progression des activités
create table if not exists public.progress (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  ref        text not null,
  label      text,
  score      int,
  total      int,
  percent    int,
  created_at timestamptz default now()
);

create index if not exists progress_user_id_idx on public.progress(user_id);
create index if not exists progress_created_at_idx on public.progress(created_at desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

-- Profils : lecture / mise à jour de son propre profil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Admin : lecture de tous les profils
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Progression : lecture / insertion de ses propres données
create policy "progress_select_own"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

-- Admin : lecture de toute la progression
create policy "progress_select_admin"
  on public.progress for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
