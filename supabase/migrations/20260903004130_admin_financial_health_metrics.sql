create or replace function public.admin_financial_health_metrics()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  with payments_30d as (
    select
      coalesce(sum(gross_amount_cents) filter (where status = 'approved'), 0)::int as gross,
      coalesce(sum(net_amount_cents) filter (where status = 'approved'), 0)::int as net
    from public.payments
    where created_at >= now() - interval '30 days'
  ), cancellations_30d as (
    select count(*)::int as total
    from public.subscriptions
    where cancelled_at >= now() - interval '30 days'
       or (status = 'cancelled' and updated_at >= now() - interval '30 days')
  ), delinquency as (
    select
      count(*)::int as total,
      coalesce(sum(gross_amount_cents), 0)::int as amount
    from public.payments
    where status = 'pending'
      and created_at < now() - interval '72 hours'
  )
  select jsonb_build_object(
    'grossRevenue30d', (select gross from payments_30d),
    'netRevenue30d', (select net from payments_30d),
    'cancellations30d', (select total from cancellations_30d),
    'delinquentPayments', (select total from delinquency),
    'delinquentAmount', (select amount from delinquency),
    'delinquencyThresholdHours', 72
  );
$$;

revoke all on function public.admin_financial_health_metrics() from public, anon, authenticated;
grant execute on function public.admin_financial_health_metrics() to service_role;