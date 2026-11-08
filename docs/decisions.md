# Registre de decisions

Format: data · decisió · motiu · estat (vigent / pendent de confirmar / substituïda).

| Data | Decisió | Motiu | Estat |
|---|---|---|---|
| 2026-11-02 | Google Calendar ("Família") és la font única de l'agenda | Es veu des de Google encara que l'app falli | Vigent |
| 2026-11-02 | Accés a Google amb compte de servei des d'Edge Function; login amb Supabase Auth | Evitar la verificació OAuth i la caducitat en mode de proves | Confirmat en teoria (xat 01); falta la prova real |
| 2026-11-02 | Autoritzacions només per dormir fora, tornar tard i cost; n'hi ha prou amb un pare/mare | Mínim control necessari | Vigent |
| 2026-11-02 | Tasques lliures, sense assignació ni punts | Principi "facilitar acords" | Vigent |
| 2026-11-02 | HTML/CSS/JS sense framework + Supabase | Menys capes, manera habitual de treballar | Vigent |
| 2026-11-07 | Allotjament a GitHub Pages (no Vercel) | Cost zero i criteri habitual | Vigent |
| 2026-11-07 | L'app es divideix en uns quants fitxers (`index.html`, `sw.js`, `manifest`, mòduls JS) en lloc d'un sol fitxer | El service worker i el manifest han de ser fitxers separats; facilita treballar per fases | Vigent |
| 2026-11-07 | Cada persona s'identifica amb color **i** inicial | Accessibilitat per a daltònics | Vigent |
| 2026-11-07 | Esdeveniments **sense convidats** (`attendees`); la persona va a `extendedProperties.private.persona` | Un compte de servei no pot convidar persones sense delegació de domini (Workspace) | Vigent |
| 2026-11-07 | Push amb `jsr:@negrel/webpush` | Biblioteca feta amb Web Crypto, funciona a Deno; `npm:web-push` depèn de Node | Vigent |
| 2026-11-07 | Fins a la Fase A, les funcions es protegeixen amb un **codi familiar** (capçalera `x-familia-codi`) i sense verificació JWT | Prova de concepte sense inici de sessió; la Fase A ho substitueix per Supabase Auth | Provisional |
| 2026-11-07 | Funcions desplegables des de l'editor web de Supabase (un sol fitxer per funció) | No cal instal·lar la CLI | Vigent |

## Per què el compte de servei (xat 01)

- **OAuth en mode "Testing":** els testimonis de refresc caduquen als 7 dies. Per evitar-ho cal publicar l'app i, amb permisos de calendari (sensibles), passar la verificació de Google.
- **Compte de servei:** no té pantalla de consentiment ni verificació. La clau JSON no caduca si l'organització no ho imposa, i amb un compte @gmail.com no hi ha cap política que ho faci. N'hi ha prou de compartir el calendari amb l'adreça del compte de servei ("Fer canvis als esdeveniments").
- **Limitació:** no pot afegir convidats. No ens afecta, perquè tota la família veu el calendari compartit.
- **Pla B, si la prova real falla:** OAuth amb l'app publicada "In production" i un sol compte (el de l'Oriol). Cal verificació de Google, però és un tràmit per a ús personal.

## Resultats de la prova de concepte

| Mòbil | Sistema | Instal·lada | Agenda llegida | Escriptura | Push | Notes |
|---|---|---|---|---|---|---|
| Oriol | | | | | | |
| Adult 2 | | | | | | |
| Jove 1 | | | | | | |
| Jove 2 | | | | | | |

Si el push falla en algun mòbil, la Fase E fa servir el pla B (correu) per a aquella persona.
