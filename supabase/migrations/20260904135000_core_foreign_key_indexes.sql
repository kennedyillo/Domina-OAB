-- Domina OAB - índices para relações usadas nos fluxos centrais

create index if not exists entitlements_plan_id_idx
  on public.entitlements(plan_id);

create index if not exists question_reports_user_id_idx
  on public.question_reports(user_id);

create index if not exists simulation_answers_question_id_idx
  on public.simulation_answers(question_id);

create index if not exists simulation_attempt_questions_question_id_idx
  on public.simulation_attempt_questions(question_id);

create index if not exists simulation_attempts_discipline_id_idx
  on public.simulation_attempts(discipline_id);

create index if not exists simulation_definitions_discipline_id_idx
  on public.simulation_definitions(discipline_id);
