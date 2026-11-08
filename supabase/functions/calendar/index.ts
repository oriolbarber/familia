// =============================================================
// Edge Function «calendar» · Prova de concepte
// Llegeix i escriu el calendari compartit «Família» de Google
// amb un compte de servei (sense OAuth d'usuari).
//
// Secrets necessaris (Supabase › Edge Functions › Secrets):
//   GOOGLE_SA_JSON      contingut sencer del fitxer JSON de la clau
//   GOOGLE_CALENDAR_ID  id del calendari compartit de la família («GLOB»)
//   MEMBRES_CORREUS     (opcional) {"correu@gmail.com":"id-membre", …} per saber de qui és
//                       un esdeveniment creat directament a Google Calendar
//   FAMILIA_CODI        codi compartit que la PWA envia a la capçalera x-familia-codi
//
// Rutes:
//   GET    ?des=ISO&fins=ISO      esdeveniments entre dues dates
//   POST   {titol, inici, fi, totElDia, persona, lloc, nota, permis}   crea un esdeveniment
//   PATCH  ?id=EVENT_ID {permis_estat, permis_qui, permis_comentari}   decideix un permís
//   DELETE ?id=EVENT_ID           esborra un esdeveniment
// =============================================================

const TZ = "Europe/Madrid";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-familia-codi, apikey, authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

