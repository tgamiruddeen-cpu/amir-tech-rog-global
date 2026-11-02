-- AMIR TECH ROG GLOBAL: preserve aggregate counts; no IP or visitor identity is stored.
begin;

alter table public.site_stats enable row level security;
alter table public.site_daily_stats enable row level security;
revoke all on table public.site_stats from public, anon, authenticated;
revoke all on table public.site_daily_stats from public, anon, authenticated;

create or replace function public.record_site_visit()
returns json
language plpgsql
security definer
set search_path = ''
as $function$
declare
  all_time bigint;
  today_count bigint;
  local_today date := pg_catalog.timezone('Asia/Kuala_Lumpur', pg_catalog.now())::date;
begin
  update public.site_stats
     set total_visits = total_visits + 1
   where id = 1
   returning total_visits into all_time;

  insert into public.site_daily_stats (visit_date, total_visits)
  values (local_today, 1)
  on conflict (visit_date) do update
    set total_visits = public.site_daily_stats.total_visits + 1
  returning total_visits into today_count;

  return pg_catalog.json_build_object('total', all_time, 'today', today_count);
end;
$function$;

create or replace function public.get_site_visit_stats()
returns json
language sql
security definer
set search_path = ''
as $function$
  select pg_catalog.json_build_object(
    'total', coalesce((select total_visits from public.site_stats where id = 1), 0),
    'today', coalesce((
      select total_visits
      from public.site_daily_stats
      where visit_date = pg_catalog.timezone('Asia/Kuala_Lumpur', pg_catalog.now())::date
    ), 0)
  );
$function$;

revoke all on function public.record_site_visit() from public, anon, authenticated;
revoke all on function public.get_site_visit_stats() from public, anon, authenticated;
grant execute on function public.record_site_visit() to anon, authenticated;
grant execute on function public.get_site_visit_stats() to anon, authenticated;

commit;
