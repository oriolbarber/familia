// Configuració pública de la PWA (aquí no hi va cap secret).
window.CONFIG = {
  // Supabase › Project Settings › API › Project URL + "/functions/v1".
  // Mentre contingui "EL-TEU-PROJECTE", l'app funciona en MODE PROVA amb dades d'exemple.
  FUNCIONS_URL: "https://EL-TEU-PROJECTE.supabase.co/functions/v1",

  // Clau pública VAPID (la que mostra app/eines/vapid.html). És pública per disseny.
  VAPID_PUBLICA: "",

  // Import (€) a partir del qual una activitat amb cost necessita permís.
  LLINDAR_COST: 20,

  // Membres: id estable, nom, rol (adult/jove), color i inicial (per a daltònics).
  // Els correus NO van aquí (repositori públic): van al secret MEMBRES_CORREUS de Supabase.
  MEMBRES: [
    { id: "oriol", nom: "Oriol", rol: "adult", color: "#1F5FBF", inicial: "O" },
    { id: "adult2", nom: "Adult 2", rol: "adult", color: "#B4480F", inicial: "A" },
    { id: "jove1", nom: "Jove 1", rol: "jove", color: "#0E7C73", inicial: "1" },
    { id: "jove2", nom: "Jove 2", rol: "jove", color: "#7A3FB8", inicial: "2" },
  ],
};
