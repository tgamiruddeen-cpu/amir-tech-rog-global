-- AMIR TECH ROG GLOBAL: agregat lawatan sahaja; tiada IP atau identiti disimpan.
create table if not exists public.site_visit_stats (
  id smallint primary key check (id = 1),
  total_visits bigint not null default 0,
  today_visits bigint not null default 0,
  visit_date date not null default (timezone('Asia/Kuala_Lumpur', now())::date),
  updated_at timestamptz not null default now()
);
insert into public.site_visit_stats(id) values (1) on conflict (id) do nothing;
alter table public.site_visit_stats enable row level security;
revoke all on public.site_visit_stats from anon, authenticated;

create or replace function public.record_site_visit()
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare result jsonb;
begin
  update public.site_visit_stats
  set total_visits = total_visits + 1,
      today_visits = case when visit_date = timezone('Asia/Kuala_Lumpur', now())::date then today_visits + 1 else 1 end,
      visit_date = timezone('Asia/Kuala_Lumpur', now())::date,
      updated_at = now()
  where id = 1;
  select jsonb_build_object('total', total_visits, 'today', today_visits)
    into result from public.site_visit_stats where id = 1;
  return result;
end;
$$;

create or replace function public.get_site_visit_stats()
returns jsonb language sql security definer set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'total', total_visits,
    'today', case when visit_date = timezone('Asia/Kuala_Lumpur', now())::date then today_visits else 0 end
  ) from public.site_visit_stats where id = 1;
$$;
revoke all on function public.record_site_visit() from public;
revoke all on function public.get_site_visit_stats() from public;
grant execute on function public.record_site_visit() to anon, authenticated;
grant execute on function public.get_site_visit_stats() to anon, authenticated;