function json(cos: unknown, status = 200): Response {
  return new Response(JSON.stringify(cos), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

// ---------- Autenticació amb Google (JWT del compte de servei) ----------

function b64url(dades: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof dades === "string"
    ? new TextEncoder().encode(dades)
    : new Uint8Array(dades as ArrayBuffer);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importaClau(pem: string): Promise<CryptoKey> {
  const cos = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(cos), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function signaJwt(email: string, pem: string, ara = Math.floor(Date.now() / 1000)): Promise<string> {
  const capcalera = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const dades = b64url(JSON.stringify({
    iss: email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: ara,
    exp: ara + 3600,
  }));
  const entrada = `${capcalera}.${dades}`;
  const clau = await importaClau(pem);
  const signatura = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", clau, new TextEncoder().encode(entrada));
  return `${entrada}.${b64url(signatura)}`;
}

let testimoni: { valor: string; caduca: number } | null = null;

async function testimoniGoogle(): Promise<string> {
  if (testimoni && testimoni.caduca > Date.now() + 60_000) return testimoni.valor;
  const sa = JSON.parse(Deno.env.get("GOOGLE_SA_JSON") ?? "{}");
  if (!sa.client_email || !sa.private_key) throw new Error("Falta el secret GOOGLE_SA_JSON");
  const assertion = await signaJwt(sa.client_email, sa.private_key);
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`Google token: ${d.error_description ?? d.error ?? r.status}`);
  testimoni = { valor: d.access_token, caduca: Date.now() + d.expires_in * 1000 };
  return testimoni.valor;
}

async function google(cami: string, opcions: RequestInit = {}): Promise<Response> {
  const cal = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!cal) throw new Error("Falta el secret GOOGLE_CALENDAR_ID");
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal)}/events${cami}`;
  return fetch(url, {
    ...opcions,
    headers: {
      Authorization: `Bearer ${await testimoniGoogle()}`,
      "Content-Type": "application/json",
      ...(opcions.headers ?? {}),
    },
  });
}

// ---------- Format que rep la PWA ----------

const PREFIX = "[Pendent] ";

// Correu de Google → id de membre (secret MEMBRES_CORREUS, p. ex. {"nom@gmail.com":"oriol"}).
// Serveix per saber de qui és un esdeveniment creat fora de l'app (directament a Google Calendar).
function correus(): Record<string, string> {
  try { return JSON.parse(Deno.env.get("MEMBRES_CORREUS") ?? "{}"); } catch { return {}; }
}

// deno-lint-ignore no-explicit-any
function simplifica(e: any, mapa = correus()) {
  const p = e.extendedProperties?.private ?? {};
  const titol = (e.summary ?? "(sense títol)").replace(PREFIX, "");
  return {
    id: e.id,
    titol,
    inici: e.start?.dateTime ?? e.start?.date,
    fi: e.end?.dateTime ?? e.end?.date,
    totElDia: !e.start?.dateTime,
    lloc: e.location ?? null,
    nota: p.nota || null,
    persona: p.persona || mapa[e.creator?.email ?? ""] || null,
    permis: p.permis_tipus
      ? {
        tipus: p.permis_tipus,
        import: p.permis_import ? Number(p.permis_import) : null,
        estat: p.permis_estat || "pendent",
        qui: p.permis_qui || null,
        comentari: p.permis_comentari || null,
      }
      : null,
  };
}

// deno-lint-ignore no-explicit-any
function errorGoogle(d: any, status: number) {
  return json({ error: d?.error?.message ?? "Error de Google" }, status);
}

// ---------- Servidor ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const codi = Deno.env.get("FAMILIA_CODI");
  if (!codi || req.headers.get("x-familia-codi") !== codi) {
    return json({ error: "Codi familiar incorrecte" }, 401);
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (req.method === "GET") {
      const des = url.searchParams.get("des") ?? new Date().toISOString();
      const fins = url.searchParams.get("fins") ?? new Date(Date.now() + 7 * 864e5).toISOString();
      const mapa = correus();
      const items = [];
      let pagina: string | undefined;
      do {
        const q = new URLSearchParams({
          timeMin: des, timeMax: fins, singleEvents: "true", orderBy: "startTime", timeZone: TZ, maxResults: "250",
        });
        if (pagina) q.set("pageToken", pagina);
        const r = await google(`?${q}`);
        const d = await r.json();
        if (!r.ok) return errorGoogle(d, r.status);
        items.push(...(d.items ?? []));
        pagina = d.nextPageToken;
      } while (pagina && items.length < 1000);
      return json({ esdeveniments: items.filter((e) => e.status !== "cancelled").map((e) => simplifica(e, mapa)) });
    }

    if (req.method === "POST") {
      const { titol, inici, fi, totElDia, persona, lloc, nota, permis } = await req.json();
      if (!titol || !inici || !fi) return json({ error: "Calen titol, inici i fi" }, 400);
      const pendent = permis?.estat === "pendent";
      const privat: Record<string, string> = { persona: persona ?? "", origen: "app" };
      if (nota) privat.nota = String(nota).slice(0, 500);
      if (permis?.tipus) {
        privat.permis_tipus = String(permis.tipus);
        privat.permis_estat = pendent ? "pendent" : "confirmat";
        if (permis.import != null) privat.permis_import = String(permis.import);
        if (permis.qui) privat.permis_qui = String(permis.qui);
      }
      const cos = {
        summary: (pendent ? PREFIX : "") + titol,
        location: lloc ?? undefined,
        start: totElDia ? { date: inici } : { dateTime: inici, timeZone: TZ },
        end: totElDia ? { date: fi } : { dateTime: fi, timeZone: TZ },
        // Sense «attendees»: un compte de servei no pot convidar persones.
        extendedProperties: { private: privat },
      };
      const r = await google("", { method: "POST", body: JSON.stringify(cos) });
      const d = await r.json();
      if (!r.ok) return errorGoogle(d, r.status);
      return json({ esdeveniment: simplifica(d) }, 201);
    }

    if (req.method === "PATCH") {
      // Decisió sobre un permís: {permis_estat:"confirmat", permis_qui, permis_comentari}
      if (!id) return json({ error: "Falta id" }, 400);
      const { permis_estat, permis_qui, permis_comentari } = await req.json();
      const r0 = await google(`/${encodeURIComponent(id)}`);
      const e = await r0.json();
      if (!r0.ok) return errorGoogle(e, r0.status);
      const privat = { ...(e.extendedProperties?.private ?? {}) };
      privat.permis_estat = permis_estat === "confirmat" ? "confirmat" : "pendent";
      if (permis_qui) privat.permis_qui = String(permis_qui);
      if (permis_comentari) privat.permis_comentari = String(permis_comentari).slice(0, 300);
      const titol = (e.summary ?? "").replace(PREFIX, "");
      const r = await google(`/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          summary: (privat.permis_estat === "pendent" ? PREFIX : "") + titol,
          extendedProperties: { private: privat },
        }),
      });
      const d = await r.json();
      if (!r.ok) return errorGoogle(d, r.status);
      return json({ esdeveniment: simplifica(d) });
    }

    if (req.method === "DELETE") {
      if (!id) return json({ error: "Falta id" }, 400);
      const r = await google(`/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!r.ok && r.status !== 410) return errorGoogle(await r.json().catch(() => ({})), r.status);
      return json({ ok: true });
    }

    return json({ error: "Mètode no permès" }, 405);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
