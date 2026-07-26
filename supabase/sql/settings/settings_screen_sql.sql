-- =============================================================================
-- SettingsScreen SQL paketi (Supabase SQL Editor)
-- Dosya hedefi: src/screens/SettingsScreen.js
--
-- Bu paket şunları kapsar:
-- 1) profiles tablosunu oluşturur / eksik kolonları tamamlar
-- 2) tasks tablosunda reset işlemi için gereken alanları garanti eder
-- 3) RLS politikalarını oluşturur (kendi satırını oku/güncelle)
-- 4) Ayarlar ekranındaki işlemler için örnek CRUD sorguları verir
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Tablolar (idempotent: tekrar çalıştırılabilir)
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  completion_tally integer not null default 0 check (completion_tally >= 0),
  theme_mode text not null default 'light' check (theme_mode in ('light', 'dark')),
  notifications_enabled boolean not null default true,
  language_code text not null default 'tr'
    check (language_code in ('tr', 'en', 'es', 'de', 'fr', 'ar', 'pt', 'ru', 'zh', 'ja', 'ko', 'hi', 'it')),
  premium_enrolled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Projede eski şema varsa eksik kolonları tamamla
alter table public.profiles
  add column if not exists completion_tally integer not null default 0,
  add column if not exists theme_mode text not null default 'light',
  add column if not exists notifications_enabled boolean not null default true,
  add column if not exists language_code text not null default 'tr',
  add column if not exists premium_enrolled boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- theme_mode check kısıtı yoksa eklemek için güvenli blok
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_theme_mode_check'
  ) then
    alter table public.profiles
      add constraint profiles_theme_mode_check
      check (theme_mode in ('light', 'dark'));
  end if;
end
$$;

-- language_code check kısıtı yoksa eklemek için güvenli blok
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_language_code_check'
  ) then
    alter table public.profiles
      add constraint profiles_language_code_check
      check (language_code in ('tr', 'en', 'es', 'de', 'fr', 'ar', 'pt', 'ru', 'zh', 'ja', 'ko', 'hi', 'it'));
  end if;
end
$$;

-- Ayarlar ekranındaki "Tüm veriyi sıfırla" için tasks tablosu kontrolü
create table if not exists public.tasks (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  title text not null,
  time text not null,
  date_key date not null,
  done boolean not null default false,
  priority text not null check (priority in ('high', 'medium', 'low')),
  notes text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- -----------------------------------------------------------------------------
-- 2) updated_at tetikleyicisi
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3) Yeni kullanıcı için profil satırı (otomatik)
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4) RLS
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5) SettingsScreen işlemleri (örnek SQL)
-- -----------------------------------------------------------------------------

-- A) Profili oku (fetchProfile karşılığı)
-- select *
-- from public.profiles
-- where id = auth.uid();

-- B) Tema güncelle (Koyu tema aç/kapat)
-- update public.profiles
-- set theme_mode = 'dark' -- veya 'light'
-- where id = auth.uid();

-- C) Bildirim tercih güncelle
-- update public.profiles
-- set notifications_enabled = true -- veya false
-- where id = auth.uid();

-- D) completion_tally güncelle (uygulama bunu arttırır)
-- update public.profiles
-- set completion_tally = 0
-- where id = auth.uid();

-- E) Ayarlar ekranı "Tüm veriyi sıfırla" (resetAllTaskData içeriği)
-- delete from public.tasks where user_id = auth.uid();
-- update public.profiles set completion_tally = 0 where id = auth.uid();

-- -----------------------------------------------------------------------------
-- 6) Doğrulama sorguları (Table Editor'de görünmeme durumları için)
-- -----------------------------------------------------------------------------

-- select table_name
-- from information_schema.tables
-- where table_schema = 'public'
--   and table_name in ('profiles', 'tasks')
-- order by table_name;

-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'profiles'
-- order by ordinal_position;
