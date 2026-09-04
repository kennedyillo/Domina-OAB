create or replace function public.admin_financial_reporting(p_days integer default 30)
returns jsonb
language sql
security definer
set search_path = ''
as $$
with bounds as (
  select greatest(1, least(coalesce(p_days,30), 365))::int as days,
         now() - make_interval(days => greatest(1, least(coalesce(p_days,30),365))) as since
), pay as (
  select p.* from public.payments p, bounds b where p.created_at >= b.since
), status_totals as (
  select coalesce(jsonb_object_agg(status, jsonb_build_object('count',cnt,'amount',amount)), '{}'::jsonb) v
  from (
    select status, count(*)::int cnt, coalesce(sum(gross_amount_cents),0)::bigint amount
    from pay group by status
  ) s
), by_plan as (
  select coalesce(jsonb_agg(jsonb_build_object('planId',x.plan_id,'planName',coalesce(pl.name,x.plan_id),'gross',x.gross,'net',x.net,'payments',x.payments) order by x.gross desc), '[]'::jsonb) v
  from (
    select plan_id, coalesce(sum(gross_amount_cents),0)::bigint gross, coalesce(sum(net_amount_cents),0)::bigint net, count(*)::int payments
    from pay where status in ('approved','authorized','paid') group by plan_id
  ) x left join public.plans pl on pl.id=x.plan_id
), approved as (
  select * from pay where status in ('approved','authorized','paid')
), recurring as (
  select coalesce(sum(pl.price_cents),0)::bigint mrr
  from public.subscriptions s join public.plans pl on pl.id=s.plan_id
  where s.status in ('active','authorized') and pl.billing_type='recurring'
), churn as (
  select
    (select count(*) from public.subscriptions s, bounds b where s.cancelled_at >= b.since)::int cancelled,
    (select count(*) from public.subscriptions s, bounds b where s.created_at < b.since and (s.cancelled_at is null or s.cancelled_at >= b.since))::int opening
), receivables as (
  select coalesce(jsonb_agg(jsonb_build_object('date',d::date,'amount',amount,'count',cnt) order by d), '[]'::jsonb) v
  from (
    select date_trunc('day',available_at) d, coalesce(sum(net_amount_cents),0)::bigint amount, count(*)::int cnt
    from public.payments
    where available_at is not null and available_at >= now() and status in ('approved','authorized','paid')
    group by 1 order by 1 limit 60
  ) r
)
select jsonb_build_object(
  'days',(select days from bounds),
  'statuses',(select v from status_totals),
  'revenueByPlan',(select v from by_plan),
  'mrr',(select mrr from recurring),
  'averageTicket',coalesce((select round(avg(gross_amount_cents))::bigint from approved),0),
  'churnRate',coalesce((select case when opening=0 then 0 else round(cancelled::numeric/opening*100,1) end from churn),0),
  'delinquentCount',(select count(*)::int from pay where status='pending' and created_at < now()-interval '72 hours'),
  'delinquentAmount',coalesce((select sum(gross_amount_cents)::bigint from pay where status='pending' and created_at < now()-interval '72 hours'),0),
  'receivables',(select v from receivables)
);
$$;
revoke all on function public.admin_financial_reporting(integer) from public, anon, authenticated;
grant execute on function public.admin_financial_reporting(integer) to service_role;