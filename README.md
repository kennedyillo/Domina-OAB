# Domina OAB

Plataforma de preparação para a 1ª fase da OAB, com simulados, desempenho, diagnóstico e painel administrativo.

## Estado atual

- Front-end em Next.js.
- Supabase para autenticação, dados, RLS, progresso e administração.
- Vercel para deploy e previews.
- Painel administrativo com analytics, banco de questões, simulados, usuários, planos, fundadores e comunicações.
- Reporte de questões disponível no fluxo compartilhado de simulados, portanto aplicável às modalidades configuradas por definição/slug.
- Estrutura de e-mail desacoplada e preparada para integração futura com provedor externo.

## Integrações futuras

- Brevo: estrutura pronta, integração adiada.
- Mercado Pago: integração externa e validação final pendentes.

## Conteúdo e simulados

O banco acadêmico é organizado por disciplina, tema e questão. Os simulados podem usar pesos de incidência histórica por tema: assuntos mais recorrentes nas provas anteriores da OAB/FGV recebem maior probabilidade de aparecer, sem excluir temas menos frequentes. A distribuição é probabilística e os pesos podem ser recalibrados conforme novas provas oficiais forem classificadas.
