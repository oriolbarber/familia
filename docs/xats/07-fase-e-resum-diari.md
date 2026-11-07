# Xat 07 · Fase E · Resum diari

Llegeix primer `CLAUDE.md`, `docs/proposta-v2.md`, `docs/full-de-ruta.md` i `docs/decisions.md`. Requereix la Fase D provada a casa.

## Objectiu
Un sol avís al matí per persona.

## Feina
1. Edge Function `resum-mati`: per a cada membre, activitats del dia, tasques endarrerides i (pares) autoritzacions pendents.
2. Tasca programada (pg_cron) a l'hora decidida; caps de setmana segons preferència.
3. Push web a cada subscripció; si falla o no n'hi ha, pla B per correu.
4. Preferències per persona a "Avisos" (activar/desactivar, provar ara).

## En acabar
- Marca les caselles fetes a `docs/full-de-ruta.md` i afegeix les decisions noves a `docs/decisions.md`.
- Fes commit amb missatge en català.
- Dona-me una llista breu del que cal provar a casa i als 4 mòbils.
