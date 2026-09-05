create or replace function public.admin_manage_user_v2(
  p_user_id uuid,
  p_action text,
  p_days integer,
  p_actor_user_id uuid,
  p_actor_role text,
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_before jsonb;
  v_after jsonb;
  v_changed text[];
begin
  if p_user_id is null then raise exception 'user_required'; end if;
  if p_action not in ('block','unblock','cancel_account','cancel_access','extend_access') then raise exception 'invalid_action'; end if;
  if p_actor_user_id is null or p_actor_role not in ('owner','administrator') then raise exception 'actor_not_authorized'; end if;
  if not exists(
    select 1 from public.admin_members
    where user_id=p_actor_user_id and active=true and role=p_actor_role
  ) then raise exception 'actor_not_authorized'; end if;
  if not exists(select 1 from public.user_profiles where user_id=p_user_id) then raise exception 'user_not_found'; end if;

  select jsonb_build_object(
    'account_status',(select account_status from public.user_profiles where user_id=p_user_id),
    'entitlements',coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',e.id,'plan_id',e.plan_id,'status',e.status,
        'starts_at',e.starts_at,'ends_at',e.ends_at
      ) order by e.id)
      from public.entitlements e where e.user_id=p_user_id
    ),'[]'::jsonb),
    'founder',(select jsonb_build_object(
      'id',l.id,'activation_status',l.activation_status,'activated_at',l.activated_at,
      'expires_at',l.expires_at,'cancelled_at',l.cancelled_at
    ) from public.pilot_leads l where l.user_id=p_user_id order by l.id desc limit 1)
  ) into v_before;

  if p_action='block' then
    update public.user_profiles set account_status='blocked',updated_at=now() where user_id=p_user_id;
    v_changed:=array['account_status'];
  elsif p_action='unblock' then
    update public.user_profiles set account_status='active',updated_at=now() where user_id=p_user_id;
    v_changed:=array['account_status'];
  elsif p_action='cancel_account' then
    update public.user_profiles set account_status='cancelled',updated_at=now() where user_id=p_user_id;
    v_changed:=array['account_status'];
  elsif p_action='cancel_access' then
    update public.entitlements set status='cancelled',updated_at=now()
    where user_id=p_user_id and status='active';
    update public.pilot_leads set activation_status='cancelled',cancelled_at=now()
    where user_id=p_user_id and activation_status='active';
    v_changed:=array['entitlements','founder'];
  elsif p_action='extend_access' then
    if p_days is null or p_days<1 or p_days>730 then raise exception 'invalid_days'; end if;
    perform public.admin_extend_access(p_user_id,p_days);
    v_changed:=array['entitlements','founder'];
  end if;

  select jsonb_build_object(
    'account_status',(select account_status from public.user_profiles where user_id=p_user_id),
    'entitlements',coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',e.id,'plan_id',e.plan_id,'status',e.status,
        'starts_at',e.starts_at,'ends_at',e.ends_at
      ) order by e.id)
      from public.entitlements e where e.user_id=p_user_id
    ),'[]'::jsonb),
    'founder',(select jsonb_build_object(
      'id',l.id,'activation_status',l.activation_status,'activated_at',l.activated_at,
      'expires_at',l.expires_at,'cancelled_at',l.cancelled_at
    ) from public.pilot_leads l where l.user_id=p_user_id order by l.id desc limit 1)
  ) into v_after;

  insert into public.admin_audit_log(
    actor_user_id,actor_role,action,resource_type,resource_id,
    before_data,after_data,changed_fields,request_id
  ) values(
    p_actor_user_id,p_actor_role,'user.'||p_action,'user',p_user_id::text,
    v_before,v_after,v_changed,nullif(trim(coalesce(p_request_id,'')),'')
  );

  return jsonb_build_object('ok',true,'before',v_before,'after',v_after);
end;
$$;

revoke all on function public.admin_manage_user_v2(uuid,text,integer,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_manage_user_v2(uuid,text,integer,uuid,text,text) to service_role;
