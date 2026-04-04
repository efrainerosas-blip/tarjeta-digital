// src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'

// ── Lista de SuperAdmins en la BD Supabase ──────────────────────────────────────

// ── Cliente con SERVICE_ROLE — acceso total, sin RLS ─────────
export function getSupabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      `Supabase admin config missing — URL: ${!!url}, KEY: ${!!key}`
    )
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}

// ── Verificar si un email tiene permisos de SuperAdmin ────────
// Para cambiar el admin: UPDATE admins SET email = '...' en Supabase.
export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  try {
    const db = getSupabaseAdmin()
    const { data } = await db
      .from('admins')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single()
    return !!data
  } catch {
    return false
  }
}

// ── Tipo auxiliar para filas de `perfiles` en el admin ────────
// Extiende según se necesite en cada página del admin.
export interface PerfilAdmin {
  id:              string
  user_id:         string
  slug:            string
  nombre:          string
  apellidos:       string | null
  titulo_profesional: string | null
  ubicacion:       string | null
  foto_url:        string | null
  status:          string | null
  plan_id:         string | null
  plan_expires_at: string | null
  template_id:     string | null
  created_at:      string | null
  updated_at:      string | null
}

// ── Tipo auxiliar para filas de `planes` ─────────────────────
export interface Plan {
  id:                   string
  nombre:               string
  descripcion:          string | null
  precio_mensual:       number
  moneda:               string
  duracion_prueba_dias: number
  activo:               boolean
  features:             string[]
  created_at:           string
  updated_at:           string
}