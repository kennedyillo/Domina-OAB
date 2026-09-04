alter table public.questions add column if not exists exam_name text;
alter table public.questions add column if not exists exam_phase text;
alter table public.questions add column if not exists subtopic text;
alter table public.questions add column if not exists incidence text;
alter table public.question_versions add column if not exists exam_name text;
alter table public.question_versions add column if not exists exam_phase text;
alter table public.question_versions add column if not exists subtopic text;
alter table public.question_versions add column if not exists incidence text;

alter table public.questions drop constraint if exists questions_incidence_check;
alter table public.questions add constraint questions_incidence_check check (incidence is null or incidence in ('low','medium','high'));
alter table public.question_versions drop constraint if exists question_versions_incidence_check;
alter table public.question_versions add constraint question_versions_incidence_check check (incidence is null or incidence in ('low','medium','high'));

create or replace function public.snapshot_question_version(p_question_id bigint,p_change_type text,p_actor_email text default null)
returns void language plpgsql security definer set search_path=public as $$
declare q public.questions%rowtype; v_no integer;
begin
 select * into q from public.questions where id=p_question_id; if not found then raise exception 'question_not_found'; end if;
 select coalesce(max(version_no),0)+1 into v_no from public.question_versions where question_id=p_question_id;
 insert into public.question_versions(question_id,version_no,code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,change_type,changed_by_email,exam_name,exam_edition,exam_phase,subtopic,incidence)
 values(q.id,v_no,q.code,q.discipline_id,q.topic_id,q.statement,q.options,q.correct_index,q.explanation,q.source_label,q.difficulty,q.status,p_change_type,lower(nullif(trim(coalesce(p_actor_email,'')),'')),q.exam_name,q.exam_edition,q.exam_phase,q.subtopic,q.incidence);
end; $$;

create or replace function public.admin_save_question_v3(
 p_id bigint,p_code text,p_discipline_slug text,p_topic text,p_statement text,p_options jsonb,p_correct_index integer,p_explanation text,p_source_label text,p_difficulty text,p_status text,
 p_exam_name text default null,p_exam_edition text default null,p_exam_phase text default null,p_subtopic text default null,p_incidence text default null,p_actor_email text default null
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_discipline bigint; v_topic bigint; v_id bigint; v_topic_slug text;
begin
 if jsonb_typeof(p_options)<>'array' or jsonb_array_length(p_options)<>4 then raise exception 'four_options_required'; end if;
 if p_correct_index not between 0 and 3 then raise exception 'invalid_correct_index'; end if;
 if p_difficulty not in ('easy','medium','hard') then raise exception 'invalid_difficulty'; end if;
 if coalesce(nullif(trim(p_incidence),''),'medium') not in ('low','medium','high') then raise exception 'invalid_incidence'; end if;
 if p_status not in ('draft','reviewing','published','suspended','archived') then raise exception 'invalid_status'; end if;
 if trim(coalesce(p_code,''))='' or trim(coalesce(p_statement,''))='' or trim(coalesce(p_explanation,''))='' then raise exception 'required_fields_missing'; end if;
 if exists(select 1 from jsonb_array_elements_text(p_options) x where trim(x)='') then raise exception 'empty_option'; end if;
 select id into v_discipline from public.disciplines where slug=p_discipline_slug; if v_discipline is null then raise exception 'discipline_not_found'; end if;
 v_topic_slug:=lower(regexp_replace(trim(p_topic),'[^a-zA-Z0-9]+','-','g'));
 select id into v_topic from public.question_topics where discipline_id=v_discipline and lower(name)=lower(trim(p_topic)) limit 1;
 if v_topic is null then insert into public.question_topics(discipline_id,name,slug,position) values(v_discipline,trim(p_topic),v_topic_slug,999) on conflict(discipline_id,slug) do update set name=excluded.name,updated_at=now() returning id into v_topic; end if;
 if p_id is null then
  insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position,last_edited_by_email,exam_name,exam_edition,exam_phase,subtopic,incidence)
  values(upper(trim(p_code)),v_discipline,v_topic,trim(p_statement),p_options,p_correct_index,trim(p_explanation),nullif(trim(p_source_label),''),p_difficulty,p_status,999,lower(nullif(trim(coalesce(p_actor_email,'')),'')),nullif(trim(p_exam_name),''),nullif(trim(p_exam_edition),''),nullif(trim(p_exam_phase),''),nullif(trim(p_subtopic),''),coalesce(nullif(trim(p_incidence),''),'medium')) returning id into v_id;
 else
  perform public.snapshot_question_version(p_id,'content_edit',p_actor_email);
  update public.questions set code=upper(trim(p_code)),discipline_id=v_discipline,topic_id=v_topic,statement=trim(p_statement),options=p_options,correct_index=p_correct_index,explanation=trim(p_explanation),source_label=nullif(trim(p_source_label),''),difficulty=p_difficulty,status=p_status,last_edited_by_email=lower(nullif(trim(coalesce(p_actor_email,'')),'')),exam_name=nullif(trim(p_exam_name),''),exam_edition=nullif(trim(p_exam_edition),''),exam_phase=nullif(trim(p_exam_phase),''),subtopic=nullif(trim(p_subtopic),''),incidence=coalesce(nullif(trim(p_incidence),''),'medium'),updated_at=now() where id=p_id returning id into v_id;
  if v_id is null then raise exception 'question_not_found'; end if;
 end if;
 return jsonb_build_object('ok',true,'id',v_id);
