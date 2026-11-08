// Service worker · Família (prova de concepte)
// Puja VERSIO a cada canvi de fitxers perquè els mòbils s'actualitzin.
const VERSIO = "v1-1";
const FITXERS = [
  "./", "index.html", "estil.css", "config.js", "js/dades.js", "js/app.js", "manifest.webmanifest",
  "fonts/atkinson-400.woff2", "fonts/atkinson-700.woff2",
  "icones/icona-192.png", "icones/icona-512.png", "icones/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSIO).then((c) => c.addAll(FITXERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((claus) => Promise.all(claus.filter((k) => k !== VERSIO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Fitxers propis: xarxa primer, còpia si no n'hi ha. Les crides a Supabase no passen per la memòria cau.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copia = r.clone();
        caches.open(VERSIO).then((c) => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { cos: e.data?.text() }; }
  e.waitUntil(self.registration.showNotification(d.titol ?? "Família", {
    body: d.cos ?? "",
    icon: "icones/icona-192.png",
    badge: "icones/icona-192.png",
    data: { url: d.url ?? "./" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const finestres = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (finestres.length) return finestres[0].focus();
    return self.clients.openWindow(e.notification.data?.url ?? "./");
  })());
});
