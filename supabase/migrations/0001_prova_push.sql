-- Prova de concepte: subscripcions push.
-- Només hi accedeix l'Edge Function amb la service_role (RLS activat i sense polítiques).
-- El xat 02 (model de dades) la lligarà a la taula de membres.

create table if not exists public.subscripcions_push (
  endpoint    text primary key,
  persona     text not null,
  p256dh      text not null,
  auth        text not null,
  dispositiu  text,
  creat       timestamptz not null default now(),
  actualitzat timestamptz not null default now()
);

alter table public.subscripcions_push enable row level security;
