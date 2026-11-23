// =============================================================
// Edge Function «notes» · Notes tipus post-it compartides
//
// Secrets: FAMILIA_CODI (el mateix que «calendar»)
// Automàtics de Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// GET                                    les 200 notes més recents
// POST {accio:"crea", persona, text, color}
// POST {accio:"edita", persona, id, text, color}
// POST {accio:"esborra", persona, id}
// =============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-familia-codi, apikey, authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (cos: unknown, status = 200) =>
  new Response(JSON.stringify(cos), { status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });

const COLORS = new Set(["groc", "rosa", "verd", "blau", "taronja", "lila"]);
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const codi = Deno.env.get("FAMILIA_CODI");
  if (!codi || req.headers.get("x-familia-codi") !== codi) return json({ error: "Codi familiar incorrecte" }, 401);

  try {
    if (req.method === "GET") {
      const { data, error } = await db.from("notes").select("*").order("creada", { ascending: false }).limit(200);
      if (error) return json({ error: error.message }, 500);
      return json({ notes: data });
    }
    if (req.method !== "POST") return json({ error: "Mètode no permès" }, 405);

    const cos = await req.json();
    const persona = String(cos.persona ?? "").slice(0, 40);
    if (!persona) return json({ error: "Falta qui ho fa" }, 400);
    const text = String(cos.text ?? "").trim().slice(0, 500);
    const color = COLORS.has(cos.color) ? cos.color : "groc";

    if (cos.accio === "crea") {
      if (!text) return json({ error: "La nota és buida" }, 400);
      const { data, error } = await db.from("notes").insert({ text, color, autor: persona }).select().single();
      if (error) return json({ error: error.message }, 500);
      return json({ nota: data }, 201);
    }
    if (cos.accio === "edita") {
      if (!text) return json({ error: "La nota és buida" }, 400);
      const { data, error } = await db.from("notes").update({ text, color, actualitzada: new Date().toISOString() })
        .eq("id", String(cos.id)).select().single();
      if (error) return json({ error: error.message }, 500);
      return json({ nota: data });
    }
    if (cos.accio === "esborra") {
      const { error } = await db.from("notes").delete().eq("id", String(cos.id));
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }
    return json({ error: "Acció desconeguda" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
