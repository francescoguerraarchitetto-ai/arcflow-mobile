// ArcFlow Ore – funzionamento senza rete: l'app viene salvata sul telefono e aggiornata quando c'è connessione
const CACHE='arcflow-ore-1.1.0';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','logo.png'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(K=>Promise.all(K.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e=>{ const r=e.request; if(r.method!=='GET' || new URL(r.url).origin!==location.origin) return;
  // rete prima (per ricevere gli aggiornamenti); con rete assente o lenta (oltre 3 s) si usa la copia salvata
  e.respondWith((async()=>{ const salvata=await caches.match(r, {ignoreSearch:true});
    const rete=fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(CACHE).then(x=>x.put(r,c)); } return res; });
    if(!salvata) return rete.catch(()=>caches.match('index.html'));
    return Promise.race([rete.catch(()=>salvata), new Promise(ok=>setTimeout(()=>ok(salvata),3000))]); })()); });
