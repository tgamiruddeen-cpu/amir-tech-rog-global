-- AMIR TECH ROG GLOBAL visitor counter for Supabase
-- Does not store IP addresses or personal visitor identifiers.
create table if not exists public.site_stats (
  id smallint primary key check (id = 1),
  total_visits bigint not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.site_stats(id,total_visits) values (1,0) on conflict (id) do nothing;
create table if not exists public.site_daily_stats (
  visit_date date primary key,
  total_visits bigint not null default 0
);
alter table public.site_stats enable row level security;
alter table public.site_daily_stats enable row level security;
revoke all on public.site_stats from anon, authenticated;
revoke all on public.site_daily_stats from anon, authenticated;

create or replace function public.record_site_visit()
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare all_time bigint; today_count bigint;
begin
  update public.site_stats set total_visits=total_visits+1, updated_at=now()
    where id=1 returning total_visits into all_time;
  insert into public.site_daily_stats(visit_date,total_visits)
    values ((now() at time zone 'Asia/Kuala_Lumpur')::date,1)
    on conflict (visit_date) do update
      set total_visits=public.site_daily_stats.total_visits+1
    returning total_visits into today_count;
  return json_build_object('total',all_time,'today',today_count);
end; $$;

create or replace function public.get_site_visits()
returns json language sql security definer set search_path = public, pg_temp as $$
select json_build_object(
 'total',coalesce((select total_visits from public.site_stats where id=1),0),
 'today',coalesce((select total_visits from public.site_daily_stats
   where visit_date=(now() at time zone 'Asia/Kuala_Lumpur')::date),0)
); $$;

revoke all on function public.record_site_visit() from public;
revoke all on function public.get_site_visits() from public;
grant execute on function public.record_site_visit() to anon, authenticated;
grant execute on function public.get_site_visits() to anon, authenticated;
