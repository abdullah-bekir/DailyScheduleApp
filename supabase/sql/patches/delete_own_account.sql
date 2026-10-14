-- Kullanıcının kendi hesabını silmesi (Ayarlar → Hesabı ve bulut verisini sil).
-- İstemci tarafında auth.deleteUser() yoktur; yalnızca service-role ile auth.admin.deleteUser vardır.
-- Bu fonksiyon oturum açmış kullanıcının KENDİ satırını siler. tasks/profiles satırları
-- "on delete cascade" ile birlikte silinir. Supabase SQL Editor'de bir kez çalıştırın.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
