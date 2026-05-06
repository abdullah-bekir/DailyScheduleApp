/**
 * TasksContext ↔ public.tasks (Supabase SQL Editor / dokümantasyon)
 * İstemci gerçekte @supabase/supabase-js kullanır; bu dosya aynı işlemlerin ham SQL karşılığıdır.
 * Kolonlar: lib/taskRemote.js → taskToRemoteRow ile uyumludur (notes, attachments dahil).
 */

/** İlk senkron + refreshTasksFromSupabase — select + user_id filtresi */
export const TASKS_CONTEXT_SELECT_SQL = `-- TasksContext: ilk yükleme / yenileme
select *
from public.tasks
where user_id = auth.uid();`;

/** addTask — insert */
export const TASKS_CONTEXT_INSERT_SQL = `-- TasksContext: addTask → insert
insert into public.tasks (
  user_id, id, title, time, date_key, done, priority, notes, attachments
)
values (
  auth.uid(),
  'ORNEK_METIN_ID',
  'Başlık',
  '09:30',
  current_date,
  false,
  'medium',
  '',
  '[]'::jsonb
);`;

/** Satır alanlarını güncelle (SQL Editor ile manuel düzenleme) */
export const TASKS_CONTEXT_UPDATE_FIELDS_SQL = `-- TasksContext uyumlu: başlık / saat / tarih / öncelik
update public.tasks
set title = 'Yeni başlık', time = '10:00', date_key = '2026-05-20'::date, priority = 'low'
where user_id = auth.uid() and id = 'ORNEK_METIN_ID';`;

/** toggleTaskDone — istemci yalnızca done kolonunu günceller */
export const TASKS_CONTEXT_UPDATE_DONE_SQL = `-- TasksContext: toggleTaskDone → update done
update public.tasks
set done = not coalesce(done, false)
where user_id = auth.uid()
  and id = 'ORNEK_METIN_ID';

-- veya sadece tamamlandı:
-- update public.tasks set done = true where user_id = auth.uid() and id = '...';`;

/** updateTaskDetails — TaskDetailScreen (istemci patch) */
export const TASKS_CONTEXT_UPDATE_DETAIL_SQL = `-- TasksContext: updateTaskDetails → notes + attachments (jsonb)
update public.tasks
set
  notes = 'Kısa not',
  attachments = '["dosya.pdf", "https://ornek.com/link"]'::jsonb
where user_id = auth.uid() and id = 'ORNEK_METIN_ID';`;

/** deleteTask */
export const TASKS_CONTEXT_DELETE_SQL = `-- TasksContext: deleteTask
delete from public.tasks
where user_id = auth.uid()
  and id = 'ORNEK_METIN_ID';`;

/** resetAllTaskData — kullanıcının tüm görevleri */
export const TASKS_CONTEXT_DELETE_ALL_SQL = `-- TasksContext: resetAllTaskData
delete from public.tasks
where user_id = auth.uid();`;

/** Tek dosyada kopyala-yapıştır */
export const TASKS_CONTEXT_ALL_SQL = `${TASKS_CONTEXT_SELECT_SQL}

${TASKS_CONTEXT_INSERT_SQL}

${TASKS_CONTEXT_UPDATE_FIELDS_SQL}

${TASKS_CONTEXT_UPDATE_DONE_SQL}

${TASKS_CONTEXT_UPDATE_DETAIL_SQL}

${TASKS_CONTEXT_DELETE_SQL}

${TASKS_CONTEXT_DELETE_ALL_SQL}`;
