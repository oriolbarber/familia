# Xat 08 · Revisió de l'assistent (cada 1–2 mesos)

Llegeix primer `CLAUDE.md` i `docs/decisions.md`. **En aquest xat no es toca el codi**: només es revisa el context de l'assistent.

## Què et porto

1. El fitxer `assistent-aprenentatge-AAAA-MM-DD.json`, descarregat de l'app (⋮ → Dades i còpia → Descarrega l'aprenentatge). Conté:
   - `decisions`: cada proposta de l'assistent i què se n'ha fet (`acceptat`, `editat` amb el resultat final a `final`, o `descartat`), amb el text de la consulta i el resum;
   - `usos`: consultes i tokens per persona;
   - `context_actual`: el text del secret `ASSISTENT_CONTEXT` que hi ha ara.
2. Si cal, canvis a la família que hagin passat (activitats noves, equips, horaris).

## Què has de fer

1. **Resum breu**: quantes propostes, percentatge d'acceptades, editades i descartades per tipus (esdeveniment, compra, tasca), i cost aproximat del període (Haiku 5.5: 0,10 $ per milió de tokens d'entrada, 0,50 $ per milió de sortida).
2. **Patrons**, amb exemples concrets del fitxer:
   - persones mal assignades (canvis a `persona`);
   - títols que sempre es reescriuen igual;
   - noms de la compra que es corregeixen (p. ex. «Pa cristal» → «Pa de vidre»);
   - coses que es descarten sovint (p. ex. partits d'altres equips, dates de votacions);
   - dades que falten a la proposta i s'afegeixen a mà (lloc, hora de fi…).
3. **Nou `ASSISTENT_CONTEXT`** complet, a punt per enganxar al secret de Supabase: màxim 3.000 caràcters, frases curtes, en català. Mantén el que funciona, afegeix el que surti dels patrons i treu el que ja no calgui. Indica què has canviat respecte a l'actual.
4. Si algun problema no es pot arreglar amb el context (per exemple, cal canviar les instruccions fixes de la funció o la pantalla), **apunta-ho com a proposta** per portar al xat de desenvolupament.

## Normes

- El fitxer i el context contenen informació personal: **no els desis al repositori** ni en cap fitxer que es pugi a GitHub.
- No proposis regles per a casos que només han passat un cop.
- Recorda'm que, després d'enganxar el context, puc esborrar les decisions antigues a Supabase (consulta al final de `supabase/migrations/0003_assistent_decisions.sql`).
