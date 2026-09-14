const CACHE="portal-girimulyo2-v1";
const assets=[
"./",
"./index.html",
"./manifest.json"
];

self.addEventListener("install",event=>{
 event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(assets))
 );
 self.skipWaiting();
});

self.addEventListener("activate",event=>{
 event.waitUntil(
  caches.keys().then(keys=>
   Promise.all(keys.map(key=>{
    if(key!==CACHE) return caches.delete(key);
   }))
  )
 );
});

self.addEventListener("fetch",event=>{
 event.respondWith(
  caches.match(event.request).then(response=>response || fetch(event.request))
 );
});
