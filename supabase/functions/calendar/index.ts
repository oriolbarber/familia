// =============================================================
// Edge Function «calendar» · Prova de concepte
// Llegeix i escriu el calendari compartit «Família» de Google
// amb un compte de servei (sense OAuth d'usuari).
//
// Secrets necessaris (Supabase › Edge Functions › Secrets):
//   GOOGLE_SA_JSON      contingut sencer del fitxer JSON de la clau
//   GOOGLE_CALENDAR_ID  id del calendari «Família» (…@group.calendar.google.com)
//   FAMILIA_CODI        codi compartit que la PWA envia a la capçalera x-familia-codi
//
// Rutes:
//   GET    ?des=ISO&fins=ISO      esdeveniments entre dues dates
//   POST   {titol, inici, fi, persona}   crea un esdeveniment
//   DELETE ?id=EVENT_ID           esborra un esdeveniment
// =============================================================

const TZ = "Europe/Madrid";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-familia-codi, apikey, authorization",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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

// deno-lint-ignore no-explicit-any
function simplifica(e: any) {
  return {
    id: e.id,
    titol: e.summary ?? "(sense títol)",
    inici: e.start?.dateTime ?? e.start?.date,
    fi: e.end?.dateTime ?? e.end?.date,
    totElDia: !e.start?.dateTime,
    lloc: e.location ?? null,
    persona: e.extendedProperties?.private?.persona ?? null,
  };
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

    if (req.method === "GET") {
      const des = url.searchParams.get("des") ?? new Date().toISOString();
      const fins = url.searchParams.get("fins") ??
        new Date(Date.now() + 7 * 864e5).toISOString();
      const q = new URLSearchParams({
        timeMin: des,
        timeMax: fins,
        singleEvents: "true",
        orderBy: "startTime",
        timeZone: TZ,
        maxResults: "250",
      });
      const r = await google(`?${q}`);
      const d = await r.json();
      if (!r.ok) return json({ error: d.error?.message ?? "Error de Google" }, r.status);
      return json({ esdeveniments: (d.items ?? []).map(simplifica) });
    }

    if (req.method === "POST") {
      const { titol, inici, fi, persona } = await req.json();
      if (!titol || !inici || !fi) return json({ error: "Calen titol, inici i fi" }, 400);
      const cos = {
        summary: titol,
        start: { dateTime: inici, timeZone: TZ },
        end: { dateTime: fi, timeZone: TZ },
        // Sense «attendees»: un compte de servei no pot convidar persones.
        extendedProperties: { private: { persona: persona ?? "", origen: "app" } },
      };
      const r = await google("", { method: "POST", body: JSON.stringify(cos) });
      const d = await r.json();
      if (!r.ok) return json({ error: d.error?.message ?? "Error de Google" }, r.status);
      return json({ esdeveniment: simplifica(d) }, 201);
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "Falta id" }, 400);
      const r = await google(`/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!r.ok && r.status !== 410) {
        const d = await r.json().catch(() => ({}));
        return json({ error: d.error?.message ?? "Error de Google" }, r.status);
      }
      return json({ ok: true });
    }

    return json({ error: "Mètode no permès" }, 405);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
