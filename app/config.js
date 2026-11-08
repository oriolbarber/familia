// Configuració pública de la PWA (aquí no hi va cap secret).
window.CONFIG = {
  // Supabase › Project Settings › API › Project URL + "/functions/v1"
  FUNCIONS_URL: "https://EL-TEU-PROJECTE.supabase.co/functions/v1",

  // Clau pública VAPID (la que mostra app/eines/vapid.html). És pública per disseny.
  VAPID_PUBLICA: "",

  // Membres de la família: id estable, nom visible, color i inicial (per a daltònics).
  MEMBRES: [
    { id: "oriol", nom: "Oriol", color: "#2f6fd6", inicial: "O" },
    { id: "adult2", nom: "Adult 2", color: "#c2410c", inicial: "A" },
    { id: "jove1", nom: "Jove 1", color: "#15803d", inicial: "J" },
    { id: "jove2", nom: "Jove 2", color: "#9333ea", inicial: "K" },
  ],
};
