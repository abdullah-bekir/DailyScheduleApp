/**
 * Görevler: TaskList + TaskDetail (AppNavigator kök stack) + SQL yardım notları.
 * Uygulama ham SQL çalıştırmaz; Supabase SQL Editor’de kopyala-yapıştır için.
 * Kolonlar: supabase/sql/schema.sql ve lib/taskRemote.js ile uyumludur.
 */

export const TASKS_STACK_OVERVIEW_SQL = `-- =============================================================================
-- Görevler sekmesi — hangi işlem hangi tabloyu kullanır
-- -----------------------------------------------------------------------------
-- TaskListScreen   → public.tasks (liste, tarih filtresi, ekle, sil, done)
-- TaskDetailScreen → public.tasks (notes, attachments güncelleme — jsonb)
-- Ayarlar sıfırla  → delete from public.tasks where user_id = auth.uid()
-- Bu metinleri Supabase Dashboard → SQL Editor’de kullanın (uygulama içinde gösterilmez).
-- =============================================================================
`;

/** Tüm görevleri çekme (refresh / ilk yükleme) — RLS ile yalnızca kendi satırlarınız */
export const TASKS_STACK_SELECT_SQL = `-- Tüm görevlerim
select *
from public.tasks
where user_id = auth.uid()
order by date_key desc, time asc;`;

/** Modal / FAB ile yeni görev — addTask */
export const TASKS_STACK_INSERT_SQL = `-- Yeni görev ekle (addTask)
insert into public.tasks (
  user_id, id, title, time, date_key, done, priority, notes, attachments
)
values (
  auth.uid(),
  '1730000000000-ornekid',
  'Toplantı',
  '09:30',
  '2026-05-15'::date,
  false,
  'medium',
  '',
  '[]'::jsonb
);

-- Ek URI / dosya adları ile:
-- attachments: '["https://ornek.com/dosya.pdf", "Notlar.docx"]'::jsonb`;

/** Başlık, saat, tarih, öncelik düzenleme (manuel veya harici araç) */
export const TASKS_STACK_UPDATE_ROW_SQL = `-- Görev satırını düzenle
update public.tasks
set
  title = 'Yeni başlık',
  time = '15:00',
  date_key = '2026-05-16'::date,
  priority = 'high'
where user_id = auth.uid()
  and id = '1730000000000-ornekid';`;

/** toggleTaskDone — istemci yalnızca done günceller */
export const TASKS_STACK_TOGGLE_DONE_SQL = `-- Tamamlandı işaretle / geri al
update public.tasks
set done = true
where user_id = auth.uid()
  and id = '1730000000000-ornekid';

-- veya çevir:
-- update public.tasks set done = not coalesce(done, false)
-- where user_id = auth.uid() and id = '...';`;

/** TaskDetailScreen — notes + attachments */
export const TASKS_STACK_UPDATE_DETAIL_SQL = `-- Görev detayı: not ve ek listesi (jsonb dizi)
update public.tasks
set
  notes = 'İsteğe bağlı not metni',
  attachments = '["https://example.com/belge.pdf", "link-2"]'::jsonb
where user_id = auth.uid()
  and id = '1730000000000-ornekid';`;

/** Tek görev sil — deleteTask */
export const TASKS_STACK_DELETE_ONE_SQL = `-- Tek görevi sil
delete from public.tasks
where user_id = auth.uid()
  and id = '1730000000000-ornekid';`;

/** Ayarlar → Tüm veriyi sıfırla */
export const TASKS_STACK_DELETE_ALL_USER_SQL = `-- Oturum açmış kullanıcının tüm görevlerini sil
delete from public.tasks
where user_id = auth.uid();`;

/** Upsert — buluta itme senaryosu */
export const TASKS_STACK_UPSERT_SQL = `-- Çakışırsa güncelle (istemci upsert mantığına yakın)
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
  attachments = excluded.attachments;`;

export const TASKS_STACK_OPERATIONS_SQL = `${TASKS_STACK_OVERVIEW_SQL}

${TASKS_STACK_SELECT_SQL}

${TASKS_STACK_INSERT_SQL}

${TASKS_STACK_UPDATE_ROW_SQL}

${TASKS_STACK_TOGGLE_DONE_SQL}

${TASKS_STACK_UPDATE_DETAIL_SQL}

${TASKS_STACK_DELETE_ONE_SQL}

${TASKS_STACK_DELETE_ALL_USER_SQL}

${TASKS_STACK_UPSERT_SQL}`;
