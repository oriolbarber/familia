# Xat 02 · Model de dades a Supabase

Llegeix primer `CLAUDE.md`, `docs/proposta-v2.md`, `docs/full-de-ruta.md` i `docs/decisions.md`. Requereix el xat 01 tancat.

## Objectiu
Esquema complet de la v1 com a migracions SQL a `supabase/migrations/`, amb RLS.

## Feina
1. Taules: `membres` (rol pare/fill, color, inicial), `esdeveniments_meta` (id de Google, persona, tipus d'autorització, estat, comentari, qui aprova, historial de rebutjades), `tasques`, `execucions`, `agafades` (per al dia), `llistes`, `items_llista`, `desitjos`, `prestecs`, `subscripcions_push`, `preferencies`.
2. RLS: fills només creen/editen el que és seu; només pares aproven; préstecs visibles per a implicats + pares (o el que s'hagi decidit a les preguntes obertes).
3. Vistes o funcions útils: tasques amb "fa X dies" i retard, ordenades.
4. Seed amb els 4 membres i la llista inicial de tasques (pregunta-me-la si no hi és).
5. Diagrama breu de relacions a `docs/model-de-dades.md`.

Avisa'm de cada decisió de disseny amb la teva recomanació abans d'escriure-la.

## En acabar
- Marca les caselles fetes a `docs/full-de-ruta.md` i afegeix les decisions noves a `docs/decisions.md`.
- Fes commit amb missatge en català.
- Dona-me una llista breu del que cal provar a casa i als 4 mòbils.
