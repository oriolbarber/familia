// Configuració pública de la PWA (aquí no hi va cap secret).
window.CONFIG = {
  // Supabase › Project Settings › API › Project URL + "/functions/v1".
  // Si es buida o conté "EL-TEU-PROJECTE", l'app funciona en MODE PROVA amb dades d'exemple.
  FUNCIONS_URL: "https://rxuchoduwgxatnxqjysf.supabase.co/functions/v1",

  // Clau pública VAPID (la que mostra app/eines/vapid.html). És pública per disseny.
  VAPID_PUBLICA: "",

  // Import (€) a partir del qual una activitat amb cost necessita permís.
  LLINDAR_COST: 20,

  // Membres: id estable, nom, rol (adult/jove), color i inicial (per a daltònics).
  // «google»: color de l'esdeveniment a Google Calendar quan és d'una sola persona
  //   (9 Blau nabiu, 6 Mandarina, 10 Alfàbrega, 3 Raïm…). Si és de diverses persones o de tothom, el del calendari.
  // «alies»: altres maneres d'escriure el nom als títols de Google Calendar (en minúscula, sense accents).
  MEMBRES: [
    { id: "oriol", nom: "Oriol", rol: "adult", color: "#1F5FBF", inicial: "O", google: "9", alies: ["uri"] },
    { id: "laura", nom: "Laura", rol: "adult", color: "#B4480F", inicial: "L", google: "6", alies: ["lau"] },
    { id: "bruna", nom: "Bruna", rol: "jove", color: "#0E7C73", inicial: "B", google: "10" },
    { id: "gael", nom: "Gael", rol: "jove", color: "#7A3FB8", inicial: "G", google: "3" },
  ],

  // Paraules del títol d'un esdeveniment que corresponen a més d'una persona.
  // (De qui és cada esdeveniment de Google es dedueix del títol: «Gael | …», «Bruna dentista», «LAU | fisio»…
  //  Si no hi ha cap nom, és de tota la família.)
  GRUPS: { urilau: ["oriol", "laura"] },
};
