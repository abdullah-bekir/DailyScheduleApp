-- =============================================================================
-- Görevler ekranı (TaskListScreen) — public.tasks
-- Table Editor’da listelenmesi için bu dosyayı SQL Editor’de TAM çalıştırın (Ctrl+A, Run)
-- =============================================================================
-- Supabase Table Editor, PostgreSQL’in kendi kataloğunu okur: yani “ayrı bir tablo
-- listesi” oluşturulmaz. Bu script ne yapar? → public.tasks tablosunu veritabanında
-- yaratır / günceller. Oluşan tablo otomatik olarak aynı projede
--   Database (veya Table Editor) → şema: public  → sol listede “tasks”
-- satırı olarak görünür. Listeye manuel ekleme gerekmez.
-- Görünmüyorsa: sayfayı yenile (F5), şemayı public seç, arama kutusunu temizle.
-- =============================================================================

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

comment on table public.tasks is 'Görevler ekranı + ana sayfa bugün özeti (public.tasks).';

-- API rollerinin tabloya erişimi (Table Editor listesinden bağımsız; mobil istemci için)
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.tasks to service_role;

comment on column public.tasks.user_id is 'auth.users.id';
comment on column public.tasks.id is 'İstemci üretimi metin id';
comment on column public.tasks.title is 'Başlık';
comment on column public.tasks.time is 'Saat metni';
comment on column public.tasks.date_key is 'YYYY-MM-DD';
comment on column public.tasks.done is 'Tamamlandı';
comment on column public.tasks.priority is 'high | medium | low';

-- Sonuç: tasks PostgreSQL’de var mı? (true ise Table Editor sol menüde tasks beklenir)
select
  exists(
    select 1
    from information_schema.tables t
    where t.table_schema = 'public' and t.table_name = 'tasks'
  ) as table_editorda_gorunmesi_icin_tablo_olustu;
