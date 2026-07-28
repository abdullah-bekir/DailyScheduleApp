-- Canlı Supabase SQL Editor'de bir kez çalıştırın.
-- İstemcinin gönderdiği updated_at değerini korur (görev LWW senkronu).
-- profiles + tasks aynı fonksiyonu kullanır; davranış her ikisi için güvenlidir.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.updated_at is null then
    new.updated_at = now();
  elsif tg_op = 'UPDATE' and new.updated_at is not distinct from old.updated_at then
    new.updated_at = now();
  end if;
  return new;
end;
$$;
