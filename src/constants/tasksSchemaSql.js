/** Supabase SQL Editor'de kullanılmak üzere — `schema.sql` ile uyumlu görevler tablosu özeti */

export const TASKS_DDL_SQL = `-- public.tasks — görev planı (TaskListScreen / HomeScreen / TaskDetail)
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
create index tasks_user_done_idx on public.tasks (user_id, done);`;

export const TASKS_RLS_SQL = `-- RLS — istemci auth.uid() ile kendi satırlarına erişir
alter table public.tasks enable row level security;

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
  using (auth.uid() = user_id);`;

export const TASKS_SAMPLE_QUERIES_SQL = `-- Örnek sorgular (Table Editor veya SQL Editor)
-- Kendi kullanıcı kimliğinizle test için oturumlu olun.

select id, title, time, date_key, done, priority, notes, attachments, updated_at
from public.tasks
order by date_key desc, time asc
limit 50;

-- Realtime: Dashboard → Database → Replication → public.tasks`;

/** TaskListScreen: ekleme, düzenleme, kaydırarak tamamlama (done), silme — mobil istemci ile aynı kolonlar */
export const TASKS_CRUD_SQL = `-- =============================================================================
-- TaskListScreen işlemleri — public.tasks (RLS: yalnızca auth.uid() = user_id)
-- SQL Editor'de oturum yerine auth.uid() kullanılamıyorsa user_id'yi elle yazın.
-- =============================================================================

-- 1) YENİ GÖREV (+ Seçili tarihe görev ekle → insert)
insert into public.tasks (
  user_id, id, title, time, date_key, done, priority, notes, attachments
)
values (
  auth.uid(),
  '1730000000000-ornekid',
  'Toplantı hazırlığı',
  '14:30',
  '2026-05-15'::date,
  false,
  'high',
  '',
  '[]'::jsonb
);
-- priority: 'high' | 'medium' | 'low'
-- id: uygulamada genelde Date.now + rastgele sonek (metin)

-- 2) DÜZENLE (başlık, saat, tarih, öncelik)
update public.tasks
set
  title = 'Güncel başlık',
  time = '15:00',
  date_key = '2026-05-16'::date,
  priority = 'medium'
where user_id = auth.uid()
  and id = '1730000000000-ornekid';

-- 3) KAYDIRARAK TAMAMLAMA / GERİ AL (TaskItem swipe → toggle done)
update public.tasks
set done = true
where user_id = auth.uid()
  and id = '1730000000000-ornekid';

update public.tasks
set done = not done
where user_id = auth.uid()
  and id = '1730000000000-ornekid';

-- 4) SİL
delete from public.tasks
where user_id = auth.uid()
  and id = '1730000000000-ornekid';

-- 5) UPSERT (yerel kayıtları buluta itme — istemci upsert ile uyumlu)
insert into public.tasks (
  user_id, id, title, time, date_key, done, priority, notes, attachments
)
values (
  auth.uid(),
  '1730000000000-ornekid',
  'Başlık',
  '09:00',
  current_date,
  false,
  'low',
  '',
  '[]'::jsonb
)
on conflict (user_id, id) do update set
  title = excluded.title,
  time = excluded.time,
  date_key = excluded.date_key,
  done = excluded.done,
  priority = excluded.priority,
  notes = excluded.notes,
  attachments = excluded.attachments;

-- 6) TOPLU (dikkat): bir günün tüm satırları
-- delete from public.tasks
-- where user_id = auth.uid() and date_key = '2026-05-15'::date;`;