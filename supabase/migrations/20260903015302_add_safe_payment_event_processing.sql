create or replace function public.begin_payment_event(
  p_provider_event_id text,
  p_event_type text,
  p_resource_id text,
  p_payload text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
  v_status text;
begin
  if coalesce(trim(p_provider_event_id),'')='' then raise exception 'provider_event_id obrigatório'; end if;

  insert into public.payment_events(provider,provider_event_id,event_type,resource_id,processing_status,payload,received_at)
  values('mercado_pago',p_provider_event_id,coalesce(p_event_type,'payment'),p_resource_id,'processing',p_payload,now())
  on conflict(provider_event_id) do nothing
  returning id into v_id;

  if v_id is not null then
    return jsonb_build_object('event_id',v_id,'should_process',true,'reprocessed',false);
  end if;

  select id,processing_status into v_id,v_status
  from public.payment_events where provider_event_id=p_provider_event_id;

  if v_status='processed' then
    return jsonb_build_object('event_id',v_id,'should_process',false,'reprocessed',false);
  end if;

  update public.payment_events
     set processing_status='processing', error_message=null, payload=p_payload, received_at=now()
   where id=v_id;

  return jsonb_build_object('event_id',v_id,'should_process',true,'reprocessed',true);
end;
$$;

create or replace function public.finish_payment_event(
  p_event_id bigint,
  p_processing_status text,
  p_error_message text default null
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_processing_status not in ('processed','failed','ignored') then raise exception 'status inválido'; end if;
  update public.payment_events
     set processing_status=p_processing_status,
         error_message=p_error_message,
         processed_at=case when p_processing_status in ('processed','ignored') then now() else processed_at end
   where id=p_event_id;
end;
$$;

revoke all on function public.begin_payment_event(text,text,text,text) from public,anon,authenticated;
revoke all on function public.finish_payment_event(bigint,text,text) from public,anon,authenticated;
grant execute on function public.begin_payment_event(text,text,text,text) to service_role;
grant execute on function public.finish_payment_event(bigint,text,text) to service_role;