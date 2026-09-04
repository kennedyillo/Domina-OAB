create or replace function public.admin_save_simulation_definition_v3(
  p_id bigint,
  p_slug text,
  p_name text,
  p_description text,
  p_discipline_slug text,
  p_topic_ids bigint[],
  p_question_count integer,
  p_time_limit_minutes integer,
  p_randomize_questions boolean,
  p_randomize_options boolean,
  p_use_incidence_weights boolean,
  p_status text,
  p_actor_email text
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_result jsonb;
  v_id bigint;
begin
  v_result := public.admin_save_simulation_definition(
    p_id,
    p_slug,
    p_name,
    p_description,
    p_discipline_slug,
    p_topic_ids,
    p_question_count,
    p_time_limit_minutes,
    p_randomize_questions,
    p_randomize_options,
    p_status,
    p_actor_email
  );

  v_id := (v_result->>'id')::bigint;
  update public.simulation_definitions
  set use_incidence_weights = coalesce(p_use_incidence_weights, true),
      updated_at = now(),
      updated_by_email = lower(trim(p_actor_email))
  where id = v_id;

  return v_result || jsonb_build_object(
    'use_incidence_weights',
    coalesce(p_use_incidence_weights, true)
  );
end;
$$;

revoke all on function public.admin_save_simulation_definition_v3(
  bigint,text,text,text,text,bigint[],integer,integer,boolean,boolean,boolean,text,text
) from public, anon, authenticated;

grant execute on function public.admin_save_simulation_definition_v3(
  bigint,text,text,text,text,bigint[],integer,integer,boolean,boolean,boolean,text,text
) to service_role;
