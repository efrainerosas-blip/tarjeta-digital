// src/pages/api/admin/crear-usuario.ts
// Endpoint protegido — solo SuperAdmin puede crear usuarios.
//
// Flujo:
//   1. Verifica sesión y permisos admin
//   2. Valida campos requeridos
//   3. Genera contraseña temporal segura
//   4. Crea auth.users con email ficticio (51{movil}@tarjetadigital.app)
//   5. Crea perfil en tabla perfiles
//   6. Devuelve credenciales para mostrar en el panel

export const prerender = false

import type { APIRoute } from 'astro'
import { getSupabaseAdmin, isAdmin } from '../../../lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

// ── Genera una contraseña temporal legible ────────────────────
// Formato: Card#XXXX donde XXXX son 4 dígitos aleatorios
// Fácil de dictar por WhatsApp, suficientemente segura para uso temporal
function generarPasswordTemporal(): string {
  const num = Math.floor(1000 + Math.random() * 9000) // 1000-9999
  return `Card#${num}`
}

// ── Genera un slug único desde nombre + apellidos ─────────────
function generarSlug(nombre: string, apellidos: string): string {
  const base = `${nombre} ${apellidos}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  // agregar sufijo aleatorio para evitar colisiones
  const sufijo = Math.floor(100 + Math.random() * 900)
  return `${base}-${sufijo}`
}

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' }

  // ── 1. Verificar sesión y permisos admin ──────────────────
  const supabaseAuth = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return (request.headers.get('Cookie') ?? '')
            .split(';').filter(Boolean)
            .map(c => {
              const [k, ...v] = c.trim().split('=')
              return { name: k, value: v.join('=') }
            })
        },
        setAll() {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'No autenticado' }),
      { status: 401, headers }
    )
  }

  const adminOk = await isAdmin(user.email)
  if (!adminOk) {
    return new Response(
      JSON.stringify({ error: 'No autorizado — solo SuperAdmin' }),
      { status: 403, headers }
    )
  }

  // ── 2. Parsear y validar el body ──────────────────────────
  let body: {
    nombre?:    string
    apellidos?: string
    movil?:     string
    plan_id?:   string
  }

  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido — se esperaba JSON' }),
      { status: 400, headers }
    )
  }

  const nombre    = body.nombre?.trim()
  const apellidos = body.apellidos?.trim() ?? ''
  const movil     = body.movil?.trim().replace(/\D/g, '') // solo dígitos
  const plan_id   = body.plan_id?.trim() ?? 'free'

  // Validaciones básicas
  if (!nombre) {
    return new Response(
      JSON.stringify({ error: 'El nombre es requerido' }),
      { status: 400, headers }
    )
  }

  if (!movil || movil.length < 7 || movil.length > 15) {
    return new Response(
      JSON.stringify({ error: 'Número de móvil inválido (7-15 dígitos)' }),
      { status: 400, headers }
    )
  }

  const db = getSupabaseAdmin()

  // ── 3. Verificar que el móvil no esté ya registrado ──────
  const { data: perfilExistente } = await db
    .from('perfiles')
    .select('id')
    .eq('telefono', movil)
    .maybeSingle()

  if (perfilExistente) {
    return new Response(
      JSON.stringify({ error: `El móvil ${movil} ya está registrado` }),
      { status: 409, headers }
    )
  }

  // ── 4. Verificar que el plan existe ───────────────────────
  const { data: plan } = await db
    .from('planes')
    .select('id, duracion_prueba_dias')
    .eq('id', plan_id)
    .eq('activo', true)
    .maybeSingle()

  if (!plan) {
    return new Response(
      JSON.stringify({ error: `Plan "${plan_id}" no existe o está inactivo` }),
      { status: 400, headers }
    )
  }

  // ── 5. Generar credenciales ───────────────────────────────
  const password    = generarPasswordTemporal()
  const emailFicto  = `${movil}@tarjetadigital.app`
  const slug        = generarSlug(nombre, apellidos)

  // Calcular expiración del plan (solo para free con días de prueba)
  const plan_expires_at = plan_id === 'free' && plan.duracion_prueba_dias > 0
    ? new Date(Date.now() + plan.duracion_prueba_dias * 86400000).toISOString()
    : null

  // ── 6. Crear usuario en auth.users ────────────────────────
  // Usamos el admin API de Supabase — sin enviar email de confirmación
  const { data: newUser, error: createError } = await db.auth.admin.createUser({
    email:              emailFicto,
    password,
    email_confirm:      true,   // confirmar directo, sin email
    user_metadata: {
      nombre,
      apellidos,
      movil,
    },
  })

  if (createError || !newUser.user) {
    return new Response(
      JSON.stringify({ error: `Error creando usuario: ${createError?.message}` }),
      { status: 500, headers }
    )
  }

  // ── 7. Crear perfil en tabla perfiles ─────────────────────
  const { error: perfilError } = await db
    .from('perfiles')
    .insert({
      user_id:               newUser.user.id,
      slug,
      nombre,
      apellidos,
      telefono:              movil,
      plan_id,
      plan_expires_at,
      debe_cambiar_password: true,   // forzar cambio en primer login
      template_id:           'minimal',
      status:                'Disponible',
    })

  if (perfilError) {
    // Si falla el perfil, eliminar el auth.user para no dejar huérfanos
    await db.auth.admin.deleteUser(newUser.user.id)

    return new Response(
      JSON.stringify({ error: `Error creando perfil: ${perfilError.message}` }),
      { status: 500, headers }
    )
  }

  // ── 8. Respuesta exitosa con credenciales ─────────────────
  return new Response(
    JSON.stringify({
      ok:       true,
      movil,
      password,   // contraseña temporal para mostrar al admin
      slug,
      plan_id,
      // URL de WhatsApp lista para compartir
      whatsapp_url: `https://wa.me/51${movil}?text=${encodeURIComponent(
        `¡Hola ${nombre}! 👋\n\nTu Tarjeta Digital ya está lista.\n\n` +
        `Para ingresar:\n` +
        `🌐 tarjeta-digital-neon.vercel.app/auth/login\n` +
        `📱 Usuario: ${movil}\n` +
        `🔑 Contraseña: ${password}\n\n` +
        `Te recomendamos cambiar tu contraseña al ingresar por primera vez.\n\n` +
        `¿Necesitas ayuda? Responde este mensaje.`
      )}`,
    }),
    { status: 200, headers }
  )
}