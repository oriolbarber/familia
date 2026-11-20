-- Assistent: registre d'usos per al límit diari i per veure la despesa.
-- Només hi accedeix l'Edge Function amb la service_role (RLS activat i sense polítiques).

create table if not exists public.assistent_usos (
  id             bigserial primary key,
  persona        text not null,
  quan           timestamptz not null default now(),
  model          text,
  tokens_entrada integer,
  tokens_sortida integer
);

create index if not exists assistent_usos_persona_quan on public.assistent_usos (persona, quan);

alter table public.assistent_usos enable row level security;

-- Consulta útil per veure el consum del mes (SQL Editor):
-- select persona, count(*) usos, sum(tokens_entrada) entrada, sum(tokens_sortida) sortida
-- from assistent_usos where quan >= date_trunc('month', now()) group by persona;
