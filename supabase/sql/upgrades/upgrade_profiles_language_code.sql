-- Existing databases: persist the selected app language on each profile.
-- Safe to rerun; invalid legacy values are normalized before the constraint.

alter table public.profiles
  add column if not exists language_code text;

update public.profiles
set language_code = 'tr'
where language_code is null
   or language_code not in ('tr', 'en', 'es', 'de', 'fr', 'ar', 'pt', 'ru', 'zh', 'ja', 'ko', 'hi', 'it');

alter table public.profiles
  alter column language_code set default 'tr',
  alter column language_code set not null;

alter table public.profiles
  drop constraint if exists profiles_language_code_check;

alter table public.profiles
  add constraint profiles_language_code_check
  check (language_code in ('tr', 'en', 'es', 'de', 'fr', 'ar', 'pt', 'ru', 'zh', 'ja', 'ko', 'hi', 'it'));

comment on column public.profiles.language_code is
  'Selected application language: tr, en, es, de, fr, ar, pt, ru, zh, ja, ko, hi, or it.';
