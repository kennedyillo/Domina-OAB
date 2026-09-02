-- Domina OAB - Fase 2: importação em lote, duplicação e validação editorial

create or replace function public.validate_question_for_publish(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare q public.questions%rowtype; issues text[] := '{}';
begin
  select * into q from public.questions where id=p_id;
  if not found then raise exception 'question_not_found'; end if;
  if trim(coalesce(q.code,''))='' then issues:=array_append(issues,'Código obrigatório'); end if;
  if trim(coalesce(q.statement,''))='' then issues:=array_append(issues,'Enunciado obrigatório'); end if;
  if jsonb_typeof(q.options)<>'array' or jsonb_array_length(q.options)<>4 then
    issues:=array_append(issues,'São exigidas 4 alternativas');
  elsif exists(select 1 from jsonb_array_elements_text(q.options) x where trim(x)='') then
    issues:=array_append(issues,'Há alternativa vazia');
  end if;
  if q.correct_index not between 0 and 3 then issues:=array_append(issues,'Gabarito inválido'); end if;
  if trim(coalesce(q.explanation,''))='' then issues:=array_append(issues,'Fundamentação obrigatória'); end if;
  if q.topic_id is null then issues:=array_append(issues,'Tema obrigatório'); end if;
  return jsonb_build_object('valid',cardinality(issues)=0,'issues',to_jsonb(issues));
end;
$$;

create or replace function public.admin_set_question_status_v3(p_id bigint,p_status text,p_actor_email text default null)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v jsonb;
begin
  if p_status='published' then
    v:=public.validate_question_for_publish(p_id);
    if coalesce((v->>'valid')::boolean,false)=false then raise exception 'question_not_ready:%',v->'issues'; end if;
  end if;
  perform public.admin_set_question_status_v2(p_id,p_status,p_actor_email);
end;
$$;

create or replace function public.admin_duplicate_question(p_id bigint,p_actor_email text default null)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare q public.questions%rowtype; v_id bigint; v_code text;
begin
  select * into q from public.questions where id=p_id;
  if not found then raise exception 'question_not_found'; end if;
  v_code:=q.code||'-COPY-'||to_char(clock_timestamp(),'YYMMDDHH24MISSMS');
  insert into public.questions(code,discipline_id,topic_id,statement,options,correct_index,explanation,source_label,difficulty,status,position,last_edited_by_email)
  values(v_code,q.discipline_id,q.topic_id,q.statement,q.options,q.correct_index,q.explanation,q.source_label,q.difficulty,'draft',q.position,
    lower(nullif(trim(coalesce(p_actor_email,'')),''))) returning id into v_id;
  return jsonb_build_object('ok',true,'id',v_id,'code',v_code);
end;
$$;

create or replace function public.admin_import_questions(p_items jsonb,p_actor_email text default null)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare item jsonb; imported int:=0; failed int:=0; errors jsonb:='[]'::jsonb; result jsonb;
begin
  if jsonb_typeof(p_items)<>'array' then raise exception 'array_required'; end if;
  if jsonb_array_length(p_items)>500 then raise exception 'batch_too_large'; end if;
  for item in select value from jsonb_array_elements(p_items) loop
    begin
      result:=public.admin_save_question_v2(null,item->>'code',coalesce(item->>'discipline_slug','etica-profissional'),item->>'topic',item->>'statement',item->'options',coalesce((item->>'correct_index')::int,0),item->>'explanation',item->>'source_label',coalesce(item->>'difficulty','medium'),'draft',p_actor_email);
      imported:=imported+1;
    exception when others then
      failed:=failed+1;
      errors:=errors||jsonb_build_array(jsonb_build_object('code',item->>'code','error',sqlerrm));
    end;
  end loop;
  return jsonb_build_object('imported',imported,'failed',failed,'errors',errors);
end;
$$;

revoke all on function public.validate_question_for_publish(bigint) from public,anon,authenticated;
revoke all on function public.admin_set_question_status_v3(bigint,text,text) from public,anon,authenticated;
revoke all on function public.admin_duplicate_question(bigint,text) from public,anon,authenticated;
revoke all on function public.admin_import_questions(jsonb,text) from public,anon,authenticated;
grant execute on function public.validate_question_for_publish(bigint) to service_role;
grant execute on function public.admin_set_question_status_v3(bigint,text,text) to service_role;
grant execute on function public.admin_duplicate_question(bigint,text) to service_role;
grant execute on function public.admin_import_questions(jsonb,text) to service_role;
