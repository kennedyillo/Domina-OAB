create or replace function public.record_analytics_server(
  p_event_type text,
  p_path text,
  p_session_id text,
  p_referrer text default '',
  p_utm_source text default '',
  p_utm_medium text default '',
  p_utm_campaign text default '',
  p_client_ip text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ip_hash text := encode(extensions.digest(coalesce(nullif(trim(p_client_ip), ''), 'unknown'), 'sha256'), 'hex');
  v_count integer;
begin
  delete from private.analytics_rate_limits
   where attempted_at < now() - interval '24 hours';

  select count(*) into v_count
  from private.analytics_rate_limits
  where ip_hash = v_ip_hash
    and attempted_at >= now() - interval '1 minute';

  if v_count >= 120 then
    raise exception 'rate_limit_exceeded';
  end if;

  insert into private.analytics_rate_limits(ip_hash) values (v_ip_hash);

  if p_event_type not in ('page_view','simulado_started','simulado_completed') then
    raise exception 'invalid_event';
  end if;

  if coalesce(trim(p_session_id), '') = '' then
    raise exception 'invalid_session';
  end if;

  insert into public.analytics_events(
    event_type,path,session_id,referrer,utm_source,utm_medium,utm_campaign
  ) values (
    left(p_event_type,40),
    left(coalesce(nullif(p_path,''),'/'),300),
    left(p_session_id,80),
    left(coalesce(p_referrer,''),500),
    left(coalesce(p_utm_source,''),120),
    left(coalesce(p_utm_medium,''),120),
    left(coalesce(p_utm_campaign,''),160)
  );
end;
$$;
