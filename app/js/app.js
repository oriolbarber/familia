// =============================================================
// Família · interfície
// Seccions: 1 Utilitats · 2 Persones · 3 Icones · 4 Dates · 5 Estructura
//           6 Inici · 7 Agenda · 8 Esdeveniments i permisos · 9 Tasques
//           10 Compra · 11 Més · 12 Menú ⋮ · 13 Entrada · 14 Accions · 15 Inici de l'app
// =============================================================
"use strict";

const C = window.CONFIG;
const { Agenda, Col, local: L, isoDia, iniReal, fiReal, DIA, MODE_PROVA } = window.Dades;

// =============================================================
// 1 · Utilitats
// =============================================================
const $ = (s, el = document) => el.querySelector(s);
class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
const raw = (s) => new Raw(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function val(v) {
  if (v == null || v === false) return "";
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(val).join("");
  return esc(v);
}
function h(str, ...vals) { let o = str[0]; vals.forEach((v, i) => { o += val(v) + str[i + 1]; }); return raw(o); }

const pref = (k, d) => L.llegeix("pref:" + k, d);
const desaPref = (k, v) => L.escriu("pref:" + k, v);

let tempsToast;
function avisa(text) {
  const t = $("#avis-flotant");
  t.textContent = text;
  t.hidden = false;
  clearTimeout(tempsToast);
  tempsToast = setTimeout(() => { t.hidden = true; }, 3200);
}

const plural = (n, u, p) => `${n} ${n === 1 ? u : p}`;
const euros = (n) => `${Number(n).toLocaleString("ca-ES", { maximumFractionDigits: 2 })} €`;

// =============================================================
// 2 · Persones
// =============================================================
let jo = pref("persona", null);
const membre = (id) => C.MEMBRES.find((m) => m.id === id);
const esAdult = (id = jo) => membre(id)?.rol === "adult";
const nom = (id) => membre(id)?.nom ?? "Tothom";
const color = (id) => membre(id)?.color ?? "#6B6760";

function inicial(id, mida = "") {
  const m = membre(id);
  if (!m) return h`<span class="inicial tothom ${mida}" title="Tothom" aria-label="Tothom">${I.familia}</span>`;
  return h`<span class="inicial ${mida}" style="background:${m.color}" title="${m.nom}" aria-label="${m.nom}">${m.inicial}</span>`;
}

// =============================================================
// 3 · Icones (traç, 24×24)
// =============================================================
const svg = (d, extra = "") => raw(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`);
const I = {
  inici: svg('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
  agenda: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  tasques: svg('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"/>'),
  compra: svg('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h12l2-8H6.2"/>'),
  mes: raw('<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'),
  menu: raw('<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>'),
  enrere: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  ant: svg('<path d="M15 6l-6 6 6 6"/>', 'stroke-width="2.4"'),
  seg: svg('<path d="M9 6l6 6-6 6"/>', 'stroke-width="2.4"'),
  mes1: svg('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2.6"'),
  rellotge: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  alerta: svg('<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'),
  ok: svg('<path d="M5 12l5 5 9-10"/>', 'stroke-width="2.6"'),
  creu: svg('<path d="M6 6l12 12M18 6L6 18"/>', 'stroke-width="2.6"'),
  canvi: svg('<path d="M7 7h11l-3-3M17 17H6l3 3"/>'),
  familia: svg('<circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M14 19c.3-2 2-3.5 4-3.5 1.7 0 3 1 3 3"/>', 'width="20" height="20"'),
  persona: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  aspecte: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
  campana: svg('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>'),
  disc: svg('<path d="M4 4h13l3 3v13H4z"/><path d="M8 4v5h8V4M8 20v-6h8v6"/>'),
  sol: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  lluna: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  sortir: svg('<path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3"/>'),
};

// =============================================================
// 4 · Dates
// =============================================================
const mitjanit = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const avui = () => mitjanit(new Date());
const sumaDies = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dilluns = (d) => sumaDies(mitjanit(d), -((new Date(d).getDay() + 6) % 7));
const mateixDia = (a, b) => isoDia(a) === isoDia(b);
const majuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmt = (o) => new Intl.DateTimeFormat("ca-ES", o);
const fHora = fmt({ hour: "2-digit", minute: "2-digit" });
const fDiaLlarg = fmt({ weekday: "long", day: "numeric", month: "long" });
const fDiaCurt = fmt({ day: "numeric", month: "short" });
const fSetmanaDia = fmt({ weekday: "short" });
const fMes = fmt({ month: "long", year: "numeric" });
const fData = fmt({ day: "numeric", month: "short", year: "numeric" });
const DIES_CURTS = ["dl", "dt", "dc", "dj", "dv", "ds", "dg"];

const dataDe = (iso) => (iso.length === 10 ? new Date(iso + "T00:00") : new Date(iso));
const solapa = (e, des, fins) => new Date(iniReal(e)) < fins && new Date(fiReal(e)) > des;
const delDia = (llista, dia) => llista.filter((e) => solapa(e, dia, sumaDies(dia, 1)));

function horaDe(e, dia) {
  if (e.totElDia) return "Tot el dia";
  const ini = new Date(e.inici);
  if (dia && ini < mitjanit(dia)) return "Fins " + fHora.format(new Date(e.fi));
  return fHora.format(ini);
}
function quanText(e) {
  if (e.totElDia) {
    const fi = sumaDies(dataDe(e.fi), -1);
    return mateixDia(dataDe(e.inici), fi) ? majuscula(fDiaLlarg.format(dataDe(e.inici))) : `${fDiaCurt.format(dataDe(e.inici))} – ${fDiaCurt.format(fi)}`;
  }
  const i = new Date(e.inici), f = new Date(e.fi);
  const dia = majuscula(fDiaLlarg.format(i));
  return mateixDia(i, f)
    ? `${dia} · ${fHora.format(i)} – ${fHora.format(f)}`
    : `${dia} ${fHora.format(i)} → ${fDiaLlarg.format(f)} ${fHora.format(f)}`;
}
function faDies(iso) {
  const n = Math.round((avui() - mitjanit(new Date(iso))) / DIA);
  return n <= 0 ? "avui" : n === 1 ? "ahir" : `fa ${n} dies`;
}

// =============================================================
// 5 · Estructura: rutes, barra, navegació
// =============================================================
const TABS = [
  ["inici", "Inici", I.inici], ["agenda", "Agenda", I.agenda], ["tasques", "Tasques", I.tasques],
  ["compra", "Compra", I.compra], ["mes", "Més", I.mes],
];
const vistos = new Map(); // esdeveniments llegits, per id
const recorda = (llista) => { for (const e of llista) vistos.set(e.id, e); return llista; };

let torn = 0;
async function render() {
  const meu = ++torn;
  const [ruta = "inici", ...params] = decodeURIComponent(location.hash.slice(1)).split("/");
  let p;
  try {
    if (!MODE_PROVA && !L.llegeix("codi")) p = pantCodi();
    else if (!membre(jo)) p = pantTriaPersona();
    else p = await (PANTALLES[ruta] ?? PANTALLES.inici)(...params);
  } catch (e) {
    if (e.codi === 401) { avisa("Cal tornar a escriure el codi."); p = pantCodi(); }
    else p = { titol: "Error", cos: h`<p class="avis-caixa">${e.message}</p>` };
  }
  if (meu !== torn) return;
  pinta(p);
}

// Avisos pendents per a la persona actual (punts vermells)
function comptadors() {
  const permisos = esAdult() ? [...vistos.values()].filter((e) => e.permis?.estat === "pendent" && new Date(fiReal(e)) > new Date()).length : 0;
  const tasques = propostesMeves().perMi.length;
  const prestecs = prestecsInfo().filter((p) => p.tocaAMi).length;
  return { inici: 0, agenda: permisos, tasques, compra: 0, mes: prestecs };
}
const punt = (n, etiqueta = "avisos") => (n ? h`<span class="punt-avis" aria-label="${plural(n, "avís", etiqueta)}">${n > 9 ? "9+" : n}</span>` : "");

function pinta(p) {
  const barra = $("#barra"), vista = $("#vista"), nav = $("#nav");
  barra.hidden = !!p.senseBarra;
  barra.className = "barra" + (p.sub ? " sub" : "");
  barra.innerHTML = val(p.sub
    ? h`<button class="icona-boto" data-accio="enrere" data-pare="${p.pare ?? "inici"}" aria-label="Enrere">${I.enrere}</button><span class="titol">${p.titol}</span><span>${p.dreta ?? ""}</span>`
    : p.cap ?? h`<div class="titol"><b>${p.titol}</b>${p.subtitol ? h`<span>${p.subtitol}</span>` : ""}</div>${p.dreta ?? ""}<a class="icona-boto" href="#menu" aria-label="Menú">${I.menu}</a>`);
  vista.className = "vista" + (p.sub ? " sub entra" : "");
  vista.innerHTML = val(p.cos);
  nav.hidden = !!(p.sub || p.senseNav);
  const n = comptadors();
  nav.innerHTML = val(TABS.map(([r, t, ic]) => h`<a href="#${r}" ${r === p.tab ? raw('aria-current="page"') : ""}><span class="amb-punt">${ic}${punt(n[r])}</span>${t}</a>`));
  $("#franja").hidden = !MODE_PROVA;
  $("#franja").textContent = "Mode prova · dades d'exemple en aquest mòbil";
  document.title = p.titol ? `${typeof p.titol === "string" ? p.titol : "Família"} · Família` : "Família";
  p.despres?.();
}

// Canvia de pantalla; si ja hi som, només repinta.
function vesA(ruta) { if (location.hash === "#" + ruta) render(); else location.hash = ruta; }

function torna(pare) {
  if (history.length > 1 && sessionStorage.getItem("dins")) history.back();
  else location.hash = pare;
}

// =============================================================
// 6 · Inici («què toca ara»)
// =============================================================
async function pantInici() {
  const ara = new Date();
  const { llista } = await Agenda.interval(avui(), sumaDies(avui(), 60));
  recorda(llista);
  const dAvui = delDia(llista, avui());
  const properes = dAvui.filter((e) => e.totElDia || new Date(e.fi) > ara);
  const [primer, ...resta] = properes;

  // Coses que et demanen alguna cosa a tu
  const toca = [];
  const pendents = llista.filter((e) => e.permis?.estat === "pendent");
  if (esAdult()) {
    for (const e of pendents) toca.push(h`<a class="element avis" href="#permis/${e.id}">${I.rellotge}<span class="cos"><b>Permís: ${e.titol}</b><span>${nom(e.persona)} · ${quanText(e)}</span></span>${I.seg}</a>`);
  } else {
    for (const e of pendents.filter((x) => x.persona === jo)) toca.push(h`<button class="element" data-accio="detall" data-id="${e.id}">${I.rellotge}<span class="cos"><b>Esperant permís</b><span>${e.titol}</span></span>${I.seg}</button>`);
  }
  const ts = tasquesInfo();
  for (const t of propostesMeves(ts).perMi) {
    toca.push(h`<a class="element avis" href="#tasques">${inicial(t.proposta.per, "petita")}<span class="cos"><b>Et proposen: ${t.nom}</b><span>${nom(t.proposta.per)} · accepta-la o digues que no</span></span>${I.seg}</a>`);
  }
  for (const t of ts.filter((t) => t.endarrerida && tascaAplica(t, "meu")).slice(0, 3)) {
    toca.push(h`<a class="element" href="#tasca/${t.id}">${raw(I.alerta.s.replace('stroke="currentColor"', 'stroke="#9A5B00"'))}<span class="cos"><b>${t.nom}</b><span>Endarrerida · ${t.text}</span></span>${I.seg}</a>`);
  }
  for (const p of prestecsInfo()) {
    if (p.tocaAMi) toca.push(h`<a class="element avis" href="#mes">${I.canvi}<span class="cos"><b>Préstec per confirmar</b><span>${p.text}</span></span>${I.seg}</a>`);
    else if (p.estat === "actiu" && p.a === jo) toca.push(h`<a class="element" href="#mes">${I.canvi}<span class="cos"><b>Préstec pendent</b><span>Has de tornar ${euros(p.import)} a ${nom(p.de)}</span></span>${I.seg}</a>`);
  }

  const cap = h`
    <a href="#menu/persona" aria-label="Canvia de persona" style="text-decoration:none">${inicial(jo, "gran")}</a>
    <div class="titol"><b>${majuscula(fDiaLlarg.format(ara))}</b><span>${plural(dAvui.length, "cosa avui", "coses avui")} · ${toca.length ? plural(toca.length, "et demana alguna cosa", "et demanen alguna cosa") : "res pendent"}</span></div>
    <a class="icona-boto" href="#menu" aria-label="Menú">${I.menu}</a>`;

  const tarjaAra = primer
    ? h`<section class="ara">
        <span class="rotul">${primer.totElDia ? "AVUI" : new Date(primer.inici) <= ara ? "ARA" : "ARA VE"}</span>
        <button data-accio="detall" data-id="${primer.id}" class="gran" style="all:unset;cursor:pointer;font-size:1.65rem;font-weight:700;line-height:1.15">${primer.titol}</button>
        <div class="fila">${inicial(primer.persona, "petita")}<span>${nom(primer.persona)} · ${horaDe(primer)}${primer.totElDia ? "" : " · " + quanFalta(primer, ara)}</span></div>
        ${resta.length ? h`<div class="resta">${resta.slice(0, 4).map((e) => h`<span>${horaDe(e)} · ${e.titol} (${nom(e.persona)})</span>`)}${resta.length > 4 ? h`<span>i ${resta.length - 4} més…</span>` : ""}</div>` : ""}
      </section>`
    : h`<section class="ara"><span class="rotul">AVUI</span><span class="gran">Res més previst</span><a href="#agenda" style="color:inherit;font-weight:700">Mira l'agenda</a></section>`;

  return {
    tab: "inici", cap,
    cos: h`${tarjaAra}
      <div class="seccio"><h2>Et toca a tu</h2>
        ${toca.length ? toca : h`<p class="buit">Tot al dia.</p>`}
      </div>`,
  };
}
function quanFalta(e, ara) {
  const ini = new Date(e.inici);
  if (ini <= ara) return "ara mateix";
  const min = Math.round((ini - ara) / 6e4);
  return min < 60 ? `d'aquí a ${min} min` : `d'aquí a ${Math.round(min / 60)} h`;
}

// =============================================================
// 7 · Agenda (dia · setmana · mes)
// =============================================================
const ag = { vista: pref("agenda-vista", "dia"), filtre: pref("agenda-filtre", "meu"), dia: avui() };

function aplica(e) {
  if (ag.filtre === "tothom") return true;
  if (ag.filtre === "meu") return !e.persona || e.persona === jo;
  return e.persona === ag.filtre;
}

async function pantAgenda() {
  let des, fins;
  if (ag.vista === "mes") {
    const primer = new Date(ag.dia.getFullYear(), ag.dia.getMonth(), 1);
    des = dilluns(primer);
    fins = sumaDies(dilluns(new Date(ag.dia.getFullYear(), ag.dia.getMonth() + 1, 0)), 7);
  } else {
    des = dilluns(ag.dia);
    fins = sumaDies(des, 7);
  }
  const r = await Agenda.interval(des, fins);
  const llista = recorda(r.llista).filter(aplica);

  const seg = h`<div class="segmentat" role="group" aria-label="Vista">
    ${[["dia", "Dia"], ["setmana", "Setmana"], ["mes", "Mes"]].map(([v, t]) => h`<button data-accio="ag-vista" data-v="${v}" aria-pressed="${ag.vista === v}">${t}</button>`)}
  </div>`;
  const filtres = h`<div class="xips" role="group" aria-label="Filtre" style="margin-top:10px">
    <button class="xip" data-accio="ag-filtre" data-f="meu" aria-pressed="${ag.filtre === "meu"}">El meu</button>
    <button class="xip" data-accio="ag-filtre" data-f="tothom" aria-pressed="${ag.filtre === "tothom"}">Tothom</button>
    ${C.MEMBRES.filter((m) => m.id !== jo).map((m) => h`<button class="xip amb-inicial" data-accio="ag-filtre" data-f="${m.id}" aria-pressed="${ag.filtre === m.id}" aria-label="${m.nom}">${inicial(m.id, "petita")}</button>`)}
  </div>`;
  const avisDesat = r.error
    ? h`<p class="avis-caixa" style="margin-top:10px">${r.desada ? `Sense connexió: còpia de ${fHora.format(new Date(r.quan))}.` : `No s'ha pogut llegir el calendari: ${r.error}`}</p>`
    : "";

  let cos, despres;
  if (ag.vista === "mes") cos = vistaMes(llista);
  else if (ag.vista === "setmana") ({ cos, despres } = vistaSetmana(llista, des));
  else cos = vistaDia(llista, des);

  return {
    tab: "agenda", titol: "Agenda",
    cos: h`${seg}${filtres}${avisDesat}<div style="margin-top:12px">${cos}</div>
      <a class="fab" href="#nou/${isoDia(ag.dia)}">${I.mes1}Nou</a>`,
    despres,
  };
}

function navSetmana(des, text) {
  return h`<div class="setmana-nav">
    <button class="icona-boto" data-accio="ag-moure" data-n="-1" aria-label="Anterior">${I.ant}</button>
    <b>${text}</b>
    <button class="icona-boto" data-accio="ag-moure" data-n="1" aria-label="Següent">${I.seg}</button>
  </div>`;
}
const textSetmana = (des) => {
  const fi = sumaDies(des, 6);
  return des.getMonth() === fi.getMonth()
    ? `${des.getDate()} – ${fmt({ day: "numeric", month: "long" }).format(fi)}`
    : `${fDiaCurt.format(des)} – ${fDiaCurt.format(fi)}`;
};

function elemEsdev(e, dia) {
  const pendent = e.permis?.estat === "pendent";
  return h`<button class="element ${pendent ? "pendent" : ""}" data-accio="detall" data-id="${e.id}">
    <span class="hora">${horaDe(e, dia)}</span>${inicial(e.persona)}
    <span class="cos"><b>${e.titol}</b>${pendent ? h`<span class="estat-pendent">${I.rellotge}Pendent de permís</span>` : e.lloc ? h`<span>${e.lloc}</span>` : ""}</span>
  </button>`;
}

function vistaDia(llista, des) {
  const dies = Array.from({ length: 7 }, (_, i) => sumaDies(des, i));
  const delSeleccionat = delDia(llista, ag.dia);
  return h`${navSetmana(des, textSetmana(des))}
    <div class="dies">${dies.map((d, i) => h`<button data-accio="ag-dia" data-dia="${isoDia(d)}" aria-pressed="${mateixDia(d, ag.dia)}" class="${mateixDia(d, avui()) ? "avui" : ""}" aria-label="${fDiaLlarg.format(d)}">
      ${DIES_CURTS[i]}<b>${d.getDate()}</b>${delDia(llista, d).length ? raw('<span class="punt"></span>') : raw('<span class="punt" style="opacity:0"></span>')}</button>`)}</div>
    <div class="seccio"><span class="etiqueta-seccio" style="margin-top:0">${mateixDia(ag.dia, avui()) ? "Avui · " : ""}${majuscula(fDiaLlarg.format(ag.dia))}</span>
      ${delSeleccionat.length ? delSeleccionat.map((e) => elemEsdev(e, ag.dia)) : h`<p class="buit">Res previst.</p>`}
    </div>`;
}

const HORA_INI = 7, HORA_FI = 24, ALT = 40;
function vistaSetmana(llista, des) {
  const dies = Array.from({ length: 7 }, (_, i) => sumaDies(des, i));
  const totElDia = (d) => delDia(llista, d).filter((e) => e.totElDia);
  const blocs = (d) => {
    const evs = delDia(llista, d).filter((e) => !e.totElDia).sort((a, b) => new Date(a.inici) - new Date(b.inici));
    // Carrils per a esdeveniments que se solapen
    const carrils = [];
    const pos = evs.map((e) => {
      const ini = Math.max(new Date(e.inici), sumaDies(d, 0).getTime() + HORA_INI * 36e5);
      const fi = Math.min(new Date(e.fi), sumaDies(d, 1).getTime());
      let c = carrils.findIndex((f) => f <= ini);
      if (c === -1) { c = carrils.length; carrils.push(fi); } else carrils[c] = fi;
      return { e, ini, fi, c };
    });
    const n = Math.max(1, carrils.length);
    return pos.map(({ e, ini, fi, c }) => {
      const top = Math.max(0, (ini - d.getTime()) / 36e5 - HORA_INI) * ALT;
      const alt = Math.max(ALT * 0.6, ((fi - ini) / 36e5) * ALT - 2);
      const pend = e.permis?.estat === "pendent";
      return h`<button class="bloc ${pend ? "pendent" : ""}" data-accio="detall" data-id="${e.id}"
        style="top:${top}px;height:${alt}px;left:calc(${(c / n) * 100}% + 1px);width:calc(${100 / n}% - 2px);background:${color(e.persona)}"
        aria-label="${e.titol}, ${horaDe(e, d)}, ${nom(e.persona)}"><span class="ini">${membre(e.persona)?.inicial ?? "·"}</span> ${e.titol}</button>`;
    });
  };
  const hores = Array.from({ length: HORA_FI - HORA_INI }, (_, i) => HORA_INI + i);
  const cos = h`${navSetmana(des, textSetmana(des))}
    <div class="horari" id="horari" style="--h:${ALT}px;margin-top:8px">
      <div class="horari-cap"><span></span>${dies.map((d, i) => h`<span class="${mateixDia(d, avui()) ? "avui" : ""}">${DIES_CURTS[i]}<b>${d.getDate()}</b></span>`)}</div>
      <div class="horari-tot"><span></span>${dies.map((d) => h`<div>${totElDia(d).map((e) => h`<button class="bloc-tot" data-accio="detall" data-id="${e.id}" style="background:${color(e.persona)}"><span class="ini">${membre(e.persona)?.inicial ?? "·"}</span> ${e.titol}</button>`)}</div>`)}</div>
      <div class="horari-cos">
        <div class="horari-hores">${hores.map((x) => h`<span>${x}</span>`)}</div>
        ${dies.map((d) => h`<div class="horari-col" style="height:${hores.length * ALT}px">${blocs(d)}</div>`)}
      </div>
    </div>
    <p class="buit" style="font-size:.85rem">Toca un bloc per veure'n els detalls. Amb el mòbil girat es veu més ample.</p>`;
  const despres = () => {
    const el = $("#horari");
    if (el && dies.some((d) => mateixDia(d, avui()))) el.scrollTop = Math.max(0, (new Date().getHours() - HORA_INI - 1) * ALT);
  };
  return { cos, despres };
}

function vistaMes(llista) {
  const primer = new Date(ag.dia.getFullYear(), ag.dia.getMonth(), 1);
  const ini = dilluns(primer);
  const ultim = new Date(ag.dia.getFullYear(), ag.dia.getMonth() + 1, 0);
  const setmanes = Math.ceil((Math.round((ultim - ini) / DIA) + 1) / 7);
  const cel = Array.from({ length: setmanes * 7 }, (_, i) => sumaDies(ini, i));
  return h`<div class="setmana-nav">
      <button class="icona-boto" data-accio="ag-moure" data-n="-1" aria-label="Mes anterior">${I.ant}</button>
      <b>${majuscula(fMes.format(primer))}</b>
      <button class="icona-boto" data-accio="ag-moure" data-n="1" aria-label="Mes següent">${I.seg}</button>
    </div>
    <div class="mes-cap">${DIES_CURTS.map((d) => h`<span>${d}</span>`)}</div>
    <div class="mes">${cel.map((d) => {
      const evs = delDia(llista, d);
      return h`<button data-accio="mes-dia" data-dia="${isoDia(d)}" class="${d.getMonth() !== primer.getMonth() ? "fora" : ""} ${mateixDia(d, avui()) ? "avui" : ""}" aria-label="${fDiaLlarg.format(d)}, ${plural(evs.length, "cosa", "coses")}">
        <b>${d.getDate()}</b>
        <span class="punts">${evs.slice(0, 4).map((e) => h`<i style="background:${color(e.persona)}">${membre(e.persona)?.inicial ?? "·"}</i>`)}</span>
        ${evs.length > 4 ? h`<span class="mes-n">+${evs.length - 4}</span>` : ""}
      </button>`;
    })}</div>
    <p class="buit" style="font-size:.85rem">Toca un dia per obrir-lo.</p>`;
}

// =============================================================
// 8 · Esdeveniments i permisos
// =============================================================
const PERMISOS = { dormir: "Dormir fora", tard: "Tornar tard", cost: "Activitat amb cost" };

function obreDetall(id) {
  const e = vistos.get(id);
  if (!e) return;
  const pendent = e.permis?.estat === "pendent";
  const potEsborrar = esAdult() || !e.persona || e.persona === jo;
  obreFull(h`
    <div class="fila">${inicial(e.persona, "gran")}<div class="cos" style="display:flex;flex-direction:column"><span style="color:var(--suau)">${nom(e.persona)}</span><b style="font-size:1.3rem;line-height:1.2">${e.titol}</b></div></div>
    <dl class="diagnostic">
      <dt>Quan</dt><dd>${quanText(e)}</dd>
      ${e.lloc ? h`<dt>On</dt><dd>${e.lloc}</dd>` : ""}
      ${e.permis ? h`<dt>Permís</dt><dd>${PERMISOS[e.permis.tipus] ?? "Sí"}${e.permis.import ? ` · ${euros(e.permis.import)}` : ""} · ${pendent ? "pendent" : "confirmat"}</dd>` : ""}
      ${e.nota ? h`<dt>Nota</dt><dd>${e.nota}</dd>` : ""}
    </dl>
    ${pendent && esAdult() ? h`<a class="boto primari ample" href="#permis/${e.id}" data-accio="tanca-full">Revisa el permís</a>` : ""}
    ${potEsborrar ? h`<button class="boto perill ample" data-accio="esborra-esdev" data-id="${e.id}">Esborra</button>` : ""}
    <button class="boto ample" data-accio="tanca-full">Tanca</button>`);
}

async function pantNou(dataIso) {
  const dia = dataIso ? dataDe(dataIso) : ag.dia;
  const hora = new Date(); hora.setMinutes(0, 0, 0); hora.setHours(hora.getHours() + 1);
  const hIni = `${String(hora.getHours()).padStart(2, "0")}:00`;
  const hFi = `${String((hora.getHours() + 1) % 24).padStart(2, "0")}:00`;
  return {
    sub: true, pare: "agenda", titol: "Nou esdeveniment",
    cos: h`<form id="form-nou" class="formulari" autocomplete="off">
      <div class="camp"><label for="n-titol">Què</label><input id="n-titol" type="text" required maxlength="120" placeholder="Per exemple: Partit de bàsquet"></div>
      <div class="camp"><span class="etiq">Qui</span>
        <div class="fila" role="group" aria-label="Qui">
          ${C.MEMBRES.map((m) => h`<button type="button" class="tria-persona" data-accio="nou-qui" data-id="${m.id}" aria-pressed="${m.id === jo}" aria-label="${m.nom}" style="background:${m.color}">${m.inicial}</button>`)}
          <button type="button" class="tria-persona" data-accio="nou-qui" data-id="" aria-pressed="false" aria-label="Tothom" style="background:#6B6760">${I.familia}</button>
        </div>
      </div>
      <label class="interruptor"><span class="cos" style="flex:1"><b>Tot el dia</b></span><input id="n-totdia" type="checkbox"></label>
      <div class="graella2">
        <div class="camp"><label for="n-dini">Comença</label><input id="n-dini" type="date" required value="${isoDia(dia)}"></div>
        <div class="camp n-hores"><label for="n-hini">Hora</label><input id="n-hini" type="time" value="${hIni}"></div>
        <div class="camp"><label for="n-dfi">Acaba</label><input id="n-dfi" type="date" required value="${isoDia(dia)}"></div>
        <div class="camp n-hores"><label for="n-hfi">Hora</label><input id="n-hfi" type="time" value="${hFi}"></div>
      </div>
      <fieldset id="n-permis"><legend>Cal permís?</legend>
        <div class="graella2">
          <button type="button" class="opcio" data-accio="nou-permis" data-t="" aria-pressed="true">No</button>
          ${Object.entries(PERMISOS).map(([k, t]) => h`<button type="button" class="opcio" data-accio="nou-permis" data-t="${k}" aria-pressed="false">${k === "cost" ? "Té cost" : t}</button>`)}
        </div>
        <div class="camp" id="n-import-camp" hidden><label for="n-import">Import aproximat (€)</label><input id="n-import" type="number" min="0" step="1" inputmode="decimal"></div>
      </fieldset>
      <p id="n-info" class="avis-caixa" hidden></p>
      <div class="camp"><label for="n-lloc">On <span class="ajuda">(opcional)</span></label><input id="n-lloc" type="text" maxlength="120"></div>
      <div class="camp"><label for="n-nota">Nota <span class="ajuda">(opcional)</span></label><textarea id="n-nota" maxlength="500"></textarea></div>
      <button id="n-desa" class="boto primari ample" type="submit">Desa</button>
    </form>`,
    despres: () => { $("#form-nou").onsubmit = desaNou; $("#n-totdia").onchange = actualitzaNou; $("#n-import").oninput = actualitzaNou; actualitzaNou(); $("#n-titol").focus(); },
  };
}

function estatNou() {
  const qui = $("#form-nou [data-accio=nou-qui][aria-pressed=true]")?.dataset.id || null;
  const tipus = $("#form-nou [data-accio=nou-permis][aria-pressed=true]")?.dataset.t || "";
  const imp = Number($("#n-import").value || 0);
  const calPermis = membre(qui)?.rol === "jove" && !!tipus && !(tipus === "cost" && imp < C.LLINDAR_COST);
  return { qui, tipus, imp, calPermis };
}
function actualitzaNou() {
  const s = estatNou();
  $("#n-permis").hidden = membre(s.qui)?.rol !== "jove";
  $("#n-import-camp").hidden = s.tipus !== "cost";
  for (const el of document.querySelectorAll(".n-hores")) el.hidden = $("#n-totdia").checked;
  const info = $("#n-info");
  info.hidden = !s.tipus || $("#n-permis").hidden;
  if (s.tipus === "cost" && s.imp < C.LLINDAR_COST) info.textContent = `Per sota de ${euros(C.LLINDAR_COST)} no cal permís.`;
  else if (s.calPermis && !esAdult()) info.textContent = "Sortirà com a Pendent fins que un adult el confirmi.";
  else if (s.calPermis) info.textContent = "Com que el crees tu, quedarà confirmat.";
  $("#n-desa").textContent = s.calPermis && !esAdult() ? "Demana permís" : "Desa";
}

async function desaNou(ev) {
  ev.preventDefault();
  const s = estatNou();
  const tot = $("#n-totdia").checked;
  const dIni = $("#n-dini").value, dFi = $("#n-dfi").value || dIni;
  let inici, fi;
  if (tot) { inici = dIni; fi = isoDia(sumaDies(dataDe(dFi), 1)); }
  else {
    inici = new Date(`${dIni}T${$("#n-hini").value || "09:00"}`).toISOString();
    fi = new Date(`${dFi}T${$("#n-hfi").value || "10:00"}`).toISOString();
  }
  if (new Date(fi) <= new Date(inici)) { avisa("L'hora d'acabar ha de ser després de començar."); return; }
  const e = {
    titol: $("#n-titol").value.trim(), inici, fi, totElDia: tot, persona: s.qui,
    lloc: $("#n-lloc").value.trim() || null, nota: $("#n-nota").value.trim() || null,
    permis: s.calPermis ? { tipus: s.tipus, import: s.tipus === "cost" ? s.imp : null, estat: esAdult() ? "confirmat" : "pendent", qui: esAdult() ? jo : null } : null,
  };
  const b = $("#n-desa"); b.disabled = true;
  try {
    await Agenda.crea(e);
    if (e.permis?.estat === "confirmat") Col.afegeix("historial", { titol: e.titol, persona: e.persona, tipus: e.permis.tipus, estat: "confirmat", qui: jo, quan: new Date().toISOString(), comentari: "Creat per un adult" });
    avisa(e.permis?.estat === "pendent" ? "Enviat. Esperant permís." : "Desat.");
    ag.dia = mitjanit(dataDe(dIni));
    location.hash = "agenda";
  } catch (err) { avisa(err.message); b.disabled = false; }
}

async function pantPermis(id) {
  let e = vistos.get(id);
  if (!e) { const r = await Agenda.interval(sumaDies(avui(), -7), sumaDies(avui(), 120)); recorda(r.llista); e = vistos.get(id); }
  if (!e) return { sub: true, pare: "inici", titol: "Permís", cos: h`<p class="buit" style="padding-top:20px">Aquest esdeveniment ja no existeix.</p>` };
  const pendent = e.permis?.estat === "pendent";
  const hist = Col.llista("historial").slice(-8).reverse();
  return {
    sub: true, pare: "inici", titol: "Permís",
    cos: h`<div class="formulari">
      <section class="targeta">
        <div class="fila">${inicial(e.persona, "gran")}<div style="display:flex;flex-direction:column"><span style="color:var(--suau)">${nom(e.persona)} demana</span><b style="font-size:1.3rem;line-height:1.2">${e.titol}</b></div></div>
        <dl class="diagnostic">
          <dt>Tipus</dt><dd>${PERMISOS[e.permis?.tipus] ?? "—"}${e.permis?.import ? ` · ${euros(e.permis.import)}` : ""}</dd>
          <dt>Quan</dt><dd>${quanText(e)}</dd>
          ${e.lloc ? h`<dt>On</dt><dd>${e.lloc}</dd>` : ""}
          ${e.nota ? h`<dt>Nota</dt><dd>«${e.nota}»</dd>` : ""}
          <dt>Estat</dt><dd>${pendent ? "Pendent" : `Confirmat${e.permis?.qui ? " per " + nom(e.permis.qui) : ""}`}</dd>
        </dl>
      </section>
      ${pendent && esAdult() ? h`
        <div class="camp"><label for="p-comentari">Comentari <span class="ajuda">(opcional)</span></label><textarea id="p-comentari" maxlength="300" placeholder="Per exemple: torna abans de dinar"></textarea></div>
        <button class="boto primari ample" data-accio="permis-si" data-id="${e.id}">${I.ok}Hi estic d'acord</button>
        <button class="boto ample" data-accio="permis-no" data-id="${e.id}">${I.creu}Ara no</button>
        <p class="buit" style="padding:0">N'hi ha prou amb un adult. L'altre ho veurà a l'historial.</p>`
        : pendent ? h`<p class="avis-caixa">${I.rellotge}<span>Ho ha de confirmar un adult.</span></p>` : ""}
      <details><summary>Historial de permisos</summary>
        ${hist.length ? h`<div class="llista">${hist.map((x) => h`<label style="cursor:default"><span class="nom">${fDiaCurt.format(new Date(x.quan))} · ${x.titol} (${nom(x.persona)})</span><span class="quant">${x.estat === "confirmat" ? "Sí" : "No"}, ${nom(x.qui)}</span></label>`)}</div>` : h`<p class="buit">Encara no n'hi ha.</p>`}
      </details>
    </div>`,
  };
}

// =============================================================
// 9 · Tasques
// Una tasca pot ser LLIURE (qualsevol l'agafa) o ASSIGNADA a una persona.
// Assignar-la a algú altre és una PROPOSTA: no queda activa fins que l'accepta.
//   t.assignada = { persona, estat: "proposta" | "acceptada" | "rebutjada", per, quan }
//   t.activa = false mentre una tasca nova espera resposta (les tasques antigues sempre són actives)
// =============================================================
let filtreTasques = pref("tasques-filtre", "meu");

function tasquesInfo() {
  const hui = avui();
  return Col.llista("tasques").map((t) => {
    const fetes = t.fetes ?? [];
    const ultima = fetes.reduce((m, f) => (!m || f.quan > m.quan ? f : m), null);
    const agafada = t.agafada?.dia === isoDia(hui) ? t.agafada.persona : null;
    const activa = t.activa !== false;
    const responsable = t.assignada?.estat === "acceptada" ? t.assignada.persona : null;
    const proposta = t.assignada?.estat === "proposta" ? t.assignada : null;
    const rebutjada = t.assignada?.estat === "rebutjada" ? t.assignada : null;
    const base = { ...t, ultima, agafada, activa, responsable, proposta, rebutjada };
    if (t.tipus === "puntual") {
      const falten = Math.round((dataDe(t.limit) - hui) / DIA);
      const feta = fetes.length > 0;
      return { ...base, feta, endarrerida: activa && !feta && falten < 0, ratio: feta ? -1 : 1 - falten / 30,
        text: feta ? `feta ${faDies(ultima.quan)}` : falten < 0 ? `havia de ser el ${fDiaCurt.format(dataDe(t.limit))}` : falten === 0 ? "és per avui" : `abans del ${fDiaCurt.format(dataDe(t.limit))}` };
    }
    const des = ultima?.quan ?? t.creada;
    const dies = Math.max(0, Math.round((hui - mitjanit(new Date(des))) / DIA));
    return { ...base, feta: false, dies, endarrerida: activa && dies > t.cada, ratio: dies / t.cada,
      text: `${ultima ? (dies === 0 ? "feta avui" : `fa ${dies} ${dies === 1 ? "dia" : "dies"}`) : "encara no s'ha fet"} (cada ${t.cada})` };
  }).sort((a, b) => b.ratio - a.ratio);
}

// Quines tasques actives entren a cada filtre
function tascaAplica(t, f = filtreTasques) {
  if (!t.activa) return false;
  if (f === "tothom") return true;
  if (f === "lliures") return !t.responsable;
  if (f === "meu") return t.responsable === jo || !t.responsable;
  return t.responsable === f || t.agafada === f;
}

// Propostes que afecten la persona actual (sempre visibles, sense filtre)
function propostesMeves(ts = tasquesInfo()) {
  return {
    perMi: ts.filter((t) => t.proposta?.persona === jo),
    meves: ts.filter((t) => (t.proposta || t.rebutjada) && (t.proposta ?? t.rebutjada).per === jo),
  };
}

function quiFa(t) {
  if (t.responsable) return h`<span class="fila" style="font-size:.85rem;color:var(--suau);gap:6px">${inicial(t.responsable, "petita")}${t.responsable === jo ? "És teva" : `És de ${nom(t.responsable)}`}</span>`;
  if (t.agafada) return h`<span class="fila" style="font-size:.85rem;color:var(--suau);gap:6px">${inicial(t.agafada, "petita")}${t.agafada === jo ? "L'has agafat avui" : `L'agafa ${nom(t.agafada)} avui`}</span>`;
  return h`<span style="font-size:.85rem;color:var(--suau)">Lliure</span>`;
}

function botonsTasca(t) {
  const meva = t.agafada === jo;
  const esquerra = t.responsable
    ? h`<span class="fila" style="justify-content:center;color:var(--suau)">${inicial(t.responsable, "petita")}${t.responsable === jo ? "És teva" : nom(t.responsable)}</span>`
    : t.agafada && !meva
      ? h`<span class="fila" style="justify-content:center;color:var(--suau)">${inicial(t.agafada, "petita")}l'agafa avui</span>`
      : h`<button class="boto" data-accio="tasca-agafa" data-id="${t.id}">${meva ? "La deixo" : "Me la quedo"}</button>`;
  return h`<div class="graella2">${esquerra}<button class="boto primari" data-accio="tasca-feta" data-id="${t.id}">Feta</button></div>`;
}

function tarjaProposta(t) {
  if (t.proposta?.persona === jo) {
    return h`<section class="targeta" style="border:2px solid var(--avis-vora)">
      <span class="fila">${inicial(t.proposta.per, "petita")}<span style="color:var(--suau)">${nom(t.proposta.per)} et proposa</span></span>
      <a href="#tasca/${t.id}" style="color:inherit;text-decoration:none"><b style="font-size:1.1rem">${t.nom}</b></a>
      <span style="color:var(--suau);font-size:.9rem">${t.tipus === "recurrent" ? `Cada ${t.cada} dies` : `Abans del ${fDiaCurt.format(dataDe(t.limit))}`}${t.proposta.nota ? ` · «${t.proposta.nota}»` : ""}</span>
      <div class="graella2"><button class="boto" data-accio="tasca-rebutja" data-id="${t.id}">No pot ser</button><button class="boto primari" data-accio="tasca-accepta" data-id="${t.id}">${I.ok}Accepto</button></div>
    </section>`;
  }
  if (t.proposta) {
    return h`<a class="element" href="#tasca/${t.id}">${I.rellotge}<span class="cos"><b>${t.nom}</b><span>Esperant resposta de ${nom(t.proposta.persona)}</span></span>${inicial(t.proposta.persona, "petita")}</a>`;
  }
  return h`<section class="targeta">
    <span class="fila">${inicial(t.rebutjada.persona, "petita")}<span><b>${nom(t.rebutjada.persona)}</b> no pot fer «${t.nom}»</span></span>
    <div class="graella2"><a class="boto" href="#tasca/${t.id}">Proposa-la a una altra persona</a><button class="boto" data-accio="tasca-allibera" data-id="${t.id}">Deixa-la lliure</button></div>
  </section>`;
}

function pantTasques() {
  const ts = tasquesInfo();
  const { perMi, meves } = propostesMeves(ts);
  const visibles = ts.filter((t) => tascaAplica(t));
  const endarr = visibles.filter((t) => t.endarrerida);
  const alDia = visibles.filter((t) => !t.endarrerida && !t.feta);
  const fetes = visibles.filter((t) => t.feta);
  const filtres = h`<div class="xips" role="group" aria-label="Filtre" style="margin-bottom:12px">
    ${[["meu", "Les meves"], ["tothom", "Tothom"], ["lliures", "Lliures"]].map(([f, t]) => h`<button class="xip" data-accio="tasques-filtre" data-f="${f}" aria-pressed="${filtreTasques === f}">${t}</button>`)}
    ${C.MEMBRES.filter((m) => m.id !== jo).map((m) => h`<button class="xip amb-inicial" data-accio="tasques-filtre" data-f="${m.id}" aria-pressed="${filtreTasques === m.id}" aria-label="${m.nom}">${inicial(m.id, "petita")}</button>`)}
  </div>`;
  const textBuit = { meu: "No tens cap tasca pendent.", tothom: "No hi ha tasques.", lliures: "No hi ha tasques lliures." }[filtreTasques] ?? `${nom(filtreTasques)} no té cap tasca.`;
  return {
    tab: "tasques", titol: "Tasques",
    dreta: h`<a class="icona-boto ple" href="#tasca-nova" aria-label="Nova tasca">${I.mes1}</a>`,
    cos: h`
      ${perMi.length || meves.length ? h`<div class="seccio" style="margin:0 0 16px"><h2><span class="amb-punt" style="padding-right:14px">Propostes${punt(perMi.length)}</span></h2>${perMi.map(tarjaProposta)}${meves.map(tarjaProposta)}</div>` : ""}
      ${filtres}
      ${endarr.map((t) => h`<section class="targeta" style="margin-bottom:12px">
        <a class="fila" href="#tasca/${t.id}" style="color:inherit;text-decoration:none">${raw(I.alerta.s.replace('stroke="currentColor"', 'stroke="#9A5B00"'))}<b style="flex:1;font-size:1.1rem">${t.nom}</b></a>
        <div class="barra-progres endarrerida"><div style="width:100%"></div></div>
        <span class="text-avis">Endarrerida · ${t.text}</span>
        ${botonsTasca(t)}
      </section>`)}
      ${alDia.length && endarr.length ? h`<span class="etiqueta-seccio" style="display:block">Al dia</span>` : ""}
      <div class="seccio" style="margin-top:8px">${alDia.map((t) => h`<a class="element" href="#tasca/${t.id}" style="flex-direction:column;align-items:stretch;gap:6px">
        <span class="fila" style="justify-content:space-between"><b>${t.nom}</b><span style="color:var(--suau);font-size:.9rem">${t.tipus === "recurrent" ? (t.ultima ? faDies(t.ultima.quan) : "nova") : t.text}</span></span>
        ${t.tipus === "recurrent" ? h`<div class="barra-progres"><div style="width:${Math.min(100, Math.round(t.ratio * 100))}%"></div></div>` : ""}
        ${quiFa(t)}
      </a>`)}</div>
      ${!endarr.length && !alDia.length ? h`<p class="buit">${textBuit}</p>` : ""}
      ${fetes.length ? h`<details style="margin-top:12px"><summary>Puntuals fetes · ${fetes.length}</summary>
        <div class="seccio" style="margin-top:4px">${fetes.map((t) => h`<a class="element" href="#tasca/${t.id}"><span class="cos"><b>${t.nom}</b><span>${t.text} · ${nom(t.ultima.persona)}</span></span></a>`)}</div></details>` : ""}
      ${avisLocal()}`,
  };
}

// Selector de persona per proposar una tasca («Lliure» opcional)
function triaResponsable(seleccio, ambLliure) {
  return h`<div class="fila" role="group" aria-label="Per a qui" style="flex-wrap:wrap">
    ${ambLliure ? h`<button type="button" class="opcio" data-accio="tasca-per" data-id="" aria-pressed="${!seleccio}" style="min-width:96px">Lliure</button>` : ""}
    ${C.MEMBRES.map((m) => h`<button type="button" class="tria-persona" data-accio="tasca-per" data-id="${m.id}" aria-pressed="${m.id === seleccio}" aria-label="${m.nom}" style="background:${m.color}">${m.inicial}</button>`)}
  </div>`;
}
const responsableTriat = () => $("[data-accio=tasca-per][aria-pressed=true]")?.dataset.id || null;

function pantTasca(id) {
  const t = tasquesInfo().find((x) => x.id === id);
  if (!t) return { sub: true, pare: "tasques", titol: "Tasca", cos: h`<p class="buit">Aquesta tasca ja no existeix.</p>` };
  const fetes = [...(t.fetes ?? [])].reverse();
  let quiCos;
  if (t.proposta?.persona === jo) quiCos = tarjaProposta(t);
  else if (t.proposta) quiCos = h`<p>${nom(t.proposta.per)} l'ha proposat a <b>${nom(t.proposta.persona)}</b>. Esperant resposta.</p>
    ${t.proposta.per === jo || esAdult() ? h`<button class="boto ample" data-accio="tasca-retira" data-id="${t.id}">Retira la proposta</button>` : ""}`;
  else if (t.responsable === jo) quiCos = h`<p>És teva.</p><button class="boto ample" data-accio="tasca-allibera" data-id="${t.id}">Deixa-la lliure</button>`;
  else quiCos = h`<p>${t.responsable ? h`És de <b>${nom(t.responsable)}</b>.` : t.rebutjada ? h`${nom(t.rebutjada.persona)} no la pot fer.` : "És lliure: qualsevol la pot agafar."}</p>
    <div class="camp"><span class="etiq">Proposa-la a</span>${triaResponsable(null, false)}</div>
    <div class="camp"><label for="t-nota">Missatge <span class="ajuda">(opcional)</span></label><input id="t-nota" type="text" maxlength="120"></div>
    <button class="boto ample" data-accio="tasca-proposa" data-id="${t.id}">Proposa</button>`;
  return {
    sub: true, pare: "tasques", titol: t.nom,
    cos: h`<div class="formulari">
      ${t.activa ? h`<section class="targeta">
        ${t.tipus === "recurrent" ? h`<div class="barra-progres ${t.endarrerida ? "endarrerida" : ""}"><div style="width:${Math.min(100, Math.round(t.ratio * 100))}%"></div></div>` : ""}
        <span class="${t.endarrerida ? "text-avis" : ""}">${t.endarrerida ? "Endarrerida · " : ""}${t.text}</span>
        ${t.feta ? "" : botonsTasca(t)}
      </section>` : h`<p class="avis-caixa">${I.rellotge}<span>Encara no és activa: s'activarà quan l'acceptin.</span></p>`}
      <div class="seccio" style="margin-top:0"><h2>Qui la fa</h2>${quiCos}</div>
      <form id="form-tasca" class="formulari" style="padding-top:0">
        <div class="camp"><label for="t-nom">Nom</label><input id="t-nom" type="text" required maxlength="80" value="${t.nom}"></div>
        ${t.tipus === "recurrent"
          ? h`<div class="camp"><label for="t-cada">Cada quants dies</label><input id="t-cada" type="number" min="1" max="365" required value="${t.cada}"></div>`
          : h`<div class="camp"><label for="t-limit">Data límit</label><input id="t-limit" type="date" required value="${t.limit}"></div>`}
        <button class="boto ample" type="submit">Desa els canvis</button>
      </form>
      <div class="seccio"><h2>Historial</h2>
        ${fetes.length ? h`<div class="llista">${fetes.map((f) => h`<label style="cursor:default">${inicial(f.persona, "petita")}<span class="nom">${nom(f.persona)}</span><span class="quant">${fData.format(new Date(f.quan))}</span></label>`)}</div>` : h`<p class="buit">Encara no s'ha fet mai.</p>`}
      </div>
      <button class="boto perill ample" data-accio="tasca-esborra" data-id="${t.id}">Esborra la tasca</button>
    </div>`,
    despres: () => {
      $("#form-tasca").onsubmit = (ev) => {
        ev.preventDefault();
        Col.actualitza("tasques", id, (x) => {
          x.nom = $("#t-nom").value.trim();
          if (x.tipus === "recurrent") x.cada = Math.max(1, Number($("#t-cada").value));
          else x.limit = $("#t-limit").value;
        });
        avisa("Desat.");
        render();
      };
    },
  };
}

let tipusNova = "recurrent";
function pantTascaNova() {
  return {
    sub: true, pare: "tasques", titol: "Nova tasca",
    cos: h`<form id="form-tn" class="formulari">
      <div class="camp"><label for="tn-nom">Què cal fer</label><input id="tn-nom" type="text" required maxlength="80" placeholder="Per exemple: Regar les plantes"></div>
      <div class="segmentat" role="group" aria-label="Tipus">
        <button type="button" data-accio="tn-tipus" data-t="recurrent" aria-pressed="${tipusNova === "recurrent"}">Es repeteix</button>
        <button type="button" data-accio="tn-tipus" data-t="puntual" aria-pressed="${tipusNova === "puntual"}">Un sol cop</button>
      </div>
      <div class="camp" id="tn-cada-camp" ${tipusNova === "puntual" ? raw("hidden") : ""}><label for="tn-cada">Cada quants dies, com a màxim</label><input id="tn-cada" type="number" min="1" max="365" value="7"></div>
      <div class="camp" id="tn-limit-camp" ${tipusNova === "recurrent" ? raw("hidden") : ""}><label for="tn-limit">Data límit</label><input id="tn-limit" type="date" value="${isoDia(sumaDies(avui(), 7))}"></div>
      <div class="camp"><span class="etiq">Per a qui</span>${triaResponsable(null, true)}</div>
      <div class="camp" id="tn-nota-camp" hidden><label for="tn-nota">Missatge <span class="ajuda">(opcional)</span></label><input id="tn-nota" type="text" maxlength="120" placeholder="Per exemple: aquesta setmana no arribo"></div>
      <p id="tn-info" class="avis-caixa" hidden></p>
      <button id="tn-desa" class="boto primari ample" type="submit">Desa</button>
    </form>`,
    despres: () => {
      $("#form-tn").onsubmit = (ev) => {
        ev.preventDefault();
        const per = responsableTriat();
        const base = { nom: $("#tn-nom").value.trim(), tipus: tipusNova, creada: new Date().toISOString(), fetes: [] };
        if (tipusNova === "recurrent") base.cada = Math.max(1, Number($("#tn-cada").value || 7));
        else base.limit = $("#tn-limit").value;
        if (per === jo) base.assignada = { persona: jo, estat: "acceptada", per: jo, quan: base.creada };
        else if (per) { base.assignada = { persona: per, estat: "proposta", per: jo, quan: base.creada, nota: $("#tn-nota").value.trim() }; base.activa = false; }
        Col.afegeix("tasques", base);
        avisa(per && per !== jo ? `Proposada a ${nom(per)}. S'activarà quan l'accepti.` : "Tasca afegida.");
        location.hash = "tasques";
      };
      $("#tn-nom").focus();
    },
  };
}
function actualitzaTascaNova() {
  const per = responsableTriat();
  const altre = per && per !== jo;
  $("#tn-nota-camp").hidden = !altre;
  $("#tn-info").hidden = !altre;
  $("#tn-info").textContent = altre ? `${nom(per)} la rebrà com a proposta. Quan l'accepti, quedarà activa.` : "";
  $("#tn-desa").textContent = altre ? "Proposa" : "Desa";
}

// =============================================================
// 10 · Compra (una sola llista)
// =============================================================
function pantCompra() {
  const items = Col.llista("compra");
  const pend = items.filter((i) => !i.comprat);
  const fets = items.filter((i) => i.comprat);
  const fila = (i) => h`<label><input type="checkbox" data-accio="compra-marca" data-id="${i.id}" ${i.comprat ? raw("checked") : ""}><span class="nom">${i.nom}</span>${i.quantitat ? h`<span class="quant">${i.quantitat}</span>` : ""}</label>`;
  return {
    tab: "compra", titol: "Compra", subtitol: pend.length ? plural(pend.length, "cosa", "coses") : "Llista buida",
    cos: h`<form id="form-compra" class="fila" style="margin-bottom:12px" autocomplete="off">
        <label for="c-nou" class="oculta">Afegeix a la llista</label>
        <input id="c-nou" type="text" maxlength="80" placeholder="Afegeix… (ex: llet x6)" enterkeyhint="done">
        <button class="icona-boto ple" style="border-radius:12px;width:52px;height:52px" aria-label="Afegeix">${I.mes1}</button>
      </form>
      ${pend.length ? h`<div class="llista">${pend.map(fila)}</div>` : h`<p class="buit">No falta res.</p>`}
      ${fets.length ? h`<details style="margin-top:12px"><summary>Comprats · ${fets.length}</summary>
        <div class="llista fets">${fets.map(fila)}</div>
        <button class="boto perill ample" style="margin-top:10px" data-accio="compra-buida">Treu els comprats</button>
      </details>` : ""}
      ${avisLocal()}`,
    despres: () => {
      $("#form-compra").onsubmit = (ev) => {
        ev.preventDefault();
        const text = $("#c-nou").value.trim();
        if (!text) return;
        const m = text.match(/^(.*?)\s*[x×]\s*(\d+[\w.,]*)$/i);
        Col.afegeix("compra", { nom: m ? m[1] : text, quantitat: m ? m[2] : "", comprat: false, quan: new Date().toISOString(), qui: jo });
        render().then(() => $("#c-nou")?.focus());
      };
    },
  };
}

// =============================================================
// 11 · Més: desitjos i préstecs
// =============================================================
let deQui = null;
const PRIORITATS = { molt: "Molt", bastant: "Bastant", poc: "Una mica" };
const domini = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

function pantMes() {
  deQui = deQui ?? jo;
  const desitjos = Col.llista("desitjos").filter((d) => d.persona === deQui)
    .sort((a, b) => Object.keys(PRIORITATS).indexOf(a.prioritat) - Object.keys(PRIORITATS).indexOf(b.prioritat));
  const prestecs = prestecsInfo().filter((p) => p.visible);
  const oberts = prestecs.filter((p) => p.estat !== "retornat").sort((x, y) => y.tocaAMi - x.tocaAMi);
  const retornats = prestecs.filter((p) => p.estat === "retornat");
  return {
    tab: "mes", titol: "Més",
    cos: h`<div class="seccio" style="margin-top:4px">
        <h2>Desitjos ${deQui === jo ? h`<a class="boto petit" href="#desig-nou">Afegeix</a>` : ""}</h2>
        <div class="xips" role="group" aria-label="De qui">${C.MEMBRES.map((m) => h`<button class="xip amb-inicial" data-accio="desitjos-de" data-id="${m.id}" aria-pressed="${m.id === deQui}">${inicial(m.id, "petita")}${m.id === jo ? "Els meus" : m.nom}</button>`)}</div>
        ${desitjos.length ? desitjos.map((d) => h`<button class="element" data-accio="desig" data-id="${d.id}">
            <span class="cos"><b>${d.nom}</b><span>${d.preu ? `≈ ${euros(d.preu)}` : ""}${d.preu && d.enllac ? " · " : ""}${d.enllac ? domini(d.enllac) : ""}</span></span>
            <span class="prioritat ${d.prioritat}">${PRIORITATS[d.prioritat] ?? ""}</span></button>`)
          : h`<p class="buit">${deQui === jo ? "Encara no hi has afegit res." : "Encara no hi ha res."}</p>`}
      </div>
      <div class="seccio"><h2><span class="amb-punt" style="padding-right:14px">Préstecs${punt(prestecs.filter((p) => p.tocaAMi).length)}</span> <a class="boto petit" href="#prestec-nou">Nou</a></h2>
        ${oberts.length ? oberts.map(tarjaPrestec) : h`<p class="buit">Cap préstec pendent.</p>`}
        ${retornats.length ? h`<details><summary>Retornats · ${retornats.length}</summary><div class="seccio" style="margin-top:4px">${retornats.map(tarjaPrestec)}</div></details>` : ""}
        <p class="buit" style="font-size:.85rem">Un préstec només compta quan les dues persones hi estan d'acord, i també per donar-lo per retornat. El veuen les dues persones i els adults.</p>
      </div>
      ${avisLocal()}`,
  };
}

function obreDesig(id) {
  const d = Col.llista("desitjos").find((x) => x.id === id);
  if (!d) return;
  obreFull(h`<b style="font-size:1.3rem">${d.nom}</b>
    <dl class="diagnostic">
      <dt>De</dt><dd>${nom(d.persona)}</dd>
      ${d.preu ? h`<dt>Preu</dt><dd>≈ ${euros(d.preu)}</dd>` : ""}
      <dt>Ganes</dt><dd>${PRIORITATS[d.prioritat] ?? "—"}</dd>
      ${d.enllac ? h`<dt>Enllaç</dt><dd>${domini(d.enllac)}</dd>` : ""}
    </dl>
    ${d.enllac ? h`<button class="boto ample" data-accio="copia" data-text="${d.enllac}">Copia l'enllaç</button>` : ""}
    ${d.persona === jo ? h`<button class="boto perill ample" data-accio="desig-esborra" data-id="${d.id}">Esborra</button>` : ""}
    <button class="boto ample" data-accio="tanca-full">Tanca</button>`);
}

let prioritatNova = "bastant";
function pantDesigNou() {
  return {
    sub: true, pare: "mes", titol: "Nou desig",
    cos: h`<form id="form-desig" class="formulari">
      <div class="camp"><label for="d-nom">Què</label><input id="d-nom" type="text" required maxlength="80"></div>
      <div class="camp"><label for="d-preu">Preu aproximat (€) <span class="ajuda">(opcional)</span></label><input id="d-preu" type="number" min="0" step="1" inputmode="decimal"></div>
      <fieldset><legend>Quantes ganes en tens?</legend><div class="graella3">
        ${Object.entries(PRIORITATS).map(([k, t]) => h`<button type="button" class="opcio" data-accio="desig-prioritat" data-p="${k}" aria-pressed="${k === prioritatNova}">${t}</button>`)}
      </div></fieldset>
      <div class="camp"><label for="d-enllac">Enllaç <span class="ajuda">(opcional)</span></label><input id="d-enllac" type="url" placeholder="https://…"></div>
      <button class="boto primari ample" type="submit">Desa</button>
    </form>`,
    despres: () => {
      $("#form-desig").onsubmit = (ev) => {
        ev.preventDefault();
        Col.afegeix("desitjos", { persona: jo, nom: $("#d-nom").value.trim(), preu: Number($("#d-preu").value) || null, prioritat: prioritatNova, enllac: $("#d-enllac").value.trim() });
        avisa("Desat.");
        deQui = jo;
        location.hash = "mes";
      };
      $("#d-nom").focus();
    },
  };
}

// =============================================================
// Préstecs: les dues persones han d'estar d'acord
//   estat: "proposat" (l'ha creat `per`, falta l'altra) → "actiu"
//          "actiu" → "retorn" (l'ha proposat `retornPer`, falta l'altra) → "retornat"
//          "rebutjat": l'altra persona ha dit que no és així
// =============================================================
const altreDe = (p, qui) => (qui === p.de ? p.a : p.de);

function prestecsInfo() {
  return Col.llista("prestecs").map((x) => {
    const p = { ...x, estat: x.estat === "pendent" ? "actiu" : x.estat }; // dades antigues
    const implicat = p.de === jo || p.a === jo;
    const espera = p.estat === "proposat" ? altreDe(p, p.per) : p.estat === "retorn" ? altreDe(p, p.retornPer) : null;
    let text = "";
    if (p.estat === "proposat") {
      text = espera === jo
        ? `${nom(p.per)} diu que ${p.de === jo ? "li has deixat" : "t'ha deixat"} ${euros(p.import)}`
        : `Esperant que ${nom(espera)} ho confirmi`;
    } else if (p.estat === "retorn") {
      text = espera === jo ? `${nom(p.retornPer)} diu que ja està retornat` : `Esperant que ${nom(espera)} confirmi el retorn`;
    } else if (p.estat === "rebutjat") text = `${nom(altreDe(p, p.per))} diu que no és així`;
    else if (p.estat === "actiu") text = "Pendent de retornar";
    else text = `Retornat${p.retornat ? " el " + fDiaCurt.format(new Date(p.retornat)) : ""}`;
    return { ...p, implicat, espera, tocaAMi: espera === jo, text,
      visible: implicat || (esAdult() && p.estat !== "rebutjat") };
  });
}

function tarjaPrestec(p) {
  let accions = "";
  if (p.tocaAMi && p.estat === "proposat") {
    accions = h`<div class="graella2"><button class="boto" data-accio="prestec-no" data-id="${p.id}">No és així</button><button class="boto primari" data-accio="prestec-si" data-id="${p.id}">${I.ok}És correcte</button></div>`;
  } else if (p.tocaAMi && p.estat === "retorn") {
    accions = h`<div class="graella2"><button class="boto" data-accio="prestec-encara" data-id="${p.id}">Encara no</button><button class="boto primari" data-accio="prestec-retornat-si" data-id="${p.id}">${I.ok}Sí, retornat</button></div>`;
  } else if (p.estat === "actiu" && p.implicat) {
    accions = h`<button class="boto ample" data-accio="prestec-retorn" data-id="${p.id}">Ja està retornat</button>`;
  } else if ((p.estat === "proposat" && p.per === jo) || p.estat === "rebutjat" || (p.estat === "retornat" && p.implicat)) {
    accions = h`<button class="boto perill ample" data-accio="prestec-esborra" data-id="${p.id}">${p.estat === "proposat" ? "Retira" : "Esborra"}</button>`;
  }
  const marc = p.tocaAMi ? "border:2px solid var(--avis-vora)" : p.estat === "proposat" || p.estat === "retorn" ? "border:2px dashed var(--avis-vora)" : "";
  return h`<section class="targeta" style="${marc}">
    <div class="fila">${inicial(p.de, "petita")}${I.seg}${inicial(p.a, "petita")}<span class="import-gran">${euros(p.import)}</span></div>
    <span style="color:var(--suau);font-size:.9rem">${nom(p.de)} ho deixa a ${nom(p.a)} · ${fDiaCurt.format(dataDe(p.data))}${p.nota ? ` · ${p.nota}` : ""}</span>
    <span class="${p.estat === "actiu" || p.estat === "retornat" ? "" : "estat-pendent"}" style="${p.estat === "retornat" ? "color:var(--suau)" : ""}">${p.estat === "proposat" || p.estat === "retorn" ? I.rellotge : ""}${p.text}</span>
    ${accions}
  </section>`;
}

let sentitPrestec = "deixo";
function pantPrestecNou() {
  const altres = C.MEMBRES.filter((m) => m.id !== jo);
  return {
    sub: true, pare: "mes", titol: "Nou préstec",
    cos: h`<form id="form-prestec" class="formulari">
      <div class="segmentat" role="group" aria-label="Sentit">
        <button type="button" data-accio="prestec-sentit" data-s="deixo" aria-pressed="${sentitPrestec === "deixo"}">Jo deixo diners</button>
        <button type="button" data-accio="prestec-sentit" data-s="em-deixen" aria-pressed="${sentitPrestec === "em-deixen"}">Me'n deixen</button>
      </div>
      <div class="camp"><span class="etiq" id="p-qui-etiq">${sentitPrestec === "deixo" ? "A qui" : "Qui te'ls deixa"}</span>
        <div class="fila" role="group">${altres.map((m, i) => h`<button type="button" class="tria-persona" data-accio="prestec-tria" data-id="${m.id}" aria-pressed="${i === 0}" aria-label="${m.nom}" style="background:${m.color}">${m.inicial}</button>`)}</div></div>
      <div class="camp"><label for="p-import">Import (€)</label><input id="p-import" type="number" min="0.01" step="0.01" required inputmode="decimal"></div>
      <div class="camp"><label for="p-data">Data</label><input id="p-data" type="date" required value="${isoDia(avui())}"></div>
      <div class="camp"><label for="p-nota">Per a què <span class="ajuda">(opcional)</span></label><input id="p-nota" type="text" maxlength="80"></div>
      <p class="avis-caixa" id="p-info">${I.rellotge}<span>${nom(altres[0]?.id)} ho haurà de confirmar.</span></p>
      <button class="boto primari ample" type="submit">Envia per confirmar</button>
    </form>`,
    despres: () => {
      $("#form-prestec").onsubmit = (ev) => {
        ev.preventDefault();
        const altre = $("[data-accio=prestec-tria][aria-pressed=true]")?.dataset.id;
        if (!altre) { avisa("Tria la persona."); return; }
        const [de, a] = sentitPrestec === "deixo" ? [jo, altre] : [altre, jo];
        Col.afegeix("prestecs", { de, a, import: Number($("#p-import").value), data: $("#p-data").value, nota: $("#p-nota").value.trim(), estat: "proposat", per: jo, creat: new Date().toISOString() });
        avisa(`Enviat. Quan ${nom(altre)} ho confirmi, comptarà.`);
        location.hash = "mes";
      };
    },
  };
}

// Avís honest: aquestes dades encara no es comparteixen entre mòbils.
const avisLocal = () => h`<p class="buit" style="font-size:.8rem;margin-top:16px">De moment, aquestes dades només es desen en aquest mòbil. Quan connectem Supabase es compartiran amb tota la família.</p>`;

// =============================================================
// 12 · Menú ⋮ (estil WhatsApp)
// =============================================================
function pantMenu() {
  const fila = (href, ic, t, s) => h`<a href="${href}">${ic}<span class="cos"><b>${t}</b>${s ? h`<span>${s}</span>` : ""}</span>${I.seg}</a>`;
  return {
    sub: true, pare: "inici", titol: "Menú",
    cos: h`<div class="formulari">
      <div class="menu">
        ${fila("#menu/persona", I.persona, "Qui sóc", nom(jo))}
        ${fila("#menu/aspecte", I.aspecte, "Aspecte", "Tema, mida de lletra, daltònics")}
        ${fila("#menu/avisos", I.campana, "Avisos", "Resum del matí")}
        ${fila("#menu/dades", I.disc, "Dades i còpia", MODE_PROVA ? "Mode prova" : "Connectada a Google Calendar")}
      </div>
      ${MODE_PROVA ? "" : h`<div class="menu"><button data-accio="oblida-codi">${I.sortir}<span class="cos"><b>Tanca la sessió en aquest mòbil</b></span></button></div>`}
    </div>`,
  };
}

function pantPersona() {
  return {
    sub: true, pare: "menu", titol: "Qui sóc",
    cos: h`<div class="formulari"><div class="graella-persones">${C.MEMBRES.map((m) => h`<button data-accio="tria-persona" data-id="${m.id}" aria-pressed="${m.id === jo}" style="${m.id === jo ? "outline:3px solid var(--primari)" : ""}">${inicial(m.id, "gran")}${m.nom}</button>`)}</div></div>`,
  };
}

function pantAspecte() {
  const tema = pref("tema", "auto"), mida = pref("mida", "normal"), dalt = pref("daltonics", false);
  return {
    sub: true, pare: "menu", titol: "Aspecte",
    cos: h`<div class="formulari">
      <fieldset><legend>Tema</legend><div class="graella3">
        ${[["auto", "Automàtic", I.aspecte], ["clar", "Clar", I.sol], ["fosc", "Fosc", I.lluna]].map(([v, t, ic]) => h`<button class="opcio alta" data-accio="aspecte" data-k="tema" data-v="${v}" aria-pressed="${tema === v}">${ic}${t}</button>`)}
      </div></fieldset>
      <fieldset><legend>Mida de la lletra</legend><div class="graella2">
        <button class="opcio" data-accio="aspecte" data-k="mida" data-v="normal" aria-pressed="${mida === "normal"}">Normal</button>
        <button class="opcio" data-accio="aspecte" data-k="mida" data-v="gran" aria-pressed="${mida === "gran"}" style="font-size:1.2rem">Gran</button>
      </div></fieldset>
      <label class="interruptor"><span class="cos" style="flex:1;display:flex;flex-direction:column"><b>Mode per a daltònics</b><span style="color:var(--suau);font-size:.9rem">Mostra la inicial de cada persona també al calendari del mes</span></span>
        <input type="checkbox" role="switch" data-accio="daltonics" ${dalt ? raw("checked") : ""}></label>
      <div class="seccio"><h2>Colors de cada persona</h2>
        <div class="llista">${C.MEMBRES.map((m) => h`<label style="cursor:default">${inicial(m.id)}<span class="nom">${m.nom}</span><span class="quant">${m.rol === "adult" ? "Adult" : "Jove"}</span></label>`)}</div>
      </div>
    </div>`,
  };
}

function aplicaAspecte() {
  const r = document.documentElement;
  r.dataset.tema = pref("tema", "auto");
  r.dataset.mida = pref("mida", "normal");
  if (pref("daltonics", false)) r.dataset.daltonics = ""; else delete r.dataset.daltonics;
}

// --- Avisos push ---
const esIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const esInstallada = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const potPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

async function pantAvisos() {
  const sub = potPush ? await (await navigator.serviceWorker.ready).pushManager.getSubscription() : null;
  let estat;
  if (MODE_PROVA) estat = "En mode prova els avisos no s'envien. Funcionaran quan connectem Supabase.";
  else if (!potPush) estat = esIOS && !esInstallada ? "Cal instal·lar l'app a la pantalla d'inici." : "Aquest navegador no admet avisos.";
  else if (Notification.permission === "denied") estat = "Avisos bloquejats. Activa'ls a la configuració del mòbil.";
  else estat = sub ? "Avisos actius en aquest mòbil." : "Avisos desactivats en aquest mòbil.";
  return {
    sub: true, pare: "menu", titol: "Avisos",
    cos: h`<div class="formulari">
      <p>Un sol avís cada matí amb el que tens avui, les tasques endarrerides i, per als adults, els permisos pendents.</p>
      ${esIOS && !esInstallada ? h`<p class="avis-caixa">A l'iPhone: toca <b>Compartir</b> → <b>Afegeix a la pantalla d'inici</b> i obre l'app des de la icona.</p>` : ""}
      <p class="targeta">${estat}</p>
      ${!MODE_PROVA && potPush ? h`<button class="boto primari ample" data-accio="push-activa">${sub ? "Torna a registrar" : "Activa els avisos"}</button>
        ${sub ? h`<button class="boto ample" data-accio="push-prova">Envia'm una prova</button>` : ""}` : ""}
      <details><summary>Diagnòstic</summary>
        <dl class="diagnostic">
          <dt>Dispositiu</dt><dd>${descripcioDispositiu()}</dd>
          <dt>Instal·lada</dt><dd>${esInstallada ? "Sí" : "No"}</dd>
          <dt>Push admès</dt><dd>${potPush ? "Sí" : "No"}</dd>
          <dt>Permís</dt><dd>${"Notification" in window ? Notification.permission : "—"}</dd>
          <dt>Subscripció</dt><dd>${sub ? new URL(sub.endpoint).host : "No"}</dd>
        </dl>
      </details>
    </div>`,
  };
}
function descripcioDispositiu() {
  const ua = navigator.userAgent;
  const ios = ua.match(/OS (\d+)_(\d+)/), android = ua.match(/Android (\d+(\.\d+)?)/);
  if (esIOS && ios) return `iOS ${ios[1]}.${ios[2]}`;
  if (android) return `Android ${android[1]}`;
  return navigator.platform || "Desconegut";
}
const b64aBytes = (b64) => Uint8Array.from(atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

function pantDades() {
  return {
    sub: true, pare: "menu", titol: "Dades i còpia",
    cos: h`<div class="formulari">
      <section class="targeta">
        <b>${MODE_PROVA ? "Mode prova" : "Connectada"}</b>
        <span>${MODE_PROVA ? "L'agenda i la resta de dades són d'exemple i només viuen en aquest mòbil." : "L'agenda ve del calendari de Google de la família. Tasques, compra, desitjos i préstecs de moment es desen en aquest mòbil."}</span>
      </section>
      <button class="boto ample" data-accio="exporta">Desa una còpia (fitxer)</button>
      <label class="boto ample" for="fitxer-importa">Recupera una còpia</label>
      <input id="fitxer-importa" type="file" accept="application/json,.json" class="oculta" data-accio="importa">
      <button class="boto perill ample" data-accio="reinicia">${MODE_PROVA ? "Torna a les dades d'exemple" : "Esborra les dades d'aquest mòbil"}</button>
    </div>`,
  };
}

// =============================================================
// 13 · Entrada: codi familiar i qui ets
// =============================================================
function pantCodi() {
  return {
    senseBarra: true, senseNav: true,
    cos: h`<form id="form-codi" class="entrada">
      <h1>Família</h1>
      <p>Escriu el codi de la família.</p>
      <label for="camp-codi" class="oculta">Codi</label>
      <input id="camp-codi" type="password" autocomplete="current-password" required placeholder="Codi">
      <button class="boto primari ample">Entra</button>
    </form>`,
    despres: () => {
      $("#form-codi").onsubmit = (ev) => { ev.preventDefault(); L.escriu("codi", $("#camp-codi").value.trim()); render(); };
    },
  };
}
function pantTriaPersona() {
  return {
    senseBarra: true, senseNav: true,
    cos: h`<div class="entrada"><h1>Qui ets?</h1>
      <div class="graella-persones">${C.MEMBRES.map((m) => h`<button data-accio="tria-persona" data-id="${m.id}">${inicial(m.id, "gran")}${m.nom}</button>`)}</div>
      <p class="buit">Ho pots canviar després al menú ⋮.</p></div>`,
  };
}

const PANTALLES = {
  inici: pantInici, agenda: pantAgenda, nou: pantNou, permis: pantPermis,
  tasques: pantTasques, tasca: pantTasca, "tasca-nova": pantTascaNova,
  compra: pantCompra, mes: pantMes, "desig-nou": pantDesigNou, "prestec-nou": pantPrestecNou,
  menu: (sub) => ({ persona: pantPersona, aspecte: pantAspecte, avisos: pantAvisos, dades: pantDades }[sub] ?? pantMenu)(),
};

// =============================================================
// 14 · Accions (delegació d'esdeveniments) i diàlegs
// =============================================================
function obreFull(cos) {
  const f = $("#full");
  f.innerHTML = `<div class="dins"><div class="agafador"></div>${val(cos)}</div>`;
  f.showModal();
}
$("#full").addEventListener("click", (ev) => { if (ev.target.id === "full") ev.target.close(); });

function confirma(text, etiqueta = "Llisca per esborrar →") {
  return new Promise((resol) => {
    const d = $("#dialeg-llisca"), r = $("#llisca");
    $("#llisca-text").textContent = text;
    $("#llisca-etiqueta").textContent = etiqueta;
    r.value = 0;
    const acaba = (ok) => { d.close(); resol(ok); };
    r.onchange = () => { if (Number(r.value) >= 95) acaba(true); else r.value = 0; };
    $("#llisca-cancel").onclick = () => acaba(false);
    d.oncancel = () => resol(false);
    d.showModal();
  });
}

const premut = (el) => {
  for (const b of el.parentElement.querySelectorAll(`[data-accio="${el.dataset.accio}"]`)) b.setAttribute("aria-pressed", String(b === el));
};

const ACCIONS = {
  enrere: (el) => torna(el.dataset.pare),
  "tanca-full": () => $("#full").close(),
  detall: (el) => obreDetall(el.dataset.id),

  // Agenda
  "ag-vista": (el) => { ag.vista = el.dataset.v; desaPref("agenda-vista", ag.vista); render(); },
  "ag-filtre": (el) => { ag.filtre = el.dataset.f; desaPref("agenda-filtre", ag.filtre); render(); },
  "ag-dia": (el) => { ag.dia = dataDe(el.dataset.dia); render(); },
  "ag-moure": (el) => {
    const n = Number(el.dataset.n);
    ag.dia = ag.vista === "mes" ? new Date(ag.dia.getFullYear(), ag.dia.getMonth() + n, 1) : sumaDies(ag.dia, 7 * n);
    render();
  },
  "mes-dia": (el) => { ag.dia = dataDe(el.dataset.dia); ag.vista = "dia"; desaPref("agenda-vista", "dia"); render(); },

  // Nou esdeveniment
  "nou-qui": (el) => { premut(el); actualitzaNou(); },
  "nou-permis": (el) => { premut(el); actualitzaNou(); if (el.dataset.t === "cost") $("#n-import").focus(); },

  async "esborra-esdev"(el) {
    const e = vistos.get(el.dataset.id);
    $("#full").close();
    if (!(await confirma(`Esborrar «${e?.titol}» del calendari?`))) return;
    try { await Agenda.esborra(el.dataset.id); vistos.delete(el.dataset.id); avisa("Esborrat."); render(); }
    catch (err) { avisa(err.message); }
  },

  // Permisos
  async "permis-si"(el) {
    const e = vistos.get(el.dataset.id);
    const comentari = $("#p-comentari")?.value.trim() ?? "";
    el.disabled = true;
    try {
      await Agenda.decideixPermis(e.id, { estat: "confirmat", qui: jo, comentari });
      Col.afegeix("historial", { titol: e.titol, persona: e.persona, tipus: e.permis?.tipus, estat: "confirmat", qui: jo, quan: new Date().toISOString(), comentari });
      avisa("Confirmat.");
      location.hash = "inici";
    } catch (err) { avisa(err.message); el.disabled = false; }
  },
  async "permis-no"(el) {
    const e = vistos.get(el.dataset.id);
    const comentari = $("#p-comentari")?.value.trim() ?? "";
    if (!(await confirma(`No autoritzar «${e.titol}»? Es traurà del calendari.`, "Llisca per confirmar →"))) return;
    try {
      await Agenda.esborra(e.id);
      vistos.delete(e.id);
      Col.afegeix("historial", { titol: e.titol, persona: e.persona, tipus: e.permis?.tipus, estat: "no", qui: jo, quan: new Date().toISOString(), comentari });
      avisa("No autoritzat. S'ha tret del calendari.");
      location.hash = "inici";
    } catch (err) { avisa(err.message); }
  },

  // Tasques
  "tasca-agafa": (el) => {
    Col.actualitza("tasques", el.dataset.id, (t) => {
      t.agafada = t.agafada?.persona === jo && t.agafada.dia === isoDia(avui()) ? null : { persona: jo, dia: isoDia(avui()) };
      avisa(t.agafada ? "És teva per avui." : "La tornes a deixar lliure.");
    });
    render();
  },
  "tasca-feta": (el) => {
    Col.actualitza("tasques", el.dataset.id, (t) => { (t.fetes ??= []).push({ persona: jo, quan: new Date().toISOString() }); t.agafada = null; });
    avisa("Feta. Comptador a zero.");
    render();
  },
  "tasques-filtre": (el) => { filtreTasques = el.dataset.f; desaPref("tasques-filtre", filtreTasques); render(); },
  "tasca-per": (el) => { premut(el); if ($("#form-tn")) actualitzaTascaNova(); },
  "tasca-accepta": (el) => {
    Col.actualitza("tasques", el.dataset.id, (t) => {
      t.assignada = { ...t.assignada, estat: "acceptada", quan: new Date().toISOString() };
      if (t.activa === false) { t.activa = true; if (!(t.fetes ?? []).length) t.creada = new Date().toISOString(); }
    });
    avisa("Acceptada. Ja és activa.");
    render();
  },
  "tasca-rebutja": (el) => {
    Col.actualitza("tasques", el.dataset.id, (t) => {
      // Si ja era activa (es proposava una tasca existent), torna a quedar lliure.
      t.assignada = t.activa === false ? { ...t.assignada, estat: "rebutjada", quan: new Date().toISOString() } : null;
    });
    avisa("D'acord. Ho veurà qui te l'ha proposada.");
    render();
  },
  "tasca-proposa": (el) => {
    const per = responsableTriat();
    if (!per) { avisa("Tria a qui la proposes."); return; }
    Col.actualitza("tasques", el.dataset.id, (t) => {
      t.assignada = per === jo
        ? { persona: jo, estat: "acceptada", per: jo, quan: new Date().toISOString() }
        : { persona: per, estat: "proposta", per: jo, quan: new Date().toISOString(), nota: $("#t-nota")?.value.trim() ?? "" };
    });
    avisa(per === jo ? "Ara és teva." : `Proposada a ${nom(per)}.`);
    render();
  },
  "tasca-retira": (el) => {
    Col.actualitza("tasques", el.dataset.id, (t) => { t.assignada = null; t.activa = true; });
    avisa("Proposta retirada. La tasca és lliure.");
    render();
  },
  "tasca-allibera": (el) => {
    Col.actualitza("tasques", el.dataset.id, (t) => { t.assignada = null; t.activa = true; });
    avisa("Ara és lliure.");
    render();
  },
  "tn-tipus": (el) => { tipusNova = el.dataset.t; premut(el); $("#tn-cada-camp").hidden = tipusNova !== "recurrent"; $("#tn-limit-camp").hidden = tipusNova !== "puntual"; },
  async "tasca-esborra"(el) {
    if (!(await confirma("Esborrar aquesta tasca i el seu historial?"))) return;
    Col.esborra("tasques", el.dataset.id);
    avisa("Tasca esborrada.");
    location.hash = "tasques";
  },

  // Compra
  "compra-marca": (el) => {
    Col.actualitza("compra", el.dataset.id, (i) => { i.comprat = el.checked; i.quan = new Date().toISOString(); });
    setTimeout(render, 250);
  },
  async "compra-buida"() {
    if (!(await confirma("Treure de la llista tot el que ja s'ha comprat?", "Llisca per treure →"))) return;
    Col.desa("compra", Col.llista("compra").filter((i) => !i.comprat));
    render();
  },

  // Més
  "desitjos-de": (el) => { deQui = el.dataset.id; render(); },
  desig: (el) => obreDesig(el.dataset.id),
  "desig-prioritat": (el) => { prioritatNova = el.dataset.p; premut(el); },
  async "desig-esborra"(el) {
    $("#full").close();
    if (!(await confirma("Esborrar aquest desig?"))) return;
    Col.esborra("desitjos", el.dataset.id);
    render();
  },
  async copia(el) {
    try { await navigator.clipboard.writeText(el.dataset.text); avisa("Enllaç copiat."); } catch { avisa("No s'ha pogut copiar."); }
  },
  "prestec-tria": (el) => { premut(el); $("#p-info span").textContent = `${nom(el.dataset.id)} ho haurà de confirmar.`; },
  "prestec-sentit": (el) => { sentitPrestec = el.dataset.s; premut(el); $("#p-qui-etiq").textContent = sentitPrestec === "deixo" ? "A qui" : "Qui te'ls deixa"; },
  "prestec-si": (el) => { Col.actualitza("prestecs", el.dataset.id, (p) => { p.estat = "actiu"; p.acceptat = new Date().toISOString(); }); avisa("Confirmat. El préstec ja compta."); render(); },
  "prestec-no": (el) => { Col.actualitza("prestecs", el.dataset.id, (p) => { p.estat = "rebutjat"; }); avisa("D'acord. Ho veurà qui l'ha creat."); render(); },
  "prestec-retorn": (el) => {
    let altre;
    Col.actualitza("prestecs", el.dataset.id, (p) => { p.estat = "retorn"; p.retornPer = jo; altre = altreDe(p, jo); });
    avisa(`Quan ${nom(altre)} ho confirmi, quedarà saldat.`);
    render();
  },
  "prestec-retornat-si": (el) => { Col.actualitza("prestecs", el.dataset.id, (p) => { p.estat = "retornat"; p.retornat = new Date().toISOString(); }); avisa("Saldat."); render(); },
  "prestec-encara": (el) => { Col.actualitza("prestecs", el.dataset.id, (p) => { p.estat = "actiu"; p.retornPer = null; }); avisa("D'acord, continua pendent."); render(); },
  async "prestec-esborra"(el) {
    if (!(await confirma("Esborrar aquest préstec?"))) return;
    Col.esborra("prestecs", el.dataset.id);
    render();
  },

  // Menú
  "tria-persona": (el) => { jo = el.dataset.id; desaPref("persona", jo); deQui = null; avisa(`Hola, ${nom(jo)}.`); vesA("inici"); },
  aspecte: (el) => { desaPref(el.dataset.k, el.dataset.v); aplicaAspecte(); render(); },
  daltonics: (el) => { desaPref("daltonics", el.checked); aplicaAspecte(); },
  async "oblida-codi"() {
    if (!(await confirma("Tancar la sessió en aquest mòbil?", "Llisca per tancar →"))) return;
    L.esborra("codi");
    render();
  },
  exporta: () => {
    const blob = new Blob([JSON.stringify(Col.exporta(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `familia-copia-${isoDia(new Date())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    avisa("Còpia desada.");
  },
  async reinicia() {
    if (!(await confirma(MODE_PROVA ? "Tornar a les dades d'exemple? Es perdrà el que hagis provat." : "Esborrar les tasques, la compra, els desitjos i els préstecs d'aquest mòbil?"))) return;
    Col.reinicia();
    avisa("Fet.");
    vesA("inici");
  },

  // Avisos
  async "push-activa"() {
    if (!C.VAPID_PUBLICA) { avisa("Falta la clau VAPID a config.js."); return; }
    try {
      if ((await Notification.requestPermission()) !== "granted") { avisa("Sense permís per als avisos."); render(); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64aBytes(C.VAPID_PUBLICA) }));
      await Dades.crida("push-prova", { metode: "POST", cos: { accio: "subscriu", persona: jo, subscripcio: sub.toJSON(), dispositiu: descripcioDispositiu() } });
      avisa("Avisos activats.");
    } catch (e) { avisa(e.message); }
    render();
  },
  async "push-prova"() {
    try {
      const d = await Dades.crida("push-prova", { metode: "POST", cos: { accio: "envia", persona: jo } });
      avisa(d.enviats ? "Enviat. Hauria d'arribar ara." : "No s'ha pogut enviar.");
    } catch (e) { avisa(e.message); }
  },
};

document.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-accio]");
  if (!el || el.type === "file" || el.type === "checkbox") return;
  const f = ACCIONS[el.dataset.accio];
  if (!f) return;
  if (el.tagName !== "A") ev.preventDefault();
  f(el, ev);
});
document.addEventListener("change", (ev) => {
  const el = ev.target;
  if (el.dataset.accio === "compra-marca" || el.dataset.accio === "daltonics") ACCIONS[el.dataset.accio](el);
  if (el.dataset.accio === "importa" && el.files[0]) {
    el.files[0].text().then((t) => { Col.importa(JSON.parse(t)); avisa("Còpia recuperada."); vesA("inici"); })
      .catch((e) => avisa(e.message));
  }
});

// =============================================================
// 15 · Inici de l'app
// =============================================================
window.addEventListener("hashchange", () => { sessionStorage.setItem("dins", "1"); render(); });
window.addEventListener("online", render);
aplicaAspecte();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
render();
