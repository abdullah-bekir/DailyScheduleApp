-- =============================================================================
-- Sadece Görevler (TaskListScreen / public.tasks) — kısa kurulum
-- Ana sayfa + görevler birlikte dokümante tam dosya: mobil_ana_sayfa_ve_gorevler.sql
-- =============================================================================
-- ÖNEMLİ: Bu dosyanın TAMAMINI çalıştırın (Ctrl+A → Run).
--         Sadece üstteki set_updated_at() fonksiyonu tablo OLUŞTURMAZ.
--         "create table if not exists public.tasks" aşağıdadır.
-- =============================================================================
-- Ne zaman: Ana şema veya profiles tarafını zaten çalıştırdıysan; görevler tablosu
--           eksikse veya sadece bu kısmı projeye ekliyorsan.
-- Nerede:   Supabase Dashboard → SQL Editor → bu dosyanın tamamını yapıştır → Run.
-- Not:      auth.users zaten vardır; RLS auth.uid() = user_id ile çalışır.
-- =============================================================================

-- updated_at — tetikleyici fonksiyonu (profiles ile paylaşılır; yoksa oluşur)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tablo
create table if not exists public.tasks (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  title text not null,
  time text not null,
  date_key date not null,
  done boolean not null default false,
  priority text not null check (priority in ('high', 'medium', 'low')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists tasks_user_date_key_idx on public.tasks (user_id, date_key);
create index if not exists tasks_user_done_idx on public.tasks (user_id, done);

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

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

drop trigger if exists tasks_set_updated_at on public.tasks;

-- PG 14+ "execute function"; eski sürümler için "execute procedure" da geçerlidir
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

comment on table public.tasks is 'Görev planı (Görevler ekranı): günlük şerit, liste, swipe.';
comment on column public.tasks.user_id is 'Satır sahibi; RLS: auth.uid() = user_id.';
comment on column public.tasks.id is 'İstemci üretimi metin kimlik.';
comment on column public.tasks.title is 'Görev başlığı.';
comment on column public.tasks.time is 'Saat metni (UI ile uyumlu).';
comment on column public.tasks.date_key is 'YYYY-MM-DD.';
comment on column public.tasks.done is 'Tamamlandı mı.';
comment on column public.tasks.priority is 'high | medium | low';

-- =============================================================================
-- Çalıştırdıktan sonra SQL Editor sonuç sekmesinde 3 sonuç bak:
-- 1) tasks_tablo_var = true  → public.tasks tablosu var.
-- 2) pg_class: relkind r = tablo, v = view; view ise CREATE TABLE IF NOT EXISTS atlandı.
-- 3) view satırı dönerse: önce `drop view if exists public.tasks;` sonra bu dosyayı tekrar.
-- =============================================================================
select
  exists(
    select 1
    from information_schema.tables t
    where t.table_schema = 'public' and t.table_name = 'tasks'
  ) as tasks_tablo_var;

select c.relkind as tur_r_tablo_v_view, n.nspname as sema, c.relname as ad
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'tasks';

select table_schema, table_name
from information_schema.views
where table_schema = 'public' and table_name = 'tasks';
