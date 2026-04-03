import type { APIRoute } from 'astro'
import { createHash } from 'crypto'
import { getSupabaseAdmin } from '../../lib/supabase-admin'

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { perfil_id, tipo, metadata } = body

    if (!perfil_id) {
      return new Response(JSON.stringify({ error: 'perfil_id requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    const ip_hash = createHash('sha256')
      .update(ip + import.meta.env.IP_SALT)
      .digest('hex')

    const referrer  = request.headers.get('referer')     ?? null
    const user_agent = request.headers.get('user-agent') ?? null

    if (!tipo || tipo === 'vista') {
      const hace30min = new Date(Date.now() - 30 * 60 * 1000).toISOString()

      const { count, error: countError } = await supabaseAdmin
        .from('perfil_vistas')
        .select('*', { count: 'exact', head: true })
        .eq('perfil_id', perfil_id)
        .eq('ip_hash', ip_hash)
        .gte('visited_at', hace30min)

      if (countError) {
        console.error('[track] error count:', countError)
        return new Response(JSON.stringify({ error: countError.message }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        })
      }

      if (count && count > 0) {
        return new Response(null, { status: 204 })
      }

      const { error: insertError } = await supabaseAdmin
        .from('perfil_vistas')
        .insert({ perfil_id, ip_hash, referrer, user_agent })

      if (insertError) {
        console.error('[track] error insert vista:', insertError)
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(null, { status: 201 })
    }

    const tiposPermitidos = [
      'click_red', 'click_servicio', 'click_proyecto',
      'descarga_cv', 'vista_seccion'
    ]

    if (!tiposPermitidos.includes(tipo)) {
      return new Response(JSON.stringify({ error: 'tipo de evento inválido' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    const { error: insertEventoError } = await supabaseAdmin
      .from('eventos')
      .insert({ perfil_id, tipo, metadata: metadata ?? null })

    if (insertEventoError) {
      console.error('[track] error insert evento:', insertEventoError)
      return new Response(JSON.stringify({ error: insertEventoError.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(null, { status: 201 })

  } catch (err) {
    console.error('[/api/track]', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}
