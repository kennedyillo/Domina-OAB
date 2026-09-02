# Domina OAB

Plataforma de simulados e inteligência de desempenho para preparação da OAB.

## Segurança e operação

Mudanças de hardening que dependem de novo deployment ficam preparadas na branch `security/admin-auth-hardening` enquanto a Vercel estiver no limite de deployments.

Após o próximo deploy dessa branch/merge:

- o cadastro fundador passa a usar `register_founder_server` via `service_role`, com limite por IP no servidor;
- a leitura de disponibilidade das vagas passa pelo backend;
- analytics passa pelo backend com `service_role`;
- os RPCs públicos legados `register_founder`, `founder_availability` e `record_analytics` poderão ter `EXECUTE` revogado de `anon` e `authenticated`;
- a autenticação administrativa exige `app_metadata.role = "admin"` e usa rate limit de tentativas.

Nunca adicionar `SUPABASE_SERVICE_ROLE_KEY` ou outras credenciais privadas em arquivos versionados ou variáveis `NEXT_PUBLIC_*`.
