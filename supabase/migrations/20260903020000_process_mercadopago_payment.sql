-- Domina OAB — processamento de pagamentos do Mercado Pago
--
-- Esta função já estava aplicada diretamente no projeto Supabase de produção
-- (Domina OAB), mas nunca tinha sido versionada como migration no repositório.
-- Este arquivo apenas sincroniza o Git com o que já está rodando, sem alterar
-- comportamento. É a função chamada pelo webhook em
-- app/api/webhooks/mercadopago/route.ts.

create or replace function public.process_mercadopago_payment(
  p_provider_payment_id text,
  p_user_id text,
  p_email text,
  p_plan_id text,
  p_status text,
  p_payment_method text default null,
  p_installments integer default 1,
  p_gross_amount_cents integer default 0,
  p_access_days integer default null,
  p_approved_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id uuid;
  v_plan_id text;
  v_days integer;
  v_payment_id bigint;
  v_entitlement_id bigint;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
begin
  if coalesce(trim(p_provider_payment_id), '') = '' then
    raise exception 'provider_payment_id obrigatório';
  end if;

  begin
    v_user_id := p_user_id::uuid;
  exception when invalid_text_representation then
    raise exception 'user_id inválido';
  end;

  if not exists (select 1 from auth.users where id = v_user_id) then
    raise exception 'usuário não encontrado';
  end if;

  v_plan_id := case p_plan_id
    when '90d' then 'domina-90'
    when 'annual' then 'domina-annual'
    when 'domina-90' then 'domina-90'
    when 'domina-annual' then 'domina-annual'
    else null
  end;

  if v_plan_id is null then
    raise exception 'plano inválido';
  end if;

  select duration_days
    into v_days
  from public.plans
  where id = v_plan_id and active = true;

  if v_days is null then
    raise exception 'plano inexistente ou inativo';
  end if;

  if p_access_days is not null and p_access_days <> v_days then
    raise exception 'duração do plano divergente';
  end if;

  perform pg_advisory_xact_lock(hashtext('mercadopago:' || p_provider_payment_id));

  insert into public.payments (
    user_id,
    email,
    plan_id,
    provider,
    provider_payment_id,
    status,
    payment_method,
    installments,
    gross_amount_cents,
    approved_at,
    updated_at
  ) values (
    v_user_id,
    lower(trim(p_email)),
    v_plan_id,
    'mercado_pago',
    p_provider_payment_id,
    coalesce(p_status, 'pending'),
    p_payment_method,
    greatest(coalesce(p_installments, 1), 1),
    greatest(coalesce(p_gross_amount_cents, 0), 0),
    p_approved_at,
    now()
  )
  on conflict (provider_payment_id) do update set
    status = excluded.status,
    payment_method = excluded.payment_method,
    installments = excluded.installments,
    gross_amount_cents = excluded.gross_amount_cents,
    approved_at = coalesce(excluded.approved_at, public.payments.approved_at),
    updated_at = now()
  returning id into v_payment_id;

  if p_status = 'approved' then
    select id
      into v_entitlement_id
    from public.entitlements
    where source_type = 'mercado_pago_payment'
      and source_id = p_provider_payment_id
    limit 1;

    if v_entitlement_id is null then
      select greatest(now(), coalesce(max(ends_at), now()))
        into v_starts_at
      from public.entitlements
      where user_id = v_user_id
        and status = 'active'
        and ends_at > now();

      v_ends_at := v_starts_at + make_interval(days => v_days);

      insert into public.entitlements (
        user_id,
        email,
        plan_id,
        source_type,
        source_id,
        status,
        starts_at,
        ends_at,
        updated_at
      ) values (
        v_user_id,
        lower(trim(p_email)),
        v_plan_id,
        'mercado_pago_payment',
        p_provider_payment_id,
        'active',
        v_starts_at,
        v_ends_at,
        now()
      )
      returning id into v_entitlement_id;
    end if;
  elsif p_status in ('cancelled', 'refunded', 'charged_back') then
    update public.entitlements
       set status = 'revoked', updated_at = now()
     where source_type = 'mercado_pago_payment'
       and source_id = p_provider_payment_id
       and status <> 'revoked';
  end if;

  return jsonb_build_object(
    'payment_id', v_payment_id,
    'provider_payment_id', p_provider_payment_id,
    'status', p_status,
    'plan_id', v_plan_id,
    'entitlement_id', v_entitlement_id
  );
end;
$$;

revoke all on function public.process_mercadopago_payment(text,text,text,text,text,text,integer,integer,integer,timestamptz) from public,anon,authenticated;
grant execute on function public.process_mercadopago_payment(text,text,text,text,text,text,integer,integer,integer,timestamptz) to service_role;
