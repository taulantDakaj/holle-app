/* Holle-App: App funktioniert auch ohne Netz (Seiten und Programmdateien aus dem Speicher) */
const CACHE = 'holle-app-v2';
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const seiten = ['./', './admin.html'];
    const dateien = new Set(['./logo.png', './plz.json', './favicon.png', .../*DATEIEN*/[]]);
    for (const s of seiten) {
      try {
        const r = await fetch(s, { cache: 'no-cache' });
        const t = await r.clone().text();
        await c.put(s, r);
        (t.match(/(?:\.\/)?assets\/[^"'\s>)]+/g) || []).forEach((a) => dateien.add('./' + a.replace(/^\.\//, '')));
      } catch (x) { /* offline beim Installieren */ }
    }
    await Promise.all([...dateien].map((d) => c.add(d).catch(() => {})));
  })());
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const gleich = url.origin === self.location.origin;
  const schrift = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  const bild = /\/storage\/v1\/object\/public\/tierbilder\//.test(url.pathname);
  if (!gleich && !schrift && !bild) return; // Daten (Supabase) nicht hier zwischenspeichern
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    // Seiten: erst Netz, sonst Speicher
    e.respondWith(fetch(req).then((r) => { const k = r.clone(); caches.open(CACHE).then((c) => c.put(req, k)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((r) => r || caches.match('./admin.html'))));
    return;
  }
  // Programmdateien, Schriften, Tierbilder: Speicher zuerst, im Hintergrund auffrischen
  e.respondWith(caches.match(req, { ignoreVary: true, ignoreSearch: gleich }).then((hit) => {
    const netz = fetch(req).then((r) => { if (r && (r.ok || r.type === 'opaque')) { const k = r.clone(); caches.open(CACHE).then((c) => c.put(req, k)); } return r; }).catch(() => hit);
    return hit || netz;
  }));
});

/* Mitteilungen von Geflügelverkauf Holle */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Geflügelverkauf Holle', {
    body: d.body || '', icon: './icon-192.png', badge: './icon-192.png', data: { url: d.url || './#/mein' },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const ziel = new URL((e.notification.data && e.notification.data.url) || './#/mein', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    const c = cs.find((x) => x.url.startsWith(self.registration.scope));
    if (c) { c.navigate(ziel).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(ziel);
  }));
});
