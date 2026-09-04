-- Alinha o catálogo ao modelo comercial atual: períodos de acesso, sem recorrência automática.
-- O id legado `domina-monthly` é preservado por compatibilidade com referências históricas.

update public.plans
set name = 'Domina 30 dias',
    billing_type = 'one_time',
    duration_days = 30,
    price_cents = 4990,
    max_installments = 1,
    active = true
where id = 'domina-monthly';

update public.plans
set name = 'Domina 90 dias',
    billing_type = 'one_time',
    duration_days = 90,
    price_cents = 12990,
    max_installments = 3,
    active = true
where id = 'domina-90';
