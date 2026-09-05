update public.simulation_definitions
set description='Sessão de Ética Profissional com questões selecionadas pelo catálogo administrativo.',
    updated_at=now()
where slug='simulado-etica'
  and description='Sessão demonstrativa controlada pelo catálogo administrativo.';
