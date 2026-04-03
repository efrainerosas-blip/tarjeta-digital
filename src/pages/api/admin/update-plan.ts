// src/pages/api/admin/update-plan.ts
// Endpoint protegido para que el SuperAdmin actualice
// nombre, descripción, precio y features de un plan.
export const prerender = false

import type { APIRoute } from 'astro'
import { getSupabaseAdmin, isAdmin } from '../../../lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' }

  // ── 1. Verificar sesión + permisos ────────────────────────
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

  if (authError || !user || !isAdmin(user.email)) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 403, headers }
    )
  }

  // ── 2. Parsear y validar body ─────────────────────────────
  let body: Record<string, any>
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido' }),
      { status: 400, headers }
    )
  }

  const {
    plan_id,
    nombre,
    descripcion,
    precio_mensual,
    moneda,
    duracion_prueba_dias,
    features,
  } = body

  // Validaciones básicas
  if (!plan_id) {
    return new Response(
      JSON.stringify({ error: 'plan_id es requerido' }),
      { status: 400, headers }
    )
  }
  if (!nombre?.trim()) {
    return new Response(
      JSON.stringify({ error: 'El nombre del plan es requerido' }),
      { status: 400, headers }
    )
  }
  if (!Array.isArray(features)) {
    return new Response(
      JSON.stringify({ error: 'features debe ser un array' }),
      { status: 400, headers }
    )
  }
  if (typeof precio_mensual !== 'number' || precio_mensual < 0) {
    return new Response(
      JSON.stringify({ error: 'precio_mensual debe ser un número >= 0' }),
      { status: 400, headers }
    )
  }

  // ── 3. Actualizar en BD con service role ──────────────────
  const db = getSupabaseAdmin()

  const { error: updateError } = await db
    .from('planes')
    .update({
      nombre:               nombre.trim(),
      descripcion:          descripcion?.trim() || null,
      precio_mensual,
      moneda:               moneda ?? 'USD',
      duracion_prueba_dias: duracion_prueba_dias ?? 0,
      features,                   // JSONB — Supabase acepta el array directo
      updated_at:           new Date().toISOString(),
    })
    .eq('id', plan_id)

  if (updateError) {
    return new Response(
      JSON.stringify({ error: updateError.message }),
      { status: 500, headers }
    )
  }

  return new Response(
    JSON.stringify({ ok: true, plan_id }),
    { status: 200, headers }
  )
}