# Xat 03 · Fase A · Base

Llegeix primer `CLAUDE.md`, `docs/proposta-v2.md`, `docs/full-de-ruta.md` i `docs/decisions.md`. Requereix els xats 01 i 02.

## Objectiu
Primera versió usable: login, Inici i agenda amb autoritzacions.

## Feina
1. Login amb Supabase Auth (correu + contrasenya o enllaç màgic; recomana'm-ne un). Perfil amb color i inicial.
2. Estructura de l'app: navegació inferior (Inici · Agenda · …), menú ⋮ estil WhatsApp amb "Aspecte" (clar/fosc, mida de lletra, daltònics).
3. Agenda setmanal amb filtres per persona; crear/editar esdeveniment (escriu a Google via Edge Function).
4. Autoritzacions: si un fill crea dormir fora / tornar tard / amb cost → "[Pendent] …" al títol; un pare/mare aprova o rebutja (rebutjat → s'esborra de Google i queda a l'historial amb comentari).
5. Inici: activitats d'avui, autoritzacions pendents (pares).
6. Sense connexió: última còpia a IndexedDB.

## En acabar
- Marca les caselles fetes a `docs/full-de-ruta.md` i afegeix les decisions noves a `docs/decisions.md`.
- Fes commit amb missatge en català.
- Dona-me una llista breu del que cal provar a casa i als 4 mòbils.
