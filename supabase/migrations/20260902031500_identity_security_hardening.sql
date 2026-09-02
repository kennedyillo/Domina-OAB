-- Domina OAB - migration histórica de hardening da identidade.
--
-- O conteúdo originalmente criado neste arquivo foi substituído por migrations
-- posteriores aplicadas diretamente no projeto Domina OAB em 02/09/2026.
-- Mantemos este arquivo como marcador histórico para não reaplicar regras antigas
-- que revogariam o modelo atual de autorização.
--
-- Estado atual esperado:
-- - upsert_identity e activate_founder_access aceitam authenticated com validação
--   obrigatória de auth.uid() e também service_role para fluxos server-side;
-- - resolve_login_identifier permanece restrita a service_role;
-- - constraints e grants atuais são definidos pelas migrations de hardening mais
--   recentes registradas no Supabase.

select 1;
