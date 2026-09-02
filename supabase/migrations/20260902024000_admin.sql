create or replace function public.admin_dashboard()
returns jsonb
language sql
security definer
set search_path = public
as $$
with
  founders as (select count(*)::int total from public.pilot_leads where status='founder'),
  leads as (select count(*)::int total from public.pilot_leads),
  pv as (select count(*)::int total from public.analytics_events where event_type='page_view' and created_at >= now()-interval '30 days'),
  sess as (select count(distinct session_id)::int total from public.analytics_events where created_at >= now()-interval '30 days'),
  starts as (select count(*)::int total from public.analytics_events where event_type='simulado_started' and created_at >= now()-interval '30 days'),
  completions as (select count(*)::int total from public.analytics_events where event_type='simulado_completed' and created_at >= now()-interval '30 days'),
  financial as (
    select
      coalesce(sum(gross_amount_cents) filter (where status='approved' and created_at >= now()-interval '30 days'),0)::int gross,
      coalesce(sum(fee_amount_cents) filter (where status='approved' and created_at >= now()-interval '30 days'),0)::int fees,
      coalesce(sum(net_amount_cents) filter (where status='approved' and created_at >= now()-interval '30 days'),0)::int net,
      count(*) filter (where status='approved' and created_at >= now()-interval '30 days')::int approved,
      coalesce(sum(gross_amount_cents) filter (where status='pending'),0)::int pending
    from public.payments
  )
select jsonb_build_object(
  'founders',(select total from founders),
  'leads',(select total from leads),
  'pageViews',(select total from pv),
  'sessions',(select total from sess),
  'started',(select total from starts),
  'completed',(select total from completions),
  'completionRate',case when (select total from starts)>0 then round(((select total from completions)::numeric/(select total from starts))*100)::int else 0 end,
  'recent',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select id,email,status,created_at from public.pilot_leads order by created_at desc,id desc limit 12
  ) x),'[]'::jsonb),
  'sources',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select case when utm_source='' then 'Direto / sem UTM' else utm_source end source,count(*)::int total
    from public.analytics_events where event_type='page_view' and created_at >= now()-interval '30 days'
    group by 1 order by total desc limit 5
  ) x),'[]'::jsonb),
  'pages',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select path,count(*)::int total from public.analytics_events
    where event_type='page_view' and created_at >= now()-interval '30 days'
    group by path order by total desc limit 5
  ) x),'[]'::jsonb),
  'financial',jsonb_build_object(
    'gross',(select gross from financial),
    'fees',(select fees from financial),
    'net',(select net from financial),
    'approved',(select approved from financial),
    'pending',(select pending from financial),
    'activeSubscriptions',(select count(*)::int from public.subscriptions where status in ('authorized','active'))
  ),
  'recentPayments',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select p.id,p.email,pl.name plan_name,p.status,p.payment_method,p.installments,p.gross_amount_cents,p.created_at
    from public.payments p join public.plans pl on pl.id=p.plan_id
    order by p.created_at desc,p.id desc limit 8
  ) x),'[]'::jsonb),
  'plans',coalesce((select jsonb_agg(to_jsonb(x)) from (
    select id,name,billing_type,duration_days,price_cents,max_installments,active
    from public.plans order by price_cents asc
  ) x),'[]'::jsonb)
);
$$;

revoke all on function public.admin_dashboard() from public, anon, authenticated;
grant execute on function public.admin_dashboard() to service_role;
