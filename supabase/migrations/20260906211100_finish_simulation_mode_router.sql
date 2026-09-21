create or replace function public.finish_simulation_v3(
  p_user_id uuid,
  p_attempt_id bigint
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_mode text;
begin
  select mode into v_mode
  from public.simulation_attempts
  where id=p_attempt_id and user_id=p_user_id;

  if v_mode is null then raise exception 'attempt_not_found'; end if;
  if v_mode='exam' then
    return public.finish_exam_simulation(p_user_id,p_attempt_id);
  end if;
  return public.finish_simulation_v2(p_user_id,p_attempt_id);
end;
$$;

revoke all on function public.finish_simulation_v3(uuid,bigint) from public,anon,authenticated;
grant execute on function public.finish_simulation_v3(uuid,bigint) to service_role;
