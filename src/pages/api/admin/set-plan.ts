// src/pages/api/admin/set-plan.ts
// Endpoint protegido para que el SuperAdmin cambie el plan
// de cualquier usuario desde la tabla de usuarios.
//
// Solo acepta POST con JSON { perfil_id, plan_id }.
// Verifica que el solicitante sea admin antes de ejecutar.
// Usa el cliente admin (service role) para saltarse RLS.
export const prerender = false

import type { APIRoute } from 'astro'
import { getSupabaseAdmin, isAdmin } from '../../../lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

export const POST: APIRoute = async ({ request }) => {
  // ── Headers de respuesta JSON ─────────────────────────────
  const headers = { 'Content-Type': 'application/json' }

  // ── 1. Verificar sesión del solicitante ───────────────────
  const supabaseAuth = createServerClient(
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

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

  // Sin sesión o no es admin → 403
  if (authError || !user || !isAdmin(user.email)) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 403, headers }
    )
  }

  // ── 2. Parsear y validar el body ──────────────────────────
  let body: { perfil_id?: string; plan_id?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido' }),
      { status: 400, headers }
    )
  }

  const { perfil_id, plan_id } = body

  if (!perfil_id || !plan_id) {
    return new Response(
      JSON.stringify({ error: 'Faltan campos: perfil_id y plan_id son requeridos' }),
      { status: 400, headers }
    )
  }

  // ── 3. Verificar que el plan existe en la BD ──────────────
  const db = getSupabaseAdmin()

  const { data: plan, error: planError } = await db
    .from('planes')
    .select('id')
    .eq('id', plan_id)
    .eq('activo', true)
    .single()

  if (planError || !plan) {
    return new Response(
      JSON.stringify({ error: `Plan "${plan_id}" no existe o está inactivo` }),
      { status: 400, headers }
    )
  }

  // ── 4. Actualizar el plan del perfil ──────────────────────
  const { error: updateError } = await db
    .from('perfiles')
    .update({
      plan_id,
      // Si cambia a free → limpiar fecha de expiración
      // Si cambia a premium → el admin puede fijar la fecha manualmente después
      plan_expires_at: plan_id === 'free' ? null : undefined,
    })
    .eq('id', perfil_id)

  if (updateError) {
    return new Response(
      JSON.stringify({ error: updateError.message }),
      { status: 500, headers }
    )
  }

  // ── 5. Respuesta exitosa ───────────────────────────────────
  return new Response(
    JSON.stringify({ ok: true, perfil_id, plan_id }),
    { status: 200, headers }
  )
}