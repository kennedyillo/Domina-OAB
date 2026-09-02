-- Domina OAB - hardening da identidade e bloqueio real de login

-- Perfil é leitura própria no cliente. Alterações de identidade passam somente por RPC controlada.
drop policy if exists user_profiles_update_own on public.user_profiles;

-- CPF válido sempre que preenchido.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='user_profiles_cpf_valid_check'
  ) then
    alter table public.user_profiles add constraint user_profiles_cpf_valid_check
      check (cpf is null or public.valid_cpf(cpf));
  end if;
end $$;

-- Funções sensíveis são somente server/service role.
revoke all on function public.upsert_identity(uuid,text,text,text,text) from public, anon, authenticated;
revoke all on function public.activate_founder_access(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.upsert_identity(uuid,text,text,text,text) to service_role;
grant execute on function public.activate_founder_access(uuid,text,text,text,text) to service_role;

-- Resolve CPF/e-mail/telefone apenas para contas ativas.
create or replace function public.resolve_login_identifier(p_identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v text := trim(p_identifier);
  v_digits text := public.only_digits(p_identifier);
  result_email text;
begin
  if position('@' in v) > 1 then
    select email into result_email
    from public.user_profiles
    where lower(email)=lower(v) and account_status='active'
    limit 1;
  elsif length(v_digits)=11 and public.valid_cpf(v_digits) then
    select email into result_email
    from public.user_profiles
    where cpf=v_digits and account_status='active'
    limit 1;
  else
    select email into result_email
    from public.user_profiles
    where phone=v_digits and account_status='active'
    limit 1;
  end if;

  return result_email;
end;
$$;

revoke all on function public.resolve_login_identifier(text) from public, anon, authenticated;
grant execute on function public.resolve_login_identifier(text) to service_role;
