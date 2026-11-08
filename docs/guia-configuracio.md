# Guia de configuració · Prova de concepte

Tot es fa des del navegador de l'ordinador; no cal instal·lar res. Temps aproximat: 45 minuts.

Al final tindràs:
- un **codi familiar** (una contrasenya que inventes tu),
- la **URL de les funcions** de Supabase,
- la **clau pública VAPID**,

i la PWA publicada a `https://oriolbarber.github.io/familia/`.

---

## 1 · Calendari de la família ("GLOB")

Fem servir el calendari compartit que ja teniu, **GLOB**. No cal crear-ne cap de nou.

1. A [calendar.google.com](https://calendar.google.com), a la llista de l'esquerra, passa per sobre de **GLOB** → ⋮ → **Configuració i ús compartit**.
2. Baixa fins a **Integra el calendari → ID del calendari** (acaba en `@group.calendar.google.com`). Copia'l: és `GOOGLE_CALENDAR_ID`.
3. Apunta el correu de Google de cada membre: serviran per al secret `MEMBRES_CORREUS` (pas 5), perquè l'app sàpiga de qui és cada esdeveniment creat directament a Google.

> L'app veurà **tots** els esdeveniments de GLOB. Els que es creen des de l'app porten la persona a dins; els creats a Google es reconeixen pel correu de qui els ha creat. Si no se sap de qui és, surt com a "Tothom".

## 2 · Compte de servei (Google Cloud)

1. A [console.cloud.google.com](https://console.cloud.google.com) crea un projecte nou: `gestio-familiar`.
2. **APIs i serveis → Biblioteca → Google Calendar API → Habilita**.
3. **IAM i administració → Comptes de servei → Crea un compte de servei**. Nom: `familia-app`. No li cal cap rol. Desa'l.
4. Entra al compte → **Claus → Afegeix una clau → Crea una clau nova → JSON**. Es descarrega un fitxer `.json`. **És secret**: no el pugis mai al repositori ni l'enviïs per xat.
5. Copia l'adreça del compte de servei (`familia-app@gestio-familiar.iam.gserviceaccount.com`).
6. Torna a Google Calendar → configuració de **GLOB** → *Comparteix amb persones concretes* → afegeix aquesta adreça amb el permís **Fer canvis als esdeveniments**. Ho ha de fer qui sigui propietari de GLOB.

> Si el pas 4 diu que la creació de claus està desactivada per una política de l'organització, és perquè el compte de Google és d'empresa o d'escola. Fes servir un compte personal (@gmail.com).

> No cal configurar cap "pantalla de consentiment OAuth": el compte de servei no en necessita.

## 3 · Projecte Supabase

1. A [supabase.com](https://supabase.com) crea un projecte (pla gratuït, regió Europa).
2. **SQL Editor → New query**: enganxa el contingut de `supabase/migrations/0001_prova_push.sql` i executa'l.
3. **Project Settings → API**: copia la *Project URL* (`https://xxxx.supabase.co`).

## 4 · Claus VAPID (per als avisos)

1. Obre `app/eines/vapid.html` al navegador (doble clic al fitxer, o un cop publicada: `https://oriolbarber.github.io/familia/eines/vapid.html`).
2. Toca **Genera**. Copia les dues caixes:
   - la primera (JSON llarg) → secret `VAPID_KEYS` a Supabase,
   - la segona (text curt) → `VAPID_PUBLICA` a `app/config.js`.

Fes-ho només una vegada.

## 5 · Secrets de les funcions (Supabase)

**Edge Functions → Secrets → Add new secret**:

| Nom | Valor |
|---|---|
| `GOOGLE_SA_JSON` | Tot el contingut del fitxer JSON del pas 2.4 (obre'l amb un editor de text i copia-ho tot) |
| `GOOGLE_CALENDAR_ID` | L'ID de GLOB (pas 1.2) |
| `MEMBRES_CORREUS` | `{"correu1@gmail.com":"oriol","correu2@gmail.com":"adult2","correu3@gmail.com":"jove1","correu4@gmail.com":"jove2"}` amb els correus reals i els `id` de `app/config.js` |
| `FAMILIA_CODI` | Una contrasenya que inventes (mínim 12 caràcters). És la que escriurà cada membre la primera vegada |
| `VAPID_KEYS` | El JSON del pas 4 |
| `VAPID_CONTACT` | `mailto:` + el teu correu |

## 6 · Desplegar les funcions

**Edge Functions → Deploy a new function → Via Editor**, dues vegades:

1. Nom `calendar`: enganxa `supabase/functions/calendar/index.ts` → **Deploy**.
2. Nom `push-prova`: enganxa `supabase/functions/push-prova/index.ts` → **Deploy**.

A cada funció, a **Details**, **desactiva "Enforce JWT verification"** (verify JWT). La protecció és el codi familiar fins que la Fase A afegeixi l'inici de sessió.

Comprovació ràpida (opcional, des d'un terminal):

```bash
curl -H "x-familia-codi: EL_TEU_CODI" https://xxxx.supabase.co/functions/v1/calendar
```

Ha de tornar `{"esdeveniments":[…]}`.

## 7 · Configurar i publicar la PWA (GitHub Pages)

1. Edita `app/config.js`:
   - `FUNCIONS_URL`: `https://xxxx.supabase.co/functions/v1`
   - `VAPID_PUBLICA`: la clau curta del pas 4
   - `MEMBRES`: noms reals, rol (adult/jove), colors i inicials. **Sense correus** (el repositori és públic)
2. Fes commit i push a `oriolbarber/familia` (ja està creat). Pages en un repositori privat requereix GitHub Pro; si no en tens, fes-lo públic: no conté cap secret.
3. Al repositori: **Settings → Pages → Source: GitHub Actions**. El flux `.github/workflows/pages.yml` publica la carpeta `app/` a cada canvi.
4. URL final: `https://oriolbarber.github.io/familia/`.

## 8 · Prova als quatre mòbils

A cada mòbil:

1. Obre la URL.
   - **iPhone (Safari):** *Compartir → Afegeix a la pantalla d'inici*, i obre l'app des de la icona. Sense això no hi ha avisos.
   - **Android (Chrome):** *⋮ → Instal·la l'aplicació*.
2. Escriu el codi familiar i tria qui ets.
3. Comprova que l'Agenda mostra els esdeveniments de GLOB (vistes Dia, Setmana i Mes).
4. **Agenda → Nou** → crea un esdeveniment de prova i comprova que surt a Google Calendar (GLOB). Esborra'l des del detall, lliscant.
5. **⋮ → Avisos → Activa els avisos** → accepta el permís → **Envia'm una prova**. Ha d'arribar una notificació.
6. Al mateix lloc, obre **Diagnòstic** i apunta les dades a la taula de `docs/decisions.md` (secció "Resultats de la prova de concepte").
