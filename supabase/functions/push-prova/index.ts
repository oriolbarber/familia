// =============================================================
// Edge Function «push-prova» · Prova de concepte
// Desa subscripcions push i envia un avís de prova.
//
// Secrets necessaris:
//   VAPID_KEYS     JSON {publicKey, privateKey} en format JWK (eina app/eines/vapid.html)
//   VAPID_CONTACT  mailto:… (contacte per als serveis de push)
//   FAMILIA_CODI   el mateix codi que la funció «calendar»
// Automàtics de Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Rutes (POST, cos JSON):
//   {accio:"subscriu", persona, subscripcio, dispositiu}
//   {accio:"envia", persona?}   sense persona → a tothom
// =============================================================

import * as webpush from "jsr:@negrel/webpush@0.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-familia-codi, apikey, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(cos: unknown, status = 200): Response {
  return new Response(JSON.stringify(cos), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

let servidor: webpush.ApplicationServer | null = null;

async function appServer(): Promise<webpush.ApplicationServer> {
  if (servidor) return servidor;
  const claus = await webpush.importVapidKeys(JSON.parse(Deno.env.get("VAPID_KEYS") ?? "{}"), {
    extractable: false,
  });
  servidor = await webpush.ApplicationServer.new({
    contactInformation: Deno.env.get("VAPID_CONTACT") ?? "mailto:admin@example.com",
    vapidKeys: claus,
  });
  return servidor;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Mètode no permès" }, 405);

  const codi = Deno.env.get("FAMILIA_CODI");
  if (!codi || req.headers.get("x-familia-codi") !== codi) {
    return json({ error: "Codi familiar incorrecte" }, 401);
  }

  try {
    const cos = await req.json();

    if (cos.accio === "subscriu") {
      const s = cos.subscripcio;
      if (!cos.persona || !s?.endpoint || !s?.keys?.p256dh || !s?.keys?.auth) {
        return json({ error: "Subscripció incompleta" }, 400);
      }
      const { error } = await db.from("subscripcions_push").upsert({
        endpoint: s.endpoint,
        persona: cos.persona,
        p256dh: s.keys.p256dh,
        auth: s.keys.auth,
        dispositiu: String(cos.dispositiu ?? "").slice(0, 200),
        actualitzat: new Date().toISOString(),
      }, { onConflict: "endpoint" });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (cos.accio === "envia") {
      let q = db.from("subscripcions_push").select("*");
      if (cos.persona) q = q.eq("persona", cos.persona);
      const { data, error } = await q;
      if (error) return json({ error: error.message }, 500);

      const app = await appServer();
      const ara = new Date().toLocaleTimeString("ca-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" });
      const missatge = JSON.stringify({
        titol: "Família · prova",
        cos: `Avís de prova enviat a les ${ara}.`,
      });

      const resultats = [];
      for (const fila of data ?? []) {
        const sub = app.subscribe({ endpoint: fila.endpoint, keys: { p256dh: fila.p256dh, auth: fila.auth } });
        try {
          await sub.pushTextMessage(missatge, {});
          resultats.push({ persona: fila.persona, dispositiu: fila.dispositiu, ok: true });
        } catch (e) {
          const err = e as Error & { isGone?: () => boolean };
          // Subscripció caducada o revocada: s'esborra.
          if (typeof err.isGone === "function" && err.isGone()) {
            await db.from("subscripcions_push").delete().eq("endpoint", fila.endpoint);
          }
          resultats.push({ persona: fila.persona, dispositiu: fila.dispositiu, ok: false, error: err.message });
        }
      }
      return json({ enviats: resultats.filter((r) => r.ok).length, resultats });
    }

    return json({ error: "Acció desconeguda" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
