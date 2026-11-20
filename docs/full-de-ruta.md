# Full de ruta

Cada etapa és **un xat** (prompt a `docs/xats/`). No es comença la següent fins que l'anterior està provada a casa.

## 0 · Preguntes obertes (Oriol, fora de l'app)

- [ ] Els fills tenen compte de Google propi? (menys de 13 anys → Family Link)
- [ ] Versió d'iOS dels iPhone (cal ≥ 16.4 per als avisos)
- [ ] Préstecs: visibles només per implicats + pares, o per tothom?
- [ ] Import a partir del qual una activitat amb cost demana autorització
- [ ] Llista inicial de tasques recurrents i interval màxim de cadascuna
- [ ] Hora del resum del matí; també caps de setmana?
- [x] Repositori a GitHub creat (`oriolbarber/familia`)
- [x] Projecte Supabase creat (pla gratuït)

## 1 · Prova de concepte — `xats/01-prova-de-concepte.md`

- [x] Confirmar a la documentació que el compte de servei pot llegir/escriure el calendari "Família" sense caducar
- [x] Codi: Edge Functions `calendar` i `push-prova`, PWA mínima, eina VAPID, publicació a Pages (`docs/guia-configuracio.md`)
- [ ] Configuració real de Google, Supabase i GitHub (Oriol, seguint la guia)
- [ ] Llegeix i escriu els esdeveniments de la setmana als 4 mòbils
- [ ] Push de prova rebut als 4 mòbils (o pla B per correu)
- **Sortida:** decisió confirmada (o canvi) a `decisions.md`

## 1b · Dissenys i primer muntatge (fet el 8 de novembre)

- [x] Llenç de dissenys i comentaris de l'Oriol
- [x] App navegable amb totes les seccions (Inici, Agenda dia/setmana/mes, permisos, tasques, compra, desitjos, préstecs, menú ⋮)
- [x] Mode prova amb dades d'exemple; mode connectat amb GLOB via `calendar`
- [x] Noms reals de la família a `config.js` (Oriol, Laura, Bruna, Gael)
- [x] `config.js` apunta al Supabase real (`rxuchoduwgxatnxqjysf`)
- [ ] Provar el mode connectat amb GLOB als mòbils (cal la funció `calendar` actualitzada)
- [x] De qui és cada esdeveniment de GLOB: pel nom al títol (revisat amb els esdeveniments reals fins al gener)
- [ ] Confirmar el llindar de cost (ara 20 €)

## 2 · Model de dades — `xats/02-model-de-dades.md`

- [ ] Esquema: membres, autoritzacions, tasques, execucions, llistes, ítems, desitjos, préstecs, subscripcions push
- [ ] RLS per rol (pare/mare vs fill) i per préstecs
- [ ] Llavor (seed) amb els 4 membres i les tasques inicials

## 3 · Fase A · Base — `xats/03-fase-a-base.md`

- [ ] Login (Supabase Auth), perfil, color i inicial per persona
- [ ] Inici + agenda setmanal amb filtres per persona
- [ ] Crear/editar esdeveniments (escriu a Google)
- [ ] Autoritzacions: Pendent / Confirmat / No autoritzat, historial
- [ ] Aspecte: tema clar/fosc, mida de lletra, daltònics
- [ ] Sense connexió (lectura)
- [ ] Prova a casa 2 setmanes

## 4 · Fase B · Tasques — `xats/04-fase-b-tasques.md`

- [ ] Recurrents i puntuals, "fa X dies", endarrerides primer
- [ ] "Me la quedo" (per al dia) i "Feta"
- [ ] Historial visible per a tothom
- [ ] Prova a casa 2 setmanes

## 5 · Fase C · Compra — `xats/05-fase-c-compra.md`

- [ ] Llista comuna amb categories, quantitat, comprat
- [ ] Llistes addicionals
- [ ] Canvis sense connexió que es sincronitzen
- [ ] Prova a casa 2 setmanes

## 6 · Fase D · Desitjos i préstecs — `xats/06-fase-d-desitjos-prestecs.md`

- [ ] Desitjos personals (nom, imatge/enllaç, preu, prioritat)
- [ ] Préstecs amb visibilitat restringida
- [ ] Prova a casa 2 setmanes

## 7 · Fase E · Resum diari — `xats/07-fase-e-resum-diari.md`

- [ ] Tasca programada + Edge Function de resum per persona
- [ ] Push web; pla B per correu
- [ ] Prova a casa 2 setmanes

## 8 · Fase F · Assistent (avançada el 20 de novembre)

- [x] Funció `assistent` (Claude Haiku 5.5, sortida estructurada, límit diari, registre d'usos)
- [x] Pantalla «Assistent»: foto, imatges, PDF, text; propostes amb Afegeix / Edita
- [ ] Compte d'Anthropic, crèdit, límit de 2 $/mes i secret `ANTHROPIC_API_KEY` (Oriol, guia pas 9)
- [ ] Taula `assistent_usos` i desplegament de la funció (guia pas 9)
- [ ] Provar-ho amb fotos reals (circulars, WhatsApp, llistes a mà)
- [x] Registre de decisions (acceptat / editat / descartat) i exportació des de l'app
- [ ] Taula `assistent_decisions` (guia pas 9) i redesplegar la funció `assistent`
- [ ] Primera revisió del context amb el xat 08, al cap d'un mes d'ús
- [ ] Més endavant: compartir des de la galeria a Android (Web Share Target)
