# App de gestió familiar · Proposta v2

2 de novembre de 2026 · Oriol Barber

## Resum

Una PWA privada per a quatre persones (dos pares i dos fills de 12 a 17 anys) que concentra l'agenda familiar, les tasques de casa i la llista de la compra. L'agenda viu a Google Calendar; l'app hi afegeix les autoritzacions, les tasques i el resum diari.

**Principi de disseny:** facilitar acords, no controlar. Per això no hi ha punts, rànquings ni remuneracions, i les tasques s'agafen lliurement.

## Decisions preses

| Tema | Proposta v1 | Proposta v2 |
|---|---|---|
| Usuaris | Quatre membres, sense detall | 2 pares + 2 fills de 12–17 anys, cadascú amb mòbil propi |
| Autoritzacions | "Quan correspongui" | Només dormir fora / tornar tard i activitats amb cost; n'hi ha prou amb un dels pares |
| Calendari | Calendari propi a Supabase | Calendari compartit de Google com a font única de l'agenda |
| Tasques | Rotació, assignació o dies fixos | Cadascú n'agafa lliurement; l'app avisa quan se supera l'interval |
| Motivació | No definit | Cap element de joc: només registre |
| Economia | Remuneracions, estalvi, préstecs, despeses | Només préstecs puntuals |
| Avisos | No definit | Un resum diari al matí |
| Tecnologia | React + Tailwind + Supabase + Vercel | HTML/JS sense framework + Supabase |
| Dispositius | Android i iOS | Barreja confirmada: cal provar la PWA als quatre mòbils |

## Abast de la v1, per fases

La v1 inclou tots els mòduls, però es construeix en fases. Cada fase s'instal·la i es prova a casa abans de començar la següent.

1. **Fase A · Base:** usuaris, Inici i agenda connectada a Google Calendar, amb autoritzacions.
2. **Fase B · Tasques:** tasques recurrents i puntuals, comptador "fa X dies" i historial.
3. **Fase C · Compra:** llista comuna amb categories i llistes addicionals.
4. **Fase D · Desitjos i préstecs:** llista de desitjos personal i registre de préstecs.
5. **Fase E · Resum diari:** avís al matí a tots els mòbils.

## Agenda i autoritzacions

L'agenda és un calendari compartit de Google ("Família"). L'app el llegeix i hi escriu; així es veu també des de Google Calendar i des de qualsevol mòbil, encara que l'app falli.

- **Connexió proposada:** un compte de servei de Google amb accés al calendari "Família", cridat des de Supabase (Edge Function). Els usuaris entren a l'app amb Supabase Auth, no amb Google. Així s'evita la verificació OAuth de Google, que en mode de proves fa caducar l'accés cada pocs dies (cal confirmar-ho abans de construir).
- **Qui és qui:** cada esdeveniment porta la persona com a propietat interna i es pinta amb el seu color. Filtres per persona a la vista setmanal.
- **Autoritzacions:** quan un fill crea una activitat de dormir fora, tornar tard o amb cost, queda en estat *Pendent*. L'estat es desa a Supabase lligat a l'esdeveniment, i al calendari es marca al títol (per exemple "[Pendent] Sortida").
- **Estats:** Confirmat · Pendent · No autoritzat. N'hi ha prou que l'aprovi un dels pares; l'altre en veu el registre.
- **Rebutjades:** una activitat no autoritzada desapareix del calendari però queda a l'historial de l'app, amb un comentari opcional.

## Tasques

Les tasques no s'assignen per defecte: cadascú n'agafa les que vol. L'app fa visible què s'està descuidant, sense dir a ningú què ha de fer.

| Camp | Funcionament |
|---|---|
| Tipus | Recurrent (cada X dies) o puntual (amb data límit) |
| Interval màxim | Només recurrents: a partir d'aquí la tasca passa a "endarrerida" |
| Agafar | Qualsevol membre pot marcar "me la quedo" per al dia; si no la fa, torna a quedar lliure |
| Fer | En marcar-la feta es desa qui i quan, i es reinicia el comptador |
| Historial | Llista de qui ha fet cada tasca, visible per a tothom |

A l'Inici, les tasques endarrerides surten primer, ordenades per quant han superat l'interval.

## Llistes i préstecs

- **Compra:** llista comuna, amb producte, quantitat i categoria; es marca com a comprat. Llistes addicionals (ferreteria, casa).
- **Desitjos:** llista personal amb nom, imatge o enllaç, preu aproximat i prioritat. Sense seguiment d'estalvi.
- **Préstecs:** qui deixa, a qui, import, data i estat (pendent / retornat). Només els veuen les dues persones implicades i els pares.

## Avisos

Un sol avís al matí per persona: activitats del dia, tasques endarrerides i, per als pares, autoritzacions pendents.

- **Push web** des de Supabase amb una tasca programada. A l'iPhone només funciona si l'app està instal·lada a la pantalla d'inici i el sistema és iOS 16.4 o posterior.
- **Pla B:** si el push falla en algun mòbil, el resum s'envia per correu.

## Tecnologia

HTML, CSS i JavaScript sense framework, amb Supabase per a dades, usuaris i tasques programades.

| Peça | Proposta | Funció |
|---|---|---|
| Interfície | HTML/CSS/JS, mòbil primer | Pantalles de l'app |
| Dades i usuaris | Supabase (Postgres + Auth) | Tasques, llistes, préstecs, estats d'autorització |
| Agenda | Google Calendar API via compte de servei | Esdeveniments familiars |
| Lògica de servidor | Supabase Edge Functions + tasca programada | Connexió amb Google i resum del matí |
| Allotjament | GitHub Pages o Vercel | Publicar la PWA (cal HTTPS) |
| Instal·lació | Manifest + service worker | Pantalla d'inici i funcionament bàsic sense connexió |

Sense connexió: l'app mostra l'última versió desada de l'agenda, les tasques i la compra; els canvis s'envien en recuperar la xarxa.

## Fora d'abast

Remuneracions per tasques, seguiment d'estalvi, registre de despeses, punts o rànquings, connexions bancàries i publicació a Google Play o App Store.
