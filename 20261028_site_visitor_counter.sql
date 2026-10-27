-- AMIR TECH ROG GLOBAL: anonymous visit counter, no IP/person data stored.
create table if not exists public.site_stats (
  id smallint primary key check (id = 1),
  total_visits bigint not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.site_stats(id,total_visits) values (1,0) on conflict (id) do nothing;
alter table public.site_stats enable row level security;
revoke all on public.site_stats from anon, authenticated;

create or replace function public.record_site_visit()
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare visit_total bigint;
begin
  update public.site_stats set total_visits = total_visits + 1, updated_at = now() where id = 1 returning total_visits into visit_total;
  return visit_total;
end;
$$;

create or replace function public.get_site_visits()
returns bigint
language sql
security definer
set search_path = public, pg_temp
as $$
  select total_visits from public.site_stats where id = 1;
$$;

revoke all on function public.record_site_visit() from public;
revoke all on function public.get_site_visits() from public;
grant execute on function public.record_site_visit() to anon, authenticated;
grant execute on function public.get_site_visits() to anon, authenticated;
