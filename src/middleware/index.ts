// src/middleware/index.ts
import { defineMiddleware } from 'astro:middleware'
import { createServerClient } from '@supabase/ssr'

// ── Rutas que requieren sesión activa ─────────────────────────
const RUTAS_PROTEGIDAS = ['/dashboard', '/admin']

// ── Rutas que además requieren ser SuperAdmin ─────────────────

const RUTAS_ADMIN = ['/admin']

// ── Lista de SuperAdmins directo en la BD Supabase ──────────────────────────────────────

export const onRequest = defineMiddleware(async ({ url, redirect, request }, next) => {
  const pathname = url.pathname

  // ── 1. Si la ruta no está protegida, pasar directo ────────────
  const estaProtegida = RUTAS_PROTEGIDAS.some(r => pathname.startsWith(r))
  if (!estaProtegida) return next()

  // ── 2. Parsear cookies de forma robusta ───────────────────────
  const rawCookies = request.headers.get('cookie') ?? ''
  const parsedCookies = rawCookies
    .split(';')
    .reduce((acc, pair) => {
      const [k, ...v] = pair.trim().split('=')
      if (k) acc.push({ name: k.trim(), value: v.join('=').trim() })
      return acc
    }, [] as { name: string; value: string }[])

  // ── 3. Cliente Supabase solo para verificar sesión ────────────
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return parsedCookies },
        setAll() {},   // middleware no necesita escribir cookies
      },
    }
  )

  // ── 4. Verificar sesión ───────────────────────────────────────
  const { data: { user }, error } = await supabase.auth.getUser()

  // Sin sesión válida → login con redirect de vuelta
  if (error || !user) {
    return redirect(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
  }

  // ── 5. Verificar permisos de admin si la ruta lo requiere ─────
  const esRutaAdmin = RUTAS_ADMIN.some(r => pathname.startsWith(r))

  if (esRutaAdmin) {
    const { isAdmin } = await import('../lib/supabase-admin')
    const adminOk = await isAdmin(user.email)
    if (!adminOk) {
      return redirect('/dashboard?error=forbidden')
    }
  }

  // ── 6. Todo OK → continuar con el request ────────────────────
  return next()
})