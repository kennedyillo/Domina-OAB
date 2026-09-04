create or replace function public.admin_user_detail(p_user_id uuid)
returns jsonb language sql security definer set search_path=public as $$
with attempts as (
  select a.id,a.status,d.name discipline,sd.name simulation,a.total_questions,a.answered_questions,a.correct_answers,
    case when a.total_questions>0 then round(a.correct_answers::numeric/a.total_questions*100,1) else 0 end score,
    a.started_at,a.completed_at
  from public.simulation_attempts a
  join public.disciplines d on d.id=a.discipline_id
  left join public.simulation_definitions sd on sd.id=a.definition_id
  where a.user_id=p_user_id order by a.started_at desc limit 100
), evolution as (
  select d.name discipline,count(*)::int completed_attempts,
    round(avg(case when a.total_questions>0 then a.correct_answers::numeric/a.total_questions*100 end),1) average_score,
    round((array_agg(case when a.total_questions>0 then a.correct_answers::numeric/a.total_questions*100 end order by a.started_at desc))[1],1) latest_score,
    round((array_agg(case when a.total_questions>0 then a.correct_answers::numeric/a.total_questions*100 end order by a.started_at asc))[1],1) first_score
  from public.simulation_attempts a join public.disciplines d on d.id=a.discipline_id
  where a.user_id=p_user_id and a.status='completed' and a.total_questions>0
  group by d.id,d.name
), access_history as (
  select e.id,e.plan_id,p.name plan_name,e.source_type,e.status,e.starts_at,e.ends_at,e.created_at
  from public.entitlements e left join public.plans p on p.id=e.plan_id
  where e.user_id=p_user_id order by e.created_at desc limit 50
)
select jsonb_build_object(
 'attempts',coalesce((select jsonb_agg(to_jsonb(a)) from attempts a),'[]'::jsonb),
 'evolution',coalesce((select jsonb_agg(to_jsonb(x)) from (select discipline,completed_attempts,average_score,first_score,latest_score,round(latest_score-first_score,1) evolution_points from evolution order by discipline) x),'[]'::jsonb),
 'accessHistory',coalesce((select jsonb_agg(to_jsonb(e)) from access_history e),'[]'::jsonb)
);
$$;

create or replace function public.admin_grant_access(p_user_id uuid,p_plan_id text,p_actor_email text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_plan public.plans%rowtype; v_email text; v_id bigint; v_end timestamptz;
begin
 select * into v_plan from public.plans where id=p_plan_id and active=true; if not found then raise exception 'plan_not_found'; end if;
 select email into v_email from public.user_profiles where user_id=p_user_id; if v_email is null then raise exception 'user_not_found'; end if;
 if v_plan.duration_days is null or v_plan.duration_days<1 then raise exception 'plan_duration_missing'; end if;
 update public.entitlements set status='cancelled',updated_at=now() where user_id=p_user_id and status='active';
 v_end:=now()+make_interval(days=>v_plan.duration_days);
 insert into public.entitlements(user_id,email,plan_id,source_type,source_id,status,starts_at,ends_at)
 values(p_user_id,v_email,v_plan.id,'admin',lower(nullif(trim(coalesce(p_actor_email,'')),'')),'active',now(),v_end) returning id into v_id;
 update public.user_profiles set account_status='active',updated_at=now() where user_id=p_user_id;
 return jsonb_build_object('ok',true,'entitlement_id',v_id,'ends_at',v_end,'plan_id',v_plan.id);
end; $$;

create or replace function public.admin_commercial_plans()
returns jsonb language sql security definer set search_path=public as $$
 select coalesce(jsonb_agg(to_jsonb(x) order by x.duration_days),'[]'::jsonb) from (
  select id,slug,name,billing_type,duration_days,price_cents,max_installments,active,updated_at
  from public.plans where id in ('domina-monthly','domina-90','domina-annual')
 ) x;
$$;

create or replace function public.admin_update_commercial_plan(p_id text,p_name text,p_price_cents integer,p_max_installments integer,p_active boolean,p_actor_email text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_duration int; v_billing text;
begin
 if p_id not in ('domina-monthly','domina-90','domina-annual') then raise exception 'plan_not_editable'; end if;
 if trim(coalesce(p_name,''))='' or p_price_cents<0 or p_price_cents>10000000 or p_max_installments<1 or p_max_installments>12 then raise exception 'invalid_plan'; end if;
 if p_id='domina-monthly' then v_duration:=30;v_billing:='recurring';p_max_installments:=1;
 elsif p_id='domina-90' then v_duration:=90;v_billing:='one_time';
 else v_duration:=365;v_billing:='one_time'; end if;
 update public.plans set name=trim(p_name),billing_type=v_billing,duration_days=v_duration,price_cents=p_price_cents,max_installments=p_max_installments,active=coalesce(p_active,true),updated_at=now() where id=p_id;
 if not found then raise exception 'plan_not_found'; end if;
 return jsonb_build_object('ok',true,'id',p_id);
end; $$;

revoke all on function public.admin_user_detail(uuid) from public,anon,authenticated;
revoke all on function public.admin_grant_access(uuid,text,text) from public,anon,authenticated;
revoke all on function public.admin_commercial_plans() from public,anon,authenticated;
revoke all on function public.admin_update_commercial_plan(text,text,integer,integer,boolean,text) from public,anon,authenticated;
grant execute on function public.admin_user_detail(uuid) to service_role;
grant execute on function public.admin_grant_access(uuid,text,text) to service_role;
grant execute on function public.admin_commercial_plans() to service_role;
grant execute on function public.admin_update_commercial_plan(text,text,integer,integer,boolean,text) to service_role;