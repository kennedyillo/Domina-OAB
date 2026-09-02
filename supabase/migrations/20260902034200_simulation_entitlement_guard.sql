-- Domina OAB - somente usuários com entitlement ativo salvam histórico

create or replace function public.start_simulation(p_user_id uuid,p_discipline_slug text,p_total_questions integer)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare v_discipline bigint; v_id bigint;
begin
  if p_user_id is null then raise exception 'invalid_user'; end if;
  if not exists(select 1 from public.user_profiles where user_id=p_user_id and account_status='active') then raise exception 'inactive_user'; end if;
  if not exists(select 1 from public.entitlements where user_id=p_user_id and status='active' and starts_at<=now() and ends_at>now()) then raise exception 'no_active_access'; end if;
  select id into v_discipline from public.disciplines where slug=p_discipline_slug and active=true;
  if v_discipline is null then raise exception 'discipline_not_found'; end if;
  update public.simulation_attempts set status='abandoned',updated_at=now() where user_id=p_user_id and discipline_id=v_discipline and status='started';
  insert into public.simulation_attempts(user_id,discipline_id,total_questions) values(p_user_id,v_discipline,greatest(0,p_total_questions)) returning id into v_id;
  return jsonb_build_object('attempt_id',v_id,'saved',true);
end;
$$;

revoke all on function public.start_simulation(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.start_simulation(uuid,text,integer) to service_role;
