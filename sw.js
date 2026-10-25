// Offline support for the home-screen app: keep the app's files on the device and serve them with no internet.
// The build stamps VERSION; a new upload gets a new cache and the old one is removed.
// A new version takes over straight away (skipWaiting + claim); sw-register.js then reloads the page into it.
const VERSION='pc-dde0d1b95c';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Serve from the device first; when online, refresh the saved copy in the background for next time.
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(caches.open(VERSION).then(async c=>{
  const hit=await c.match(e.request,{ignoreSearch:true});
  const fresh=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r;}).catch(()=>null);
  return hit||(await fresh)||c.match('index.html');
 }));
});
