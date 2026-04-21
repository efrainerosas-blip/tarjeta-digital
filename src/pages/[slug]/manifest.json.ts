// src/pages/[slug]/manifest.json.ts
// Genera un manifest.json dinámico por perfil.

import type { APIRoute } from 'astro'
import { createServerClient } from '@supabase/ssr'

export const prerender = false

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug!

  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return (request.headers.get('Cookie') ?? '')
            .split(';').filter(Boolean)
            .map(c => { const [k,...v]=c.trim().split('='); return { name:k, value:v.join('=') } })
        },
        setAll() {},
      },
    }
  )

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, apellidos, titulo_profesional, foto_url, color_primario')
    .eq('slug', slug)
    .maybeSingle()

  const nombre  = [perfil?.nombre, perfil?.apellidos].filter(Boolean).join(' ') || 'Tarjeta Digital'
  const titulo  = perfil?.titulo_profesional ?? 'Tarjeta personal digital'
  const color   = perfil?.color_primario ?? '#4B6CF7'
  const fotoUrl = perfil?.foto_url ?? null

  const iconos = fotoUrl
    ? [
        { src: fotoUrl, sizes: '192x192', type: 'image/webp', purpose: 'any maskable' },
        { src: fotoUrl, sizes: '512x512', type: 'image/webp', purpose: 'any maskable' },
      ]
    : [
        { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ]

  const manifest = {
    name:             nombre,
    short_name:       perfil?.nombre ?? nombre.split(' ')[0],
    description:      titulo,
    start_url:        `/${slug}`,
    scope:            `/${slug}`,
    display:          'standalone',
    orientation:      'portrait',
    background_color: '#ffffff',
    theme_color:      color,
    lang:             'es',
    categories:       ['business', 'productivity'],
    icons:            iconos,
    shortcuts: [
      {
        name:  'Ver tarjeta',
        url:   `/${slug}`,
        icons: [{ src: fotoUrl ?? '/web-app-manifest-192x192.png', sizes: '96x96' }],
      },
    ],
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      'Content-Type':  'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}