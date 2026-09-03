# Métricas de crescimento do admin

O painel administrativo calcula, para os últimos 30 dias:

- **Novos cadastros**: quantidade de contas criadas em `auth.users`.
- **Taxa de conversão**: `novos cadastros / sessões identificadas × 100`.

A leitura é feita pelo RPC server-only `public.admin_growth_metrics()`. A função não concede `EXECUTE` a `anon` nem `authenticated`; somente `service_role` e o proprietário do banco podem executá-la.