end; $$;

create or replace function public.admin_duplicate_question(p_id bigint,p_actor_email text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q public.questions%rowtype; v_id bigint; v_code text;
begin
 select * into q from public.questions where id=p_id; if not found then raise exception 'question_not_found'; end if;
 v_code:=q.code||'-COPY-'||to_char(clock_timestamp(),'YYMMDDHH24MISSMS');
 insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position,last_edited_by_email,exam_name,exam_edition,exam_phase,subtopic,incidence)
 values(v_code,q.discipline_id,q.topic_id,q.statement,q.options,q.correct_index,q.explanation,q.source_label,q.difficulty,'draft',q.position,lower(nullif(trim(coalesce(p_actor_email,'')),'')),q.exam_name,q.exam_edition,q.exam_phase,q.subtopic,q.incidence) returning id into v_id;
 return jsonb_build_object('ok',true,'id',v_id,'code',v_code);
end; $$;

create or replace function public.admin_import_questions(p_items jsonb,p_actor_email text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare item jsonb; imported int:=0; failed int:=0; errors jsonb:='[]'::jsonb; result jsonb;
begin
 if jsonb_typeof(p_items)<>'array' then raise exception 'array_required'; end if;
 if jsonb_array_length(p_items)>500 then raise exception 'batch_too_large'; end if;
 for item in select value from jsonb_array_elements(p_items) loop
  begin
   result:=public.admin_save_question_v3(null,item->>'code',coalesce(item->>'discipline_slug','etica-profissional'),item->>'topic',item->>'statement',item->'options',coalesce((item->>'correct_index')::int,0),item->>'explanation',item->>'source_label',coalesce(item->>'difficulty','medium'),'draft',item->>'exam_name',item->>'exam_edition',item->>'exam_phase',item->>'subtopic',coalesce(item->>'incidence','medium'),p_actor_email);
   imported:=imported+1;
  exception when others then failed:=failed+1; errors:=errors||jsonb_build_array(jsonb_build_object('code',item->>'code','error',sqlerrm)); end;
 end loop;
 return jsonb_build_object('imported',imported,'failed',failed,'errors',errors);
end; $$;

create or replace function public.admin_questions(p_query text default null,p_status text default null)
returns jsonb language sql security definer set search_path=public as $$
 select coalesce(jsonb_agg(to_jsonb(x) order by x.updated_at desc),'[]'::jsonb) from (
  select q.id,q.code,d.slug discipline_slug,d.name discipline,t.id topic_id,t.name topic,q.statement,q.options,q.correct_index,q.explanation,q.source_label,q.difficulty,q.status,q.exam_name,q.exam_edition,q.exam_phase,q.subtopic,q.incidence,
   q.position,q.created_at,q.updated_at,q.last_edited_by_email,(select count(*)::int from public.question_reports r where r.question_id=q.id and r.status in ('open','reviewing')) open_reports,(select count(*)::int from public.question_versions v where v.question_id=q.id) version_count
  from public.questions q join public.disciplines d on d.id=q.discipline_id left join public.question_topics t on t.id=q.topic_id
  where (coalesce(trim(p_status),'')='' or q.status=p_status) and (coalesce(trim(p_query),'')='' or lower(q.code) like '%'||lower(trim(p_query))||'%' or lower(q.statement) like '%'||lower(trim(p_query))||'%' or lower(coalesce(t.name,'')) like '%'||lower(trim(p_query))||'%' or lower(coalesce(q.subtopic,'')) like '%'||lower(trim(p_query))||'%' or lower(coalesce(q.exam_edition,'')) like '%'||lower(trim(p_query))||'%')
  order by q.updated_at desc limit 300
 ) x;
$$;

create or replace function public.admin_question_versions(p_question_id bigint)
returns jsonb language sql security definer set search_path=public as $$
 select coalesce(jsonb_agg(to_jsonb(x) order by x.version_no desc),'[]'::jsonb) from (
  select v.version_no,v.code,d.name discipline,t.name topic,v.statement,v.options,v.correct_index,v.explanation,v.source_label,v.difficulty,v.status,v.change_type,v.changed_by_email,v.created_at,v.exam_name,v.exam_edition,v.exam_phase,v.subtopic,v.incidence
  from public.question_versions v join public.disciplines d on d.id=v.discipline_id left join public.question_topics t on t.id=v.topic_id
  where v.question_id=p_question_id order by v.version_no desc limit 50
 ) x;
$$;

revoke all on function public.admin_save_question_v3(bigint,text,text,text,text,jsonb,integer,text,text,text,text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.admin_save_question_v3(bigint,text,text,text,text,jsonb,integer,text,text,text,text,text,text,text,text,text,text) to service_role;