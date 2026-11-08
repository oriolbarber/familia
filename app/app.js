// =============================================================
// Família · Prova de concepte
// Agenda llegida de Google Calendar (via Edge Function) + avisos push.
// =============================================================
"use strict";

const C = window.CONFIG;
const $ = (s) => document.querySelector(s);

// ---------- Emmagatzematge local segur ----------
const desa = {
  llegeix(k, defecte = null) {
    try { const v = localStorage.getItem(k); return v === null ? defecte : JSON.parse(v); }
    catch { return defecte; }
  },
  escriu(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sense espai o bloquejat */ } },
  esborra(k) { try { localStorage.removeItem(k); } catch { /* res */ } },
};

// ---------- Missatge flotant ----------
let tempsToast;
function avisa(text) {
  const t = $("#avis-flotant");
  t.textContent = text;
  t.hidden = false;
  clearTimeout(tempsToast);
  tempsToast = setTimeout(() => { t.hidden = true; }, 3500);
}

// ---------- Crides a les Edge Functions ----------
async function crida(funcio, opcions = {}) {
  const r = await fetch(`${C.FUNCIONS_URL}/${funcio}${opcions.query ?? ""}`, {
    method: opcions.metode ?? "GET",
    headers: { "Content-Type": "application/json", "x-familia-codi": desa.llegeix("codi", "") },
    body: opcions.cos ? JSON.stringify(opcions.cos) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { desa.esborra("codi"); mostraPantalla(); }
  if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`);
  return d;
}

// ---------- Membres ----------
const membre = (id) => C.MEMBRES.find((m) => m.id === id);

function inicial(m) {
  const s = document.createElement("span");
  s.className = "inicial";
  s.style.background = m?.color ?? "#6b7280";
  s.textContent = m?.inicial ?? "·";
  s.title = m?.nom ?? "Sense persona";
  return s;
}

function pintaMembres() {
  const actual = desa.llegeix("persona");
  const cont = $("#membres");
  cont.replaceChildren();
  for (const m of C.MEMBRES) {
    const b = document.createElement("button");
    b.className = "xip";
    b.setAttribute("aria-pressed", String(m.id === actual));
    b.append(inicial(m), m.nom);
    b.onclick = () => { desa.escriu("persona", m.id); pintaMembres(); estatPush(); };
    cont.append(b);
  }
}

// ---------- Agenda setmanal ----------
let desplacament = 0; // setmanes respecte a l'actual

function iniciSetmana(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7); // dilluns
  return d;
}

const fmtDia = new Intl.DateTimeFormat("ca-ES", { weekday: "long", day: "numeric", month: "long" });
const fmtHora = new Intl.DateTimeFormat("ca-ES", { hour: "2-digit", minute: "2-digit" });
const fmtCurt = new Intl.DateTimeFormat("ca-ES", { day: "numeric", month: "short" });

async function carregaAgenda() {
  const des = iniciSetmana(desplacament);
  const fins = new Date(des); fins.setDate(fins.getDate() + 7);
  const clau = `agenda:${des.toISOString().slice(0, 10)}`;
  const ultimDia = new Date(fins); ultimDia.setDate(ultimDia.getDate() - 1);
  $("#titol-setmana").textContent = desplacament === 0
    ? "Aquesta setmana"
    : `${fmtCurt.format(des)} – ${fmtCurt.format(ultimDia)}`;

  const avis = $("#avis-agenda");
  avis.hidden = true;
  const desat = desa.llegeix(clau);
  if (desat) pintaAgenda(desat.esdeveniments, des);

  try {
    const d = await crida("calendar", { query: `?des=${des.toISOString()}&fins=${fins.toISOString()}` });
    desa.escriu(clau, { esdeveniments: d.esdeveniments, quan: Date.now() });
    pintaAgenda(d.esdeveniments, des);
  } catch (e) {
    avis.hidden = false;
    avis.textContent = desat
      ? `Mostrant la còpia desada (${fmtHora.format(new Date(desat.quan))}). ${e.message}`
      : `No s'ha pogut llegir el calendari: ${e.message}`;
    if (!desat) $("#agenda").replaceChildren();
  }
}

function pintaAgenda(llista, des) {
  const ol = $("#agenda");
  ol.replaceChildren();
  const avui = new Date().toDateString();
  for (let i = 0; i < 7; i++) {
    const dia = new Date(des); dia.setDate(dia.getDate() + i);
    const delDia = llista.filter((e) => {
      const ini = e.totElDia ? new Date(e.inici + "T00:00") : new Date(e.inici);
      return ini.toDateString() === dia.toDateString();
    });
    if (!delDia.length && dia.toDateString() !== avui) continue;

    const cap = document.createElement("li");
    cap.className = "dia" + (dia.toDateString() === avui ? " avui" : "");
    const nomDia = fmtDia.format(dia);
    cap.textContent = (dia.toDateString() === avui ? "Avui · " : "") + nomDia[0].toUpperCase() + nomDia.slice(1);
    ol.append(cap);

    if (!delDia.length) {
      const b = document.createElement("li");
      b.className = "buit";
      b.textContent = "Res previst";
      ol.append(b);
    }
    for (const e of delDia) {
      const li = document.createElement("li");
      li.className = "esdeveniment";
      const hora = document.createElement("span");
      hora.className = "hora";
      hora.textContent = e.totElDia ? "Tot el dia" : fmtHora.format(new Date(e.inici));
      const titol = document.createElement("span");
      titol.className = "titol";
      titol.textContent = e.titol;
      li.append(hora, inicial(membre(e.persona)), titol);
      if (e.titol.startsWith("Prova app")) {
        const x = document.createElement("button");
        x.textContent = "✕";
        x.setAttribute("aria-label", "Esborra");
        x.onclick = () => confirmaEsborrat(`Esborrar «${e.titol}» del calendari?`, () => esborraEsdeveniment(e.id));
        li.append(x);
      }
      ol.append(li);
    }
  }
}

async function creaProva() {
  const persona = desa.llegeix("persona");
  if (!persona) { avisa("Tria primer qui ets."); return; }
  const inici = new Date(); inici.setMinutes(0, 0, 0); inici.setHours(inici.getHours() + 1);
  const fi = new Date(inici); fi.setHours(fi.getHours() + 1);
  const b = $("#crea-prova"); b.disabled = true;
  try {
    await crida("calendar", {
      metode: "POST",
      cos: { titol: `Prova app (${membre(persona).nom})`, inici: inici.toISOString(), fi: fi.toISOString(), persona },
    });
    avisa("Creat. Mira'l també a Google Calendar.");
    desplacament = 0;
    await carregaAgenda();
  } catch (e) { avisa(e.message); }
  finally { b.disabled = false; }
}

async function esborraEsdeveniment(id) {
  try {
    await crida("calendar", { metode: "DELETE", query: `?id=${encodeURIComponent(id)}` });
    avisa("Esborrat.");
    await carregaAgenda();
  } catch (e) { avisa(e.message); }
}

// ---------- Confirmació lliscant ----------
function confirmaEsborrat(text, accio) {
  const d = $("#dialeg-esborra");
  const r = $("#llisca");
  $("#dialeg-text").textContent = text;
  r.value = 0;
  r.oninput = () => {};
  r.onchange = () => {
    if (Number(r.value) >= 95) { d.close(); accio(); }
    else r.value = 0;
  };
  $("#dialeg-cancel").onclick = () => d.close();
  d.showModal();
}

// ---------- Avisos push ----------
const esIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const esInstallada = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const potPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function b64aBytes(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function subscripcioActual() {
  if (!potPush) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

async function estatPush() {
  const p = $("#estat-push");
  $("#avis-ios").hidden = !(esIOS && !esInstallada);
  if (!potPush) {
    p.textContent = esIOS && !esInstallada
      ? "Cal instal·lar l'app a la pantalla d'inici."
      : "Aquest navegador no admet avisos push.";
    $("#activa-push").disabled = true;
    return;
  }
  const sub = await subscripcioActual();
  const permis = Notification.permission;
  if (permis === "denied") p.textContent = "Avisos bloquejats. Activa'ls a la configuració del mòbil.";
  else if (sub) p.textContent = "Avisos actius en aquest mòbil.";
  else p.textContent = "Avisos desactivats en aquest mòbil.";
  $("#activa-push").textContent = sub ? "Torna a registrar" : "Activa els avisos";
  $("#prova-push").hidden = !sub;
  $("#prova-tothom").hidden = !sub;
  pintaDiagnostic(sub);
}

async function activaPush() {
  const persona = desa.llegeix("persona");
  if (!persona) { avisa("Tria primer qui ets."); return; }
  if (!C.VAPID_PUBLICA) { avisa("Falta la clau VAPID a config.js."); return; }
  try {
    const permis = await Notification.requestPermission();
    if (permis !== "granted") { avisa("Sense permís per als avisos."); await estatPush(); return; }
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: b64aBytes(C.VAPID_PUBLICA),
      });
    }
    await crida("push-prova", {
      metode: "POST",
      cos: { accio: "subscriu", persona, subscripcio: sub.toJSON(), dispositiu: descripcioDispositiu() },
    });
    avisa("Avisos activats.");
  } catch (e) { avisa(e.message); }
  await estatPush();
}

