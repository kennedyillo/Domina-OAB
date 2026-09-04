create or replace function public.admin_update_commercial_plan(
  p_id text,
  p_name text,
  p_price_cents integer,
  p_max_installments integer,
  p_active boolean,
  p_actor_email text default null
) returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_duration integer;
  v_billing text := 'one_time';
begin
  if p_id not in ('domina-monthly','domina-90','domina-annual') then
    raise exception 'plan_not_editable';
  end if;
  if trim(coalesce(p_name,''))='' or p_price_cents<0 or p_price_cents>10000000 or p_max_installments<1 or p_max_installments>12 then
    raise exception 'invalid_plan';
  end if;

  if p_id='domina-monthly' then
    v_duration:=30;
    p_max_installments:=1;
  elsif p_id='domina-90' then
    v_duration:=90;
    p_max_installments:=least(p_max_installments,3);
  else
    v_duration:=365;
    p_max_installments:=least(p_max_installments,12);
  end if;

  update public.plans
     set name=trim(p_name),
         billing_type=v_billing,
         duration_days=v_duration,
         price_cents=p_price_cents,
         max_installments=p_max_installments,
         active=coalesce(p_active,true),
         updated_at=now()
   where id=p_id;
  if not found then raise exception 'plan_not_found'; end if;

  return jsonb_build_object('ok',true,'id',p_id,'billing_type',v_billing,'duration_days',v_duration,'max_installments',p_max_installments);
end;
$$;

revoke all on function public.admin_update_commercial_plan(text,text,integer,integer,boolean,text) from public, anon, authenticated;
grant execute on function public.admin_update_commercial_plan(text,text,integer,integer,boolean,text) to service_role;

create or replace function public.admin_question_quality_metrics()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'mostWrong', coalesce((
      select jsonb_agg(to_jsonb(x))
      from (
        select
          q.id,
          q.code,
          left(q.statement, 180) as statement,
          count(sa.id)::int as answers,
          count(sa.id) filter (where sa.correct = false)::int as wrong_answers,
          case when count(sa.id) > 0
            then round((count(sa.id) filter (where sa.correct = false))::numeric * 100 / count(sa.id))::int
            else 0
          end as wrong_rate
        from public.questions q
        join public.simulation_answers sa on sa.question_id = q.id
        group by q.id, q.code, q.statement
        having count(sa.id) > 0
        order by wrong_rate desc, wrong_answers desc, answers desc, q.id
        limit 10
      ) x
    ), '[]'::jsonb),
    'mostReported', coalesce((
      select jsonb_agg(to_jsonb(x))
      from (
        select
          q.id,
          q.code,
          left(q.statement, 180) as statement,
          count(qr.id)::int as reports,
          count(qr.id) filter (where qr.status in ('open','reviewing'))::int as open_reports
        from public.questions q
        join public.question_reports qr on qr.question_id = q.id
        group by q.id, q.code, q.statement
        having count(qr.id) > 0
        order by reports desc, open_reports desc, q.id
        limit 10
      ) x
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.admin_question_quality_metrics() from public, anon, authenticated;
grant execute on function public.admin_question_quality_metrics() to service_role;
