-- =============================================================================
-- DailyscheduleApp — Supabase şema, RLS ve UI/UX veri eşlemesi
-- Supabase SQL Editor'de çalıştırın (tercihen yeni / boş public şema).
-- Table Editor: şema public; auth.users tetikleyicisi yeni kullanıcıda profil açar.
--
-- UI → TABLOLAR (tasarım / entegrasyon referansı)
-- -----------------------------------------------------------------------------
-- Ana sayfa (HomeScreen)
--   • Bugün özeti, görev önizlemesi, ilerleme → public.tasks (date_key = bugün)
--   • Motivasyon kartı metinleri uygulama içi havuzdadır; istenirse ileride
--     profiles veya ayrı bir tablo ile kişiselleştirilebilir.
-- Görev planı (TaskListScreen) + görev detayı (TaskDetailScreen)
--   • Günlük şerit, liste, durum, ekler (attachments) → public.tasks
-- İstatistikler (StatsScreen)
--   • Grafikler, öncelik dağılımı → public.tasks üzerinden türetilir
--   • Tamamlama puanı göstergesi → profiles.completion_tally (+ yerel senkron)
-- Ayarlar (SettingsScreen)
--   • Koyu tema → profiles.theme_mode ('light' | 'dark')
--   • Hatırlatıcı tercihi → profiles.notifications_enabled
--   • Premium alanı (yakında) → profiles.premium_enrolled (yer tutucu)
-- -----------------------------------------------------------------------------
-- Not: SQL ile Table Editor aynı proje / branch olmalı.
-- "relation already exists" → script'i tekrar tam çalıştırmayın; upgrade_*.sql kullanın.
-- =============================================================================

-- 4.1 Tablolar
create table public.profiles (
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

create table public.tasks (
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

create index tasks_user_date_key_idx on public.tasks (user_id, date_key);
create index tasks_user_done_idx on public.tasks (user_id, done);

-- 4.2 updated_at
-- İstemci updated_at gönderdiyse koru (görev LWW senkronu);
-- göndermediyse (kolon değişmedi / null) sunucu zamanını yaz.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.updated_at is null then
    new.updated_at = now();
  elsif tg_op = 'UPDATE' and new.updated_at is not distinct from old.updated_at then
    new.updated_at = now();
  end if;
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- 4.3 Yeni kullanıcıda profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4.4 RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 4.5 Açıklamalar (Table Editor / dokümantasyon — güvenli, tekrar çalıştırılabilir)
comment on table public.profiles is 'Kullanıcı başına tek satır: ayarlar, puan ve Premium yer tutucu (Ayarlar ekranı).';
comment on column public.profiles.id is 'auth.users.id ile aynı; RLS: auth.uid() = id.';
comment on column public.profiles.completion_tally is 'İstatistikler: tamamlama puanı; görev tamamlanınca istemci günceller.';
comment on column public.profiles.theme_mode is 'Ayarlar → Koyu tema: light | dark.';
comment on column public.profiles.notifications_enabled is 'Ayarlar → Hatırlatıcı bildirimleri tercihi.';
comment on column public.profiles.language_code is 'Seçilen uygulama dili: tr, en, es, de, fr, ar, pt, ru, zh, ja, ko, hi veya it.';
comment on column public.profiles.premium_enrolled is 'Ayarlar Premium kartı için yer tutucu; uygulama sürümüne göre kullanılır.';
comment on column public.profiles.created_at is 'Oluşturulma zamanı.';
comment on column public.profiles.updated_at is 'Son güncelleme; tetikleyici ile otomatik.';

comment on table public.tasks is 'Görev planı, ana sayfa ve istatistikler: tüm görev satırları.';
comment on column public.tasks.user_id is 'Satır sahibi; RLS: auth.uid() = user_id.';
comment on column public.tasks.id is 'İstemci üretimi metin kimlik (ör. Date.now tabanlı).';
comment on column public.tasks.title is 'Görev başlığı; liste ve kartlarda görünür.';
comment on column public.tasks.time is 'Saat metni (UI saat seçici ile uyumlu).';
comment on column public.tasks.date_key is 'YYYY-MM-DD; haftalık şerit ve günlük filtre.';
comment on column public.tasks.done is 'Tamamlandı mı; swipe ve rozet durumu.';
comment on column public.tasks.priority is 'Yüksek | orta | düşük — UI şerit renkleri: high|medium|low.';
comment on column public.tasks.notes is 'Görev notları; TaskDetail ekranı / istemci senkronu.';
comment on column public.tasks.attachments is 'Ek listesi (json dizi); TaskDetail ek dosya alanı.';
comment on column public.tasks.created_at is 'Oluşturulma zamanı.';
comment on column public.tasks.updated_at is 'Son güncelleme; tetikleyici ile otomatik.';
