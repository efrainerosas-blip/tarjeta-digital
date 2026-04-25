// src/pages/api/admin/crear-usuario.ts
// Endpoint protegido — solo SuperAdmin puede crear usuarios.
//
// Flujo:
//   1. Verifica sesión y permisos admin
//   2. Valida campos según tipo_perfil (profesional | negocio)
//   3. Genera contraseña temporal y slug
//   4. Crea auth.users con email ficticio
//   5. INSERT en perfiles (campos comunes)
//   6. INSERT en perfiles_profesionales O perfiles_negocios
//   7. Si paso 6 falla → rollback: elimina auth.user + perfil
//   8. Devuelve credenciales

export const prerender = false

import type { APIRoute } from 'astro'
import { getSupabaseAdmin, isAdmin } from '../../../lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

// ── Contraseña temporal legible para WhatsApp ─────────────────
function generarPasswordTemporal(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `Card#${num}`
}

// ── Slug desde texto libre ────────────────────────────────────
function generarSlug(texto: string): string {
  const base = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quitar tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)                       // máx 40 chars base
  const sufijo = Math.floor(100 + Math.random() * 900)
  return `${base}-${sufijo}`
}

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' }

  // ── 1. Verificar sesión y permisos ────────────────────────
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
  if (!await isAdmin(user.email)) {
    return new Response(
      JSON.stringify({ error: 'No autorizado — solo SuperAdmin' }),
      { status: 403, headers }
    )
  }

  // ── 2. Parsear body ───────────────────────────────────────
  let body: {
    tipo_perfil?:       string
    nombre?:            string
    apellidos?:         string
    titulo?:            string
    nombre_negocio?:    string
    categoria_negocio?: string
    movil?:             string
    plan_id?:           string
  }

  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido — se esperaba JSON' }),
      { status: 400, headers }
    )
  }

  // ── 3. Normalizar campos ──────────────────────────────────
  const tipo_perfil       = body.tipo_perfil === 'negocio' ? 'negocio' : 'profesional'
  const nombre            = body.nombre?.trim()            ?? ''
  const apellidos         = body.apellidos?.trim()         ?? ''
  const titulo            = body.titulo?.trim()            ?? ''
  const nombre_negocio    = body.nombre_negocio?.trim()    ?? ''
  const categoria_negocio = body.categoria_negocio?.trim() ?? ''
  const movil             = body.movil?.replace(/\D/g, '')  ?? ''
  const plan_id           = body.plan_id?.trim()           || 'free'

  // ── 4. Validaciones ───────────────────────────────────────
  if (!nombre) {
    return new Response(
      JSON.stringify({ error: 'El nombre del responsable es requerido' }),
      { status: 400, headers }
    )
  }
  if (tipo_perfil === 'negocio' && !nombre_negocio) {
    return new Response(
      JSON.stringify({ error: 'El nombre del negocio es requerido' }),
      { status: 400, headers }
    )
  }
  if (!movil || movil.length < 7 || movil.length > 15) {
    return new Response(
      JSON.stringify({ error: 'Número de móvil inválido (7–15 dígitos)' }),
      { status: 400, headers }
    )
  }

  const db = getSupabaseAdmin()

  // ── 5. Verificar móvil no registrado ─────────────────────
  const { data: existente } = await db
    .from('perfiles')
    .select('id')
    .eq('telefono', movil)
    .maybeSingle()

  if (existente) {
    return new Response(
      JSON.stringify({ error: `El móvil ${movil} ya está registrado` }),
      { status: 409, headers }
    )
  }

  // ── 6. Verificar plan ─────────────────────────────────────
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

  // ── 7. Generar credenciales ───────────────────────────────
  const password   = generarPasswordTemporal()
  const emailFicto = `${movil}@tarjetadigital.app`

  // Slug: negocios usan nombre_negocio, profesionales usan nombre + apellidos
  const slugBase = tipo_perfil === 'negocio'
    ? generarSlug(nombre_negocio)
    : generarSlug(`${nombre} ${apellidos}`)

  const plan_expires_at = plan_id === 'free' && plan.duracion_prueba_dias > 0
    ? new Date(Date.now() + plan.duracion_prueba_dias * 86400000).toISOString()
    : null

  // ── 8. Crear usuario en auth.users ────────────────────────
  const { data: newUser, error: authCreateError } = await db.auth.admin.createUser({
    email:         emailFicto,
    password,
    email_confirm: true,
    user_metadata: { nombre, tipo_perfil },
  })

  if (authCreateError || !newUser.user) {
    return new Response(
      JSON.stringify({ error: `Error creando auth: ${authCreateError?.message}` }),
      { status: 500, headers }
    )
  }

  const userId = newUser.user.id

  // ── 9. INSERT en perfiles (campos comunes) ─────────────────
  // template_id por defecto según tipo — se cambia desde el dashboard
  const { data: perfilCreado, error: perfilError } = await db
    .from('perfiles')
    .insert({
      user_id:               userId,
      slug:                  slugBase,
      nombre,
      telefono:              movil,
      plan_id,
      plan_expires_at,
      tipo_perfil,
      debe_cambiar_password: true,
      template_id:           tipo_perfil === 'negocio' ? 'store-card' : 'app-card',
    })
    .select('id')
    .single()

  if (perfilError || !perfilCreado) {
    // Rollback auth
    await db.auth.admin.deleteUser(userId)
    return new Response(
      JSON.stringify({ error: `Error creando perfil base: ${perfilError?.message}` }),
      { status: 500, headers }
    )
  }

  const perfilId = perfilCreado.id

  // ── 10. INSERT en tabla satélite según tipo ───────────────
  if (tipo_perfil === 'profesional') {

    const { error: ppError } = await db
      .from('perfiles_profesionales')
      .insert({
        perfil_id:          perfilId,
        apellidos:          apellidos || null,
        titulo_profesional: titulo    || null,
        status:             'Disponible',
      })

    if (ppError) {
      // Rollback: eliminar perfil y auth
      await db.from('perfiles').delete().eq('id', perfilId)
      await db.auth.admin.deleteUser(userId)
      return new Response(
        JSON.stringify({ error: `Error creando perfil profesional: ${ppError.message}` }),
        { status: 500, headers }
      )
    }

  } else {

    const { error: pnError } = await db
      .from('perfiles_negocios')
      .insert({
        perfil_id:        perfilId,
        nombre_negocio,
        categoria_negocio: categoria_negocio || null,
        status_negocio:   'Abierto',
      })

    if (pnError) {
      // Rollback: eliminar perfil y auth
      await db.from('perfiles').delete().eq('id', perfilId)
      await db.auth.admin.deleteUser(userId)
      return new Response(
        JSON.stringify({ error: `Error creando perfil negocio: ${pnError.message}` }),
        { status: 500, headers }
      )
    }
  }

  // ── 11. Mensaje WhatsApp personalizado por tipo ───────────
  const nombreDisplay = tipo_perfil === 'negocio' ? nombre_negocio : nombre

  const mensajeWA = tipo_perfil === 'negocio'
    ? `¡Hola ${nombre}! 👋\n\n` +
      `La tarjeta digital de *${nombre_negocio}* ya está lista.\n\n` +
      `Para ingresar y personalizar tu tarjeta:\n` +
      `🌐 tarjeta-digital-neon.vercel.app/auth/login\n` +
      `📱 Usuario: ${movil}\n` +
      `🔑 Contraseña: ${password}\n\n` +
      `Podrás agregar tu catálogo, horario y fotos del negocio.\n` +
      `Te recomendamos cambiar tu contraseña al primer ingreso.\n\n` +
      `¿Necesitas ayuda? Responde este mensaje.`
    : `¡Hola ${nombre}! 👋\n\n` +
      `Tu Tarjeta Digital profesional ya está lista.\n\n` +
      `Para ingresar:\n` +
      `🌐 tarjeta-digital-neon.vercel.app/auth/login\n` +
      `📱 Usuario: ${movil}\n` +
      `🔑 Contraseña: ${password}\n\n` +
      `Te recomendamos cambiar tu contraseña al primer ingreso.\n\n` +
      `¿Necesitas ayuda? Responde este mensaje.`

  // ── 12. Respuesta exitosa ─────────────────────────────────
  return new Response(
    JSON.stringify({
      ok:             true,
      tipo_perfil,
      movil,
      password,
      slug:           slugBase,
      plan_id,
      nombre_display: nombreDisplay,
      whatsapp_url:   `https://wa.me/51${movil}?text=${encodeURIComponent(mensajeWA)}`,
    }),
    { status: 200, headers }
  )
}