async function enviaProva(aTothom) {
  try {
    const d = await crida("push-prova", {
      metode: "POST",
      cos: { accio: "envia", persona: aTothom ? undefined : desa.llegeix("persona") },
    });
    const fallits = d.resultats.filter((r) => !r.ok);
    avisa(fallits.length
      ? `Enviats ${d.enviats}; han fallat ${fallits.length}.`
      : `Enviats ${d.enviats}.`);
  } catch (e) { avisa(e.message); }
}

// ---------- Diagnòstic (per omplir la taula de proves) ----------
function descripcioDispositiu() {
  const ua = navigator.userAgent;
  const ios = ua.match(/OS (\d+)_(\d+)/);
  const android = ua.match(/Android (\d+(\.\d+)?)/);
  if (esIOS && ios) return `iOS ${ios[1]}.${ios[2]}`;
  if (android) return `Android ${android[1]}`;
  return navigator.platform || "Desconegut";
}

function pintaDiagnostic(sub) {
  const files = [
    ["Dispositiu", descripcioDispositiu()],
    ["Instal·lada", esInstallada ? "Sí" : "No"],
    ["Push admès", potPush ? "Sí" : "No"],
    ["Permís", "Notification" in window ? Notification.permission : "—"],
    ["Subscripció", sub ? "Sí" : "No"],
    ["Servei push", sub ? new URL(sub.endpoint).host : "—"],
  ];
  const dl = $("#diagnostic");
  dl.replaceChildren();
  for (const [k, v] of files) {
    const dt = document.createElement("dt"); dt.textContent = k;
    const dd = document.createElement("dd"); dd.textContent = v;
    dl.append(dt, dd);
  }
}

