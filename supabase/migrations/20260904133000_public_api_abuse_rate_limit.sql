-- Domina OAB - Marco A: rate limit server-side para endpoints públicos sensíveis

create schema if not exists private;

create table if not exists private.public_api_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null default now(),
  hits integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (scope, key_hash),
  check (hits >= 0)
);

alter table private.public_api_rate_limits enable row level security;
revoke all on table private.public_api_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table private.public_api_rate_limits to service_role;

create or replace function public.consume_public_api_rate_limit(
  p_scope text,
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scope text := left(trim(coalesce(p_scope, '')), 80);
  v_key_hash text := encode(sha256(convert_to(coalesce(p_key, ''), 'UTF8')), 'hex');
  v_hits integer;
  v_window_started_at timestamptz;
  v_retry integer;
begin
  if v_scope = '' or p_key is null or p_key = '' then
    raise exception 'invalid_rate_limit_key';
  end if;
  if p_limit < 1 or p_limit > 10000 then
    raise exception 'invalid_rate_limit';
  end if;
  if p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid_rate_limit_window';
  end if;

  insert into private.public_api_rate_limits(scope, key_hash, window_started_at, hits, updated_at)
  values (v_scope, v_key_hash, now(), 1, now())
  on conflict (scope, key_hash) do update set
    hits = case
      when private.public_api_rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= now() then 1
      else private.public_api_rate_limits.hits + 1
    end,
    window_started_at = case
      when private.public_api_rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= now() then now()
      else private.public_api_rate_limits.window_started_at
    end,
    updated_at = now()
  returning hits, window_started_at into v_hits, v_window_started_at;

  delete from private.public_api_rate_limits
  where updated_at < now() - interval '48 hours';

  if v_hits > p_limit then
    v_retry := greatest(1, ceil(extract(epoch from ((v_window_started_at + make_interval(secs => p_window_seconds)) - now())))::int);
    return jsonb_build_object('allowed', false, 'retry_after_seconds', v_retry, 'hits', v_hits);
  end if;

  return jsonb_build_object('allowed', true, 'retry_after_seconds', 0, 'hits', v_hits);
end;
$$;

revoke all on function public.consume_public_api_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_public_api_rate_limit(text,text,integer,integer) to service_role;
