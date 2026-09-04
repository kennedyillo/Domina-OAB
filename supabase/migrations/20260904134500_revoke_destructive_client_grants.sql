-- Domina OAB - hardening de grants e policies de perfil

-- Clientes do Data API não precisam desses privilégios de tabela. Em particular,
-- TRUNCATE não é governado por RLS e não deve ser concedido a anon/authenticated.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

-- Mantém as policies de perfil equivalentes, mas evita reavaliar auth.uid() por linha.
drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own on public.user_profiles
for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own on public.user_profiles
for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