// ---------- Pantalles i inici ----------
function mostraPantalla() {
  const teCodi = !!desa.llegeix("codi");
  $("#pantalla-codi").hidden = teCodi;
  $("#pantalla-app").hidden = !teCodi;
  if (teCodi) { pintaMembres(); carregaAgenda(); estatPush(); }
}

function estatXarxa() { $("#estat-xarxa").hidden = navigator.onLine; }

function inicia() {
  $("#form-codi").onsubmit = (ev) => {
    ev.preventDefault();
    desa.escriu("codi", $("#camp-codi").value.trim());
    mostraPantalla();
  };
  $("#setmana-ant").onclick = () => { desplacament--; carregaAgenda(); };
  $("#setmana-seg").onclick = () => { desplacament++; carregaAgenda(); };
  $("#crea-prova").onclick = creaProva;
  $("#activa-push").onclick = activaPush;
  $("#prova-push").onclick = () => enviaProva(false);
  $("#prova-tothom").onclick = () => enviaProva(true);
  $("#surt").onclick = () => confirmaEsborrat("Oblidar el codi en aquest mòbil?", () => { desa.esborra("codi"); mostraPantalla(); });
  addEventListener("online", () => { estatXarxa(); carregaAgenda(); });
  addEventListener("offline", estatXarxa);
  estatXarxa();

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
  mostraPantalla();
}

inicia();
