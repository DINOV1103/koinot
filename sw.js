/* Koinot atmosferasi: internetsiz ishlash uchun service worker */
const V='koinot-v5';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||r.headers.has('range'))return;
  const u=new URL(r.url);
  if(u.hostname==='api.github.com')return;
  if(/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|webm|mp4)$/i.test(u.pathname))return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('./index.html',cp));return res;}).catch(()=>caches.match('./index.html')));
    return;
  }
  const ok=u.origin===self.location.origin||/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!ok)return;
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}return res;}).catch(()=>hit);
    return hit||net;
  }));
});
