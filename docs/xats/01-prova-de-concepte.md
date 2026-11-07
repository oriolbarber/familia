# Xat 01 · Prova de concepte

Llegeix primer `CLAUDE.md`, `docs/proposta-v2.md`, `docs/full-de-ruta.md` i `docs/decisions.md`.

## Objectiu
Validar les dues peces de risc abans de construir res: l'accés a Google Calendar amb compte de servei i els avisos push als 4 mòbils (Android + iPhone).

## Feina
1. Confirma (documentació oficial actual) que un compte de servei amb el calendari "Família" compartit (permís "Fer canvis als esdeveniments") pot llegir i escriure sense caducar, i que no cal verificació OAuth. Si no és així, proposa l'alternativa.
2. Guia pas a pas per a mi: crear projecte a Google Cloud, activar Calendar API, compte de servei, clau JSON, compartir el calendari; crear projecte Supabase; desar la clau com a secret.
3. Edge Function `calendar` mínima: GET dels esdeveniments de la setmana (JWT del compte de servei signat a la funció, sense dependències pesades).
4. PWA mínima a `app/` (index.html, manifest, sw.js, icona) que mostra aquests esdeveniments i es pot instal·lar.
5. Push web de prova: claus VAPID, desar la subscripció, Edge Function `push-prova`. Instruccions d'instal·lació per a iPhone (iOS ≥ 16.4).
6. Publicació a GitHub Pages.

## Sortida
Taula a `docs/decisions.md`: compte de servei OK/KO, push OK/KO per mòbil, i pla B si cal.

## En acabar
- Marca les caselles fetes a `docs/full-de-ruta.md` i afegeix les decisions noves a `docs/decisions.md`.
- Fes commit amb missatge en català.
- Dona-me una llista breu del que cal provar a casa i als 4 mòbils.
