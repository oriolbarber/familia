// =============================================================
// Família · capa de dades
//
// Agenda: Google Calendar via l'Edge Function «calendar».
//   En MODE PROVA (sense Supabase configurat) es fa servir una agenda
//   d'exemple desada en aquest navegador.
// Tasques, compra, desitjos, préstecs i historial de permisos:
//   de moment es desen en aquest navegador (localStorage). Quan hi hagi
//   Supabase (xat 02), només caldrà canviar les funcions de la secció
//   «Col·leccions»; la interfície no canvia.
// =============================================================
"use strict";

(function () {
  const C = window.CONFIG;
  const MODE_PROVA = !C.FUNCIONS_URL || C.FUNCIONS_URL.includes("EL-TEU-PROJECTE");
  const DIA = 864e5;

  // ---------- Emmagatzematge local segur ----------
  const local = {
    llegeix(k, defecte = null) {
      try { const v = localStorage.getItem(k); return v === null ? defecte : JSON.parse(v); }
      catch { return defecte; }
    },
    escriu(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    esborra(k) { try { localStorage.removeItem(k); } catch { /* res */ } },
  };

  const nouId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const isoDia = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  };

  // ---------- Crides a les Edge Functions ----------
  async function crida(funcio, { metode = "GET", query = "", cos } = {}) {
    const r = await fetch(`${C.FUNCIONS_URL}/${funcio}${query}`, {
      method: metode,
      headers: { "Content-Type": "application/json", "x-familia-codi": local.llegeix("codi", "") },
      body: cos ? JSON.stringify(cos) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401) {
      local.esborra("codi");
      const e = new Error("Codi familiar incorrecte");
      e.codi = 401;
      throw e;
    }
    if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`);
    return d;
  }

  // =============================================================
  // Dades d'exemple (mode prova)
  // =============================================================
  function llavor() {
    if (local.llegeix("prova:llavor-v2")) return;
    const avui = new Date(); avui.setHours(0, 0, 0, 0);
    const a = (dies, h, m = 0) => { const d = new Date(avui.getTime() + dies * DIA); d.setHours(h, m, 0, 0); return d.toISOString(); };
    const dl = (avui.getDay() + 6) % 7; // 0 = dilluns
    const dsDies = 5 - dl; // dies fins al dissabte d'aquesta setmana
    const [ad1, ad2, j1, j2] = C.MEMBRES.map((m) => m.id);

    const esdevs = [
      { titol: "Partit de bàsquet", inici: a(0, 10), fi: a(0, 11, 30), persona: j2, lloc: "Pavelló municipal" },
      { titol: "Dinar a cal avi i l'àvia", inici: a(0, 14), fi: a(0, 16), persona: null },
      { titol: "Ioga", inici: a(0, 19, 30), fi: a(0, 20, 30), persona: ad2 },
      { titol: "Dentista", inici: a(1, 9), fi: a(1, 10), persona: j1 },
      { titol: "Reunió de feina", inici: a(1, 15), fi: a(1, 17), persona: ad1 },
      { titol: "Anglès", inici: a(2, 17, 30), fi: a(2, 19), persona: j2 },
      { titol: "Entrenament", inici: a(-1, 18), fi: a(-1, 19, 30), persona: j2 },
      { titol: "Reunió de l'escola", inici: a(3, 18), fi: a(3, 19), persona: ad1 },
      { titol: "Sopar amb amics", inici: a(-2, 21), fi: a(-2, 23, 30), persona: ad2 },
      { titol: "Revetlla del barri", inici: isoDia(avui.getTime() + 6 * DIA), fi: isoDia(avui.getTime() + 7 * DIA), totElDia: true, persona: null },
      {
        titol: "Dormir a casa d'una amiga", inici: a(dsDies >= 0 ? dsDies : 6, 21), fi: a((dsDies >= 0 ? dsDies : 6) + 1, 12),
        persona: j1, permis: { tipus: "dormir", estat: "pendent" }, nota: "És l'aniversari, hi anem quatre.",
      },
      { titol: "Concert de l'escola", inici: a(9, 19), fi: a(9, 21), persona: j1 },
      { titol: "Revisió del cotxe", inici: a(12, 8, 30), fi: a(12, 9, 30), persona: ad1 },
    ].map((e) => ({ id: nouId(), totElDia: false, lloc: null, nota: null, permis: null, ...e }));
    local.escriu("prova:esdeveniments", esdevs);

    const fa = (dies) => new Date(Date.now() - dies * DIA).toISOString();
    local.escriu("col:tasques", [
      { id: nouId(), nom: "Netejar el bany", tipus: "recurrent", cada: 7, creada: fa(30), fetes: [{ persona: ad2, quan: fa(9) }] },
      { id: nouId(), nom: "Baixar el reciclatge", tipus: "recurrent", cada: 3, creada: fa(30), fetes: [{ persona: j1, quan: fa(4) }], agafada: { persona: j2, dia: isoDia(new Date()) } },
      { id: nouId(), nom: "Posar rentadores", tipus: "recurrent", cada: 3, creada: fa(30), fetes: [{ persona: ad1, quan: fa(1) }] },
      { id: nouId(), nom: "Passar l'aspiradora", tipus: "recurrent", cada: 5, creada: fa(30), fetes: [{ persona: j2, quan: fa(3) }] },
      { id: nouId(), nom: "Canviar llençols", tipus: "recurrent", cada: 14, creada: fa(30), fetes: [{ persona: ad1, quan: fa(5) }] },
      { id: nouId(), nom: "Pagar la quota de l'AMPA", tipus: "puntual", limit: isoDia(Date.now() + 8 * DIA), creada: fa(2), fetes: [], assignada: { persona: ad1, estat: "acceptada", per: ad2, quan: fa(2) } },
      { id: nouId(), nom: "Treure el gos al vespre", tipus: "recurrent", cada: 1, creada: fa(20), fetes: [{ persona: j1, quan: fa(0) }], assignada: { persona: j1, estat: "acceptada", per: j1, quan: fa(20) } },
      { id: nouId(), nom: "Regar les plantes", tipus: "recurrent", cada: 4, creada: fa(1), fetes: [], activa: false, assignada: { persona: ad1, estat: "proposta", per: ad2, quan: fa(1), nota: "Aquesta setmana no hi arribo" } },
      { id: nouId(), nom: "Ordenar l'armari de l'entrada", tipus: "puntual", limit: isoDia(Date.now() + 10 * DIA), creada: fa(1), fetes: [], activa: false, assignada: { persona: j2, estat: "proposta", per: ad1, quan: fa(1) } },
    ]);
    local.escriu("col:compra", ["Pomes|1 kg", "Enciam|", "Plàtans|6", "Llet|6", "Iogurts naturals|8", "Detergent rentadora|"]
      .map((s) => { const [nom, q] = s.split("|"); return { id: nouId(), nom, quantitat: q, comprat: false, quan: fa(1) }; }));
    local.escriu("col:desitjos", [
      { id: nouId(), persona: ad1, nom: "Auriculars sense fil", preu: 60, prioritat: "molt", enllac: "" },
      { id: nouId(), persona: ad1, nom: "Llibre de cuina", preu: 25, prioritat: "poc", enllac: "" },
      { id: nouId(), persona: j1, nom: "Samarreta de l'equip", preu: 30, prioritat: "bastant", enllac: "" },
    ]);
    local.escriu("col:prestecs", [
      { id: nouId(), de: j1, a: ad1, import: 20, data: isoDia(Date.now() - 5 * DIA), estat: "actiu", per: j1, nota: "Per a l'aparcament" },
      { id: nouId(), de: ad1, a: j2, import: 10, data: isoDia(Date.now() - 1 * DIA), estat: "proposat", per: j2, nota: "Entrades del cine" },
      { id: nouId(), de: ad2, a: ad1, import: 15, data: isoDia(Date.now() - 12 * DIA), estat: "retorn", per: ad2, retornPer: ad2, nota: "Mercat" },
    ]);
    local.escriu("col:historial", [
      { id: nouId(), titol: "Tornar a les 00:30", persona: j2, tipus: "tard", estat: "confirmat", qui: ad2, quan: fa(8), comentari: "" },
    ]);
    local.escriu("prova:llavor-v2", true);
  }

  // =============================================================
  // Agenda
  // =============================================================
  const Agenda = {
    // Retorna { llista, desada: bool, error } per a l'interval [des, fins)
    async interval(des, fins) {
      const clau = `agenda:${isoDia(des)}:${isoDia(fins)}`;
      if (MODE_PROVA) {
        llavor();
        const tots = local.llegeix("prova:esdeveniments", []);
        const llista = tots.filter((e) => new Date(fiReal(e)) > des && new Date(iniReal(e)) < fins)
          .sort((x, y) => new Date(iniReal(x)) - new Date(iniReal(y)));
        return { llista, desada: false };
      }
      try {
        const d = await crida("calendar", { query: `?des=${des.toISOString()}&fins=${fins.toISOString()}` });
        local.escriu(clau, { llista: d.esdeveniments, quan: Date.now() });
        return { llista: d.esdeveniments, desada: false };
      } catch (e) {
        const desat = local.llegeix(clau);
        if (e.codi === 401) throw e;
        return { llista: desat?.llista ?? [], desada: !!desat, quan: desat?.quan, error: e.message };
      }
    },

    async crea(e) {
      if (MODE_PROVA) {
        const tots = local.llegeix("prova:esdeveniments", []);
        const nou = { id: nouId(), lloc: null, nota: null, permis: null, ...e };
        tots.push(nou);
        local.escriu("prova:esdeveniments", tots);
        return nou;
      }
      const d = await crida("calendar", { metode: "POST", cos: e });
      return d.esdeveniment;
    },

    async decideixPermis(id, { estat, qui, comentari }) {
      if (MODE_PROVA) {
        const tots = local.llegeix("prova:esdeveniments", []);
        const e = tots.find((x) => x.id === id);
        if (e?.permis) Object.assign(e.permis, { estat, qui, comentari });
        local.escriu("prova:esdeveniments", tots);
        return e;
      }
      const d = await crida("calendar", { metode: "PATCH", query: `?id=${encodeURIComponent(id)}`, cos: { permis_estat: estat, permis_qui: qui, permis_comentari: comentari } });
      return d.esdeveniment;
    },

    async esborra(id) {
      if (MODE_PROVA) {
        local.escriu("prova:esdeveniments", local.llegeix("prova:esdeveniments", []).filter((x) => x.id !== id));
        return;
      }
      await crida("calendar", { metode: "DELETE", query: `?id=${encodeURIComponent(id)}` });
    },
  };

  // Les dates «tot el dia» són 'AAAA-MM-DD' (fi exclosa, com a Google).
  function iniReal(e) { return e.totElDia ? e.inici + "T00:00" : e.inici; }
  function fiReal(e) { return e.totElDia ? e.fi + "T00:00" : e.fi; }

  // =============================================================
  // Col·leccions (de moment, en aquest navegador)
  // =============================================================
  const COLS = ["tasques", "compra", "desitjos", "prestecs", "historial"];
  const Col = {
    llista(col) { if (MODE_PROVA) llavor(); return local.llegeix(`col:${col}`, []); },
    desa(col, items) { local.escriu(`col:${col}`, items); },
    afegeix(col, item) { const l = Col.llista(col); const nou = { id: nouId(), ...item }; l.push(nou); Col.desa(col, l); return nou; },
    actualitza(col, id, fn) { const l = Col.llista(col); const x = l.find((i) => i.id === id); if (x) fn(x); Col.desa(col, l); return x; },
    esborra(col, id) { Col.desa(col, Col.llista(col).filter((i) => i.id !== id)); },
    exporta() {
      const d = { versio: 1, exportat: new Date().toISOString() };
      for (const c of COLS) d[c] = Col.llista(c);
      if (MODE_PROVA) d.agendaProva = local.llegeix("prova:esdeveniments", []);
      return d;
    },
    importa(d) {
      if (!d || d.versio !== 1) throw new Error("Fitxer no vàlid");
      for (const c of COLS) if (Array.isArray(d[c])) Col.desa(c, d[c]);
      if (MODE_PROVA && Array.isArray(d.agendaProva)) local.escriu("prova:esdeveniments", d.agendaProva);
    },
    reinicia() {
      for (const c of COLS) local.esborra(`col:${c}`);
      local.esborra("prova:esdeveniments");
      local.esborra("prova:llavor-v2");
    },
  };

  window.Dades = { MODE_PROVA, local, crida, Agenda, Col, isoDia, iniReal, fiReal, DIA };
})();
