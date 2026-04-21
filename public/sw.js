// public/sw.js
// Service Worker para CardVirtual — tarjetas instalables como PWA.

const VERSION    = 'cv-v1'
const CACHE_NAME = `cardvirtual-${VERSION}`

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE_NAME))
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('cardvirtual-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // No interceptar rutas privadas
  const skip = ['/dashboard', '/admin', '/api', '/auth']
  if (skip.some(p => url.pathname.startsWith(p))) return

  event.respondWith(
    fetch(request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(request, clone))
        }
        return res
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached
          if (request.headers.get('Accept')?.includes('text/html')) {
            return new Response(
              `<!doctype html><html lang="es"><head><meta charset="UTF-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <title>Sin conexión</title>
              <style>
                body{font-family:system-ui,sans-serif;display:flex;align-items:center;
                justify-content:center;min-height:100vh;margin:0;background:#f5f7ff;
                flex-direction:column;gap:16px;text-align:center;padding:24px}
                .icon{font-size:3rem} h1{font-size:1.2rem;font-weight:700;color:#0d1236}
                p{font-size:.9rem;color:#7b84ad;max-width:280px;line-height:1.6}
                button{background:#4b6cf7;color:#fff;border:none;padding:12px 24px;
                border-radius:10px;font-size:.9rem;font-weight:600;cursor:pointer;margin-top:8px}
              </style></head><body>
                <div class="icon">📵</div>
                <h1>Sin conexión</h1>
                <p>Conéctate a internet para ver esta tarjeta.</p>
                <button onclick="location.reload()">Reintentar</button>
              </body></html>`,
              { headers: { 'Content-Type': 'text/html' } }
            )
          }
          return new Response('', { status: 408 })
        })
      )
  )
})

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})