-- Mevcut projede `public.tasks` zaten oluşturulduysa bir kez çalıştırın (SQL Editor).
-- Yeni kurulumlar için bu kolonlar doğrudan schema.sql içindedir.

alter table public.tasks
  add column if not exists notes text not null default '',
  add column if not exists attachments jsonb not null default '[]'::jsonb;

comment on column public.tasks.notes is 'Görev notları (isteğe bağlı); TaskDetail ile uyumlu.';
comment on column public.tasks.attachments is 'Ek dosya adları veya URI listesi (json dizi); TaskDetail ile uyumlu.';

-- -----------------------------------------------------------------------------
-- Table Editor’da göremiyorsanız: önce bu sorguyu SQL Editor’de çalıştırıp kolonların
-- gerçekten eklendiğini doğrulayın; ardından sayfayı yenileyin (F5) veya
-- sol menüde başka tabloya tıklayıp tekrar `tasks` seçin. Şema: public.
-- -----------------------------------------------------------------------------
-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'tasks'
-- order by ordinal_position;
