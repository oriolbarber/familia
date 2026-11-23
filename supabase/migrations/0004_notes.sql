-- Notes tipus post-it, compartides per tota la família.
-- Només hi accedeix l'Edge Function «notes» amb la service_role (RLS activat i sense polítiques).

create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  text         text not null check (char_length(text) between 1 and 500),
  color        text not null default 'groc',
  autor        text not null,
  creada       timestamptz not null default now(),
  actualitzada timestamptz not null default now()
);

create index if not exists notes_creada on public.notes (creada desc);

alter table public.notes enable row level security;
