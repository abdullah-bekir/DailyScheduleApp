-- =============================================================================
-- Mobil: Ana sayfa (HomeScreen) + Görevler (TaskListScreen) — public.tasks
-- Table Editor odaklı tek dosya: gorevler_table_editor_gorunur.sql
-- =============================================================================
-- Bu dosyayı Supabase SQL Editor’de TAMAMEN seçip (Ctrl+A) Run ile çalıştırın.
-- Sadece üst kısım (fonksiyon) tablo oluşturmaz; aşağıdaki CREATE TABLE satırları
-- zorunludur.
--
-- Veri nerede?
--   • Kurulum (bu dosya) = tablo + RLS + tetikleyici. Satır eklemez; tablo boş
--     kalabilir — bu normaldir.
--   • Satırlar: uygulamadan görev ekle / tamamla / sil VEYA aşağıdaki örnek
--     INSERT (yorumu kaldırıp kendi user_id ile) çalıştırırsın.
--
-- Ekran eşlemesi (React Native uygulaması)
--   Ana sayfa — Bugün özeti, kartlar, ilerleme
--     → public.tasks satırlarından date_key = bugün (yerel tarih, YYYY-MM-DD).
--   Görevler — Takvim, liste, filtreler, + görev ekle, kaydırarak tamamla
--     → aynı tablo; insert/update/delete istemci tarafında Supabase SDK ile.
--
-- Diğer tablolar: İstatistik/puan için profiles.completion_tally kullanılır;
-- profiles kurulumu için supabase/schema.sql veya mevcut ana şemanız yeterli.
-- =============================================================================

-- updated_at — tetikleyici (profiles tablosuyla paylaşılabilir)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

comment on table public.tasks is 'Ana sayfa + Görevler ekranı: günlük plan, liste, swipe.';
comment on column public.tasks.user_id is 'auth.users.id; RLS: auth.uid() = user_id.';
comment on column public.tasks.id is 'İstemci üretimi metin kimlik.';
comment on column public.tasks.title is 'Başlık.';
comment on column public.tasks.time is 'Saat metni.';
comment on column public.tasks.date_key is 'YYYY-MM-DD.';
comment on column public.tasks.done is 'Tamamlandı (kaydırma).';
comment on column public.tasks.priority is 'high | medium | low';

-- =============================================================================
-- Doğrulama (Results sekmesi)
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

-- =============================================================================
-- Uygulama ile aynı mantıkta örnek SQL (SQL Editor’de çalıştırmak için)
-- Authentication → Users’tan UUID kopyala; aşağıdaki BURAYA yerine yapıştır.
-- RLS nedeniyle Dashboard SQL oturumu bazen auth.uid() ile eşleşmez — test için
-- Role postgres ile policy “bypass” olabilir; üretimde veri uygulamadan gelir.
-- =============================================================================

/*
-- YENİ GÖREV (mobil: + Seçili tarihe görev ekle)
insert into public.tasks (user_id, id, title, time, date_key, done, priority)
values (
  'BURAYA_AUTH_USERS_UUID'::uuid,
  'manuel-' || extract(epoch from now())::bigint::text,
  'Test görevi',
  '14:30',
  current_date,
  false,
  'medium'
);

-- DÜZENLE
update public.tasks
set title = 'Yeni başlık', time = '15:00', date_key = current_date, priority = 'high'
where user_id = 'BURAYA_AUTH_USERS_UUID'::uuid and id = 'manuel-...';

-- TAMAMLANDI (kaydırma)
update public.tasks
set done = true
where user_id = 'BURAYA_AUTH_USERS_UUID'::uuid and id = 'manuel-...';

-- SİL
delete from public.tasks
where user_id = 'BURAYA_AUTH_USERS_UUID'::uuid and id = 'manuel-...';
*/
