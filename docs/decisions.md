# Registre de decisions

Format: data · decisió · motiu · estat (vigent / pendent de confirmar / substituïda).

| Data | Decisió | Motiu | Estat |
|---|---|---|---|
| 2026-11-02 | Google Calendar és la font única de l'agenda | Es veu des de Google encara que l'app falli | Vigent |
| 2026-11-08 | El calendari és **GLOB**, el compartit que ja fa servir la família | No cal canviar d'hàbits ni migrar res | Vigent |
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
| 2026-11-08 | Dissenys: Inici «què toca ara» (proposta B); Agenda amb vistes Dia, Setmana (horari) i Mes; filtre per defecte «El meu» (meu + família) | Comentaris de l'Oriol al llenç de dissenys | Vigent |
| 2026-11-08 | Compra: una sola llista, sense categories | Comentari de l'Oriol | Vigent |
| 2026-11-08 | «Ara no» en un permís treu l'esdeveniment del calendari amb confirmació lliscant | És destructiu | Vigent |
| 2026-11-08 | Llindar de cost per demanar permís: 20 € (configurable a `config.js`) | Valor provisional, pendent de confirmar | Provisional |
| 2026-11-08 | L'estat del permís es desa a l'esdeveniment de Google (propietats privades + «[Pendent]» al títol) | Funciona sense Supabase; el registre complet anirà a Supabase | Vigent |
| 2026-11-08 | De qui és un esdeveniment creat a Google: pel correu del creador (secret `MEMBRES_CORREUS`) | Els correus no poden anar al repositori públic | Vigent |
| 2026-11-08 | **Mode prova**: sense Supabase configurat, l'app funciona amb dades d'exemple | Es pot provar i ensenyar a la família abans de configurar res | Vigent |
| 2026-11-08 | Tasques, compra, desitjos, préstecs i historial de permisos es desen **de moment en cada mòbil**; es compartiran amb Supabase (xat 02) | Primer muntatge usable sense esperar el backend | Provisional |
| 2026-11-08 | Lletra Atkinson Hyperlegible inclosa a l'app (sense dependències externes) | Llegibilitat i funcionament sense connexió | Vigent |
| 2026-11-08 | Tasques: filtres com a l'Agenda (per defecte «Les meves» = meves + lliures; també Tothom, Lliures i per persona) | Comentari de l'Oriol | Vigent |
| 2026-11-08 | Tasques: es poden proposar a una altra persona; una tasca nova proposada **no és activa fins que s'accepta**. Si la rebutja, qui la va proposar la pot deixar lliure o proposar-la a algú altre | Comentari de l'Oriol; principi «facilitar acords» | Vigent |
| 2026-11-08 | Préstecs: les dues persones han d'estar d'acord per crear-lo i per donar-lo per retornat. Els adults els veuen però no poden confirmar per altres | Comentari de l'Oriol | Vigent |
| 2026-11-08 | Punts vermells amb número a la barra inferior i a les seccions quan tens alguna cosa per respondre | Comentari de l'Oriol; el número fa que no depengui només del color | Vigent |
| 2026-11-20 | Membres: Oriol (`oriol`, adult), Laura (`laura`, adulta), Bruna (`bruna`, jove), Gael (`gael`, jove). Inicials O, L, B, G i colors blau, taronja, verd blau i lila | Noms reals; els `id` han de coincidir amb `MEMBRES_CORREUS` | Vigent |
| 2026-11-20 | L'app publicada va en mode connectat (`FUNCIONS_URL` del Supabase real). El mode prova queda per a quan la URL és buida o la de plantilla | Començar a fer servir GLOB | Vigent |
| 2026-11-20 | En mode connectat, l'app esborra un sol cop les dades d'exemple que quedin al mòbil (tasques, compra, desitjos, préstecs, historial). L'agenda no es toca: ve de GLOB | Començar de zero amb dades reals | Vigent |
| 2026-11-20 | Assistent dins l'app amb **Claude Haiku 5.5** (funció `assistent`): llegeix fotos, captures, PDF i text i retorna propostes; **mai escriu res sense confirmació** | Cost molt baix (~0,15 €/mes); el model és configurable amb `ASSISTENT_MODEL` | Vigent |
| 2026-11-20 | Àudio: dictat amb el micròfon del teclat del mòbil (l'API no rep àudio) | Gratuït i funciona a Android i iPhone | Vigent |
| 2026-11-20 | Límit de 20 consultes per persona cada 24 h + límit de despesa de 2 $/mes a la consola d'Anthropic | Evitar sorpreses de cost | Vigent |
| 2026-11-20 | Els joves revisen cada esdeveniment proposat al formulari (amb el selector de permís); els adults el poden afegir directament | Mantenir el circuit de permisos | Vigent |
| 2026-11-20 | Les fotos es redueixen a 1.600 px i JPEG al mòbil abans d'enviar-les; no es desen enlloc | Menys cost i més privacitat | Vigent |

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
