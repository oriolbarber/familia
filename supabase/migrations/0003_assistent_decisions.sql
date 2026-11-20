-- Aprenentatge de l'assistent: què es fa amb cada proposta.
-- Serveix per revisar periòdicament el secret ASSISTENT_CONTEXT (vegeu docs/xats/08-revisio-assistent.md).
-- No es desen imatges: només el text escrit, el resum i les propostes.
-- Només hi accedeix l'Edge Function amb la service_role (RLS activat i sense polítiques).

create table if not exists public.assistent_decisions (
  id        bigserial primary key,
  quan      timestamptz not null default now(),
  persona   text not null,
  consulta  text,
  resum     text,
  tipus     text not null check (tipus in ('esdeveniment', 'compra', 'tasca')),
  accio     text not null check (accio in ('acceptat', 'editat', 'descartat')),
  proposta  jsonb not null,
  final     jsonb
);

create index if not exists assistent_decisions_quan on public.assistent_decisions (quan);

alter table public.assistent_decisions enable row level security;

-- Neteja (després de cada revisió, si vols): delete from assistent_decisions where quan < now() - interval '6 months';
