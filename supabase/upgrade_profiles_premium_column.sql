-- Mevcut veritabanında profiles tablosu zaten varken bir kerelik çalıştırın.
-- (Yeni kurulumda schema.sql içinde premium_enrolled zaten tanımlıdır.)

alter table public.profiles
  add column if not exists premium_enrolled boolean not null default false;

comment on column public.profiles.premium_enrolled is 'Ayarlar Premium kartı için yer tutucu; uygulama sürümüne göre kullanılır.';
