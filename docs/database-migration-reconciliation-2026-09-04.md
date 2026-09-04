# Reconciliação de migrations aplicadas fora da main — 04/09/2026

Durante a auditoria do PR legado #23 foi identificado drift entre o histórico de migrations do Supabase de produção e os arquivos versionados em `main`.

## Causa

Parte do trabalho de analytics, editorial, simulados, usuários, comunicações e financeiro foi aplicada diretamente ao Supabase durante a construção do PR #23. O Supabase registrou essas migrations com versões geradas no momento da aplicação, mas os arquivos equivalentes permaneceram apenas na branch antiga e nunca chegaram à `main`.

Isso deixava produção funcional, porém tornava o repositório incapaz de reconstruir fielmente a evolução do schema.

## Correção

Foram restaurados no repositório os 17 arquivos ausentes usando **os mesmos números de versão e o SQL registrado em `supabase_migrations.schema_migrations`**:

- 20260903002101 admin_growth_metrics
- 20260903003128 extend_admin_growth_metrics_active_users
- 20260903003616 admin_subscribers_by_plan_metrics
- 20260903004130 admin_financial_health_metrics
- 20260903004530 admin_retention_metrics
- 20260903004747 admin_student_progress_metrics
- 20260903005156 admin_question_quality_metrics
- 20260903005314 simulation_answer_timing_metrics
- 20260903010102 admin_filtered_analytics_and_exam_edition
- 20260903010550 question_editorial_metadata_complete
- 20260903011058 simulation_selection_and_abandonment
- 20260903011606 admin_user_history_access_and_plans
- 20260903012159 communication_unsubscribe_fix
- 20260903012300 my_communication_preferences_read
- 20260903014114 admin_financial_reporting
- 20260903014614 add_financial_adjustments_and_reconciliation
- 20260903015302 add_safe_payment_event_processing

## Regra de segurança

Esses arquivos **não foram reaplicados em produção** durante a reconciliação. As versões já constam como aplicadas no histórico do Supabase.

As funções privilegiadas relacionadas a este lote também foram conferidas no banco atual: as ACLs efetivas permitem execução apenas por `postgres` e `service_role`, sem `anon` ou `authenticated`.

O PR #23 não deve ser mergeado integralmente. Código/UI útil deve ser portado seletivamente e adaptado ao RBAC atual. A página de analytics é tratada separadamente no PR #68.
