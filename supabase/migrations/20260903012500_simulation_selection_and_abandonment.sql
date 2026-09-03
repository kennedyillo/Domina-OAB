alter table public.simulation_definitions add column if not exists question_ids bigint[] not null default '{}';

create or replace function public.admin_save_simulation_definition_v2(
 p_id bigint,p_slug text,p_name text,p_description text,p_discipline_slug text,p_topic_ids bigint[],p_question_ids bigint[],p_question_count integer,p_time_limit_minutes integer,p_randomize_questions boolean,p_randomize_options boolean,p_status text,p_actor_email text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id bigint; v_discipline_id bigint; v_available integer;
begin
 if trim(coalesce(p_slug,''))='' or trim(coalesce(p_name,''))='' then raise exception 'required_fields_missing'; end if;
 if p_question_count<1 or p_question_count>200 then raise exception 'invalid_question_count'; end if;
 if p_time_limit_minutes is not null and (p_time_limit_minutes<1 or p_time_limit_minutes>600) then raise exception 'invalid_time_limit'; end if;
 if p_status not in ('draft','published','paused','archived') then raise exception 'invalid_status'; end if;
 if nullif(trim(coalesce(p_discipline_slug,'')),'') is not null then select id into v_discipline_id from public.disciplines where slug=trim(p_discipline_slug) and active=true; if v_discipline_id is null then raise exception 'discipline_not_found'; end if; end if;
 if p_status='published' then
  select count(*)::int into v_available from public.questions q where q.status='published'
   and (coalesce(cardinality(p_question_ids),0)=0 or q.id=any(p_question_ids))
   and (coalesce(cardinality(p_question_ids),0)>0 or v_discipline_id is null or q.discipline_id=v_discipline_id)
   and (coalesce(cardinality(p_question_ids),0)>0 or coalesce(cardinality(p_topic_ids),0)=0 or q.topic_id=any(p_topic_ids));
  if v_available<p_question_count then raise exception 'insufficient_published_questions:%/%',v_available,p_question_count; end if;
 end if;
 if p_id is null then
  insert into public.simulation_definitions(slug,name,description,discipline_id,topic_ids,question_ids,question_count,time_limit_minutes,randomize_questions,randomize_options,status,created_by_email,updated_by_email)
  values(lower(trim(p_slug)),trim(p_name),nullif(trim(coalesce(p_description,'')),''),v_discipline_id,coalesce(p_topic_ids,'{}'),coalesce(p_question_ids,'{}'),p_question_count,p_time_limit_minutes,coalesce(p_randomize_questions,true),coalesce(p_randomize_options,false),p_status,lower(trim(p_actor_email)),lower(trim(p_actor_email))) returning id into v_id;
 else
  update public.simulation_definitions set slug=lower(trim(p_slug)),name=trim(p_name),description=nullif(trim(coalesce(p_description,'')),''),discipline_id=v_discipline_id,topic_ids=coalesce(p_topic_ids,'{}'),question_ids=coalesce(p_question_ids,'{}'),question_count=p_question_count,time_limit_minutes=p_time_limit_minutes,randomize_questions=coalesce(p_randomize_questions,true),randomize_options=coalesce(p_randomize_options,false),status=p_status,updated_by_email=lower(trim(p_actor_email)),updated_at=now() where id=p_id returning id into v_id;
  if v_id is null then raise exception 'simulation_definition_not_found'; end if;
 end if;
 return jsonb_build_object('ok',true,'id',v_id);
end; $$;

create or replace function public.admin_simulation_definitions()
returns jsonb language sql security definer set search_path=public as $$
 select coalesce(jsonb_agg(to_jsonb(x) order by x.position,x.id),'[]'::jsonb) from (
  select s.id,s.slug,s.name,s.description,s.discipline_id,d.slug discipline_slug,d.name discipline,s.topic_ids,s.question_ids,s.question_count,s.time_limit_minutes,s.randomize_questions,s.randomize_options,s.status,s.position,s.created_by_email,s.updated_by_email,s.created_at,s.updated_at,
   (select count(*)::int from public.questions q where q.status='published' and (cardinality(s.question_ids)=0 or q.id=any(s.question_ids)) and (cardinality(s.question_ids)>0 or s.discipline_id is null or q.discipline_id=s.discipline_id) and (cardinality(s.question_ids)>0 or cardinality(s.topic_ids)=0 or q.topic_id=any(s.topic_ids))) available_questions
  from public.simulation_definitions s left join public.disciplines d on d.id=s.discipline_id
 ) x;
$$;

create or replace function public.prepare_simulation(p_user_id uuid,p_slug text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.simulation_definitions%rowtype; v_attempt_id bigint; v_saved boolean:=false; v_questions jsonb:='[]'::jsonb; r record; v_position integer:=0; v_order integer[]; v_options jsonb;
begin
 select * into s from public.simulation_definitions where slug=trim(p_slug) and status='published' limit 1; if not found then raise exception 'simulation_not_available'; end if;
 if p_user_id is not null and exists(select 1 from public.user_profiles where user_id=p_user_id and account_status='active') and exists(select 1 from public.entitlements where user_id=p_user_id and status='active' and ends_at>now()) then
  v_saved:=true;
  update public.simulation_attempts set status='abandoned',updated_at=now() where user_id=p_user_id and definition_id=s.id and status='started';
  insert into public.simulation_attempts(user_id,discipline_id,definition_id,status,total_questions,time_limit_minutes,expires_at) values(p_user_id,s.discipline_id,s.id,'started',s.question_count,s.time_limit_minutes,case when s.time_limit_minutes is null then null else now()+make_interval(mins=>s.time_limit_minutes) end) returning id into v_attempt_id;
 end if;
 for r in
  select q.id,q.code,d.slug discipline_slug,d.name discipline,t.name topic,q.statement,q.options,q.difficulty,q.position
  from public.questions q join public.disciplines d on d.id=q.discipline_id left join public.question_topics t on t.id=q.topic_id
  where q.status='published'
   and (cardinality(s.question_ids)=0 or q.id=any(s.question_ids))
   and (cardinality(s.question_ids)>0 or s.discipline_id is null or q.discipline_id=s.discipline_id)
   and (cardinality(s.question_ids)>0 or cardinality(s.topic_ids)=0 or q.topic_id=any(s.topic_ids))
  order by case when s.randomize_questions then random() else 0 end,q.position,q.id limit s.question_count
 loop
  v_position:=v_position+1;
  if s.randomize_options then select array_agg(x order by random()) into v_order from unnest(array[0,1,2,3]) x; else v_order:=array[0,1,2,3]; end if;
  v_options:=jsonb_build_array((r.options->v_order[1]),(r.options->v_order[2]),(r.options->v_order[3]),(r.options->v_order[4]));
  if v_saved then insert into public.simulation_attempt_questions(attempt_id,question_id,position,option_order) values(v_attempt_id,r.id,v_position,v_order); end if;
  v_questions:=v_questions||jsonb_build_array(jsonb_build_object('id',r.id,'code',r.code,'discipline_slug',r.discipline_slug,'discipline',r.discipline,'topic',r.topic,'statement',r.statement,'options',v_options,'difficulty',r.difficulty,'position',v_position,'option_order',to_jsonb(v_order)));
 end loop;
 if jsonb_array_length(v_questions)<s.question_count then if v_attempt_id is not null then delete from public.simulation_attempts where id=v_attempt_id; end if; raise exception 'insufficient_published_questions'; end if;
 return jsonb_build_object('definition',jsonb_build_object('id',s.id,'slug',s.slug,'name',s.name,'description',s.description,'question_count',s.question_count,'time_limit_minutes',s.time_limit_minutes,'randomize_questions',s.randomize_questions,'randomize_options',s.randomize_options),'saved',v_saved,'attempt_id',v_attempt_id,'questions',v_questions);
end; $$;

create or replace function public.admin_simulations()
returns jsonb language sql security definer set search_path=public as $$
 select jsonb_build_object(
  'total30',(select count(*)::int from public.simulation_attempts where started_at>=now()-interval '30 days'),
  'completed30',(select count(*)::int from public.simulation_attempts where status='completed' and started_at>=now()-interval '30 days'),
  'abandoned30',(select count(*)::int from public.simulation_attempts where status='abandoned' and started_at>=now()-interval '30 days'),
  'abandonmentRate',coalesce((select round(count(*) filter(where status='abandoned')::numeric/nullif(count(*),0)*100)::int from public.simulation_attempts where started_at>=now()-interval '30 days'),0),
  'averageScore',coalesce((select round(avg(correct_answers::numeric/nullif(total_questions,0)*100))::int from public.simulation_attempts where status='completed' and total_questions>0 and started_at>=now()-interval '30 days'),0),
  'abandonmentPoints',coalesce((select jsonb_agg(to_jsonb(x) order by x.total desc,x.answered_questions) from (select answered_questions,count(*)::int total from public.simulation_attempts where status='abandoned' and started_at>=now()-interval '30 days' group by answered_questions order by total desc,answered_questions limit 20) x),'[]'::jsonb),
  'recent',coalesce((select jsonb_agg(to_jsonb(x)) from (select a.id,p.full_name,p.email,d.name discipline,a.status,a.total_questions,a.answered_questions,a.correct_answers,a.started_at,a.completed_at from public.simulation_attempts a join public.user_profiles p on p.user_id=a.user_id join public.disciplines d on d.id=a.discipline_id order by a.started_at desc limit 100) x),'[]'::jsonb),
  'hardestQuestions',coalesce((select jsonb_agg(to_jsonb(x)) from (select q.id,q.code,q.statement,t.name topic,count(sa.id)::int answers,count(sa.id) filter(where sa.correct=false)::int errors,round((count(sa.id) filter(where sa.correct=false)::numeric/nullif(count(sa.id),0))*100)::int error_rate from public.simulation_answers sa join public.questions q on q.id=sa.question_id left join public.question_topics t on t.id=q.topic_id group by q.id,q.code,q.statement,t.name having count(sa.id)>=1 order by error_rate desc,answers desc limit 20) x),'[]'::jsonb)
 );
$$;

revoke all on function public.admin_save_simulation_definition_v2(bigint,text,text,text,text,bigint[],bigint[],integer,integer,boolean,boolean,text,text) from public,anon,authenticated;
grant execute on function public.admin_save_simulation_definition_v2(bigint,text,text,text,text,bigint[],bigint[],integer,integer,boolean,boolean,text,text) to service_role;
