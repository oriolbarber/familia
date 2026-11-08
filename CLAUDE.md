# Gestió familiar · context per a Claude

PWA privada per a 4 persones (2 pares + 2 fills de 12–17 anys, cadascú amb mòbil propi, barreja Android/iOS) que concentra **agenda familiar, tasques de casa, llista de la compra, desitjos i préstecs**.

**Principi de disseny:** facilitar acords, no controlar. Res de punts, rànquings ni remuneracions. Les tasques s'agafen lliurement.

Especificació completa: `docs/proposta-v2.md`. Estat i fases: `docs/full-de-ruta.md`. Decisions: `docs/decisions.md`.

## Arquitectura

| Peça | Tecnologia |
|---|---|
| Interfície | HTML/CSS/JS **sense framework**, mòbil primer (`app/`) |
| Dades i usuaris | Supabase (Postgres + Auth + RLS) (`supabase/migrations/`) |
| Agenda | Google Calendar API, calendari compartit de la família **"GLOB"**, via **compte de servei** cridat des d'una Edge Function. Els usuaris **no** entren amb Google |
| Lògica de servidor | Supabase Edge Functions + tasca programada (`supabase/functions/`) |
| Allotjament | GitHub Pages (HTTPS) |
| Instal·lació | `manifest.webmanifest` + `sw.js` (pantalla d'inici i ús sense connexió) |

- Google Calendar és la **font única** de l'agenda. Supabase només desa el que Google no sap: persona propietària, estat d'autorització, historial de rebutjades.
- La clau del compte de servei i la `service_role` de Supabase **mai** al client ni al repositori: només com a secrets de les Edge Functions.
- La clau `anon` de Supabase sí que pot anar al client; la seguretat la fa l'RLS.
- `app/js/dades.js` és l'única capa que parla amb Google/Supabase; sense Supabase configurat l'app va en **mode prova** amb dades d'exemple.
- Sense connexió: la PWA mostra l'última còpia desada (IndexedDB) i envia els canvis en recuperar la xarxa.

## Estructura del repositori

```
app/                  PWA estàtica (index.html, estil.css, js/dades.js, js/app.js, sw.js, manifest, icones, fonts)
supabase/migrations/  SQL numerat (esquema, RLS, funcions)
supabase/functions/   Edge Functions (calendar, resum-mati, ...)
docs/                 Proposta, full de ruta, decisions, prompts dels xats
```

## Criteris d'interfície (estil de l'Oriol)

- Tot en **català**, textos breus i inclusius; cap text obsolet.
- Lletra i botons grans (≥ 44 px), contrast alt, **tema clar i fosc** amb variables CSS, opció per a **daltònics** (no dependre només del color: cada persona té color **i** inicial/icona).
- **No atabalar**: primer el que serveix per decidir; la resta a un toc.
- Accions destructives amb **confirmació lliscant**, mai un simple botó.
- Menú de configuració estil WhatsApp (⋮, seccions que entren de dreta a esquerra).
- Res obre un navegador extern.
- Feedback immediat de cada acció.

## Manera de treballar

- Una fase per xat (vegeu `docs/xats/`). En acabar cada xat: actualitzar `docs/full-de-ruta.md` (caselles) i afegir a `docs/decisions.md` qualsevol decisió nova.
- Cada fase s'instal·la i es prova a casa (~2 setmanes) abans de començar la següent.
- Respostes directes i concises. Avisar de les decisions de disseny amb una recomanació. Explicar els canvis visibles amb un abans/després breu.
- Commits petits, missatges en català.
- Fora d'abast: remuneracions, estalvi, despeses, punts, rànquings, bancs, botigues d'apps.
