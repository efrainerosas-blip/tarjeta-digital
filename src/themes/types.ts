// =============================================================
// src/themes/types.ts
// Tipos compartidos para todos los themes de CardVirtual.
// Tanto profesionales como negocios usan CardProps —
// los campos que no aplican al tipo llegan como null.
// =============================================================

export interface Perfil {
  // ── Campos base (comunes a ambos tipos) ───────────────────
  id:                    string
  user_id?:              string | null
  slug:                  string
  tipo_perfil?:          'profesional' | 'negocio' | null
  nombre:                string
  bio?:                  string | null
  ubicacion?:            string | null
  foto_url?:             string | null
  foto_portada_url?:     string | null
  telefono?:             string | null
  color_primario?:       string | null
  color_secundario?:     string | null
  template_id?:          string | null
  plan_id?:              string | null

  // ── Solo profesional (null si es negocio) ─────────────────
  apellidos?:            string | null
  titulo_profesional?:   string | null
  cv_pdf_url?:           string | null
  status?:               string | null   // enum perfil_status

  // ── Solo negocio (null si es profesional) ─────────────────
  nombre_negocio?:       string | null
  categoria_negocio?:    string | null
  direccion?:            string | null
  horario?:              Record<string, { abre?: string; cierra?: string; activo: boolean }> | null
  whatsapp_pedidos?:     string | null
  email_negocio?:        string | null
  status_negocio?:       string | null   // 'Abierto' | 'Cerrado' | ...
  sitio_web?:            string | null
  tagline?:              string | null

  // ── Campos legacy (mantener compatibilidad) ───────────────
  email?:                string | null   // alias de email_negocio en algunos themes
  empresa?:              string | null
  icono_profesion?:      string | null
}

export interface Experiencia {
  id:                string
  cargo:             string
  empresa:           string
  periodo?:          string | null
  descripcion?:      string | null
  es_trabajo_actual?: boolean | null
  orden?:            number | null
}

export interface Estudio {
  id:               string
  nivel:            string
  institucion:      string
  titulo_obtenido?: string | null
  fecha_inicio?:    string | null
  fecha_fin?:       string | null
  orden?:           number | null
}

export interface Habilidad {
  id:         string
  nombre:     string
  categoria?: string | null
  nivel?:     string | null
  orden?:     number | null
}

export interface Servicio {
  id:                  string
  nombre:              string
  descripcion?:        string | null
  icono?:              string | null
  precio_referencial?: string | null
  orden?:              number | null
}

export interface Proyecto {
  id:           string
  titulo:       string
  descripcion?: string | null
  enlace_url?:  string | null
  imagen_url?:  string | null
  orden?:       number | null
}

export interface Red {
  id:         string
  plataforma: string
  url:        string
  activo?:    boolean | null
  orden?:     number | null
}

export interface Logro {
  id:           string
  titulo:       string
  descripcion?: string | null
  fecha?:       string | null
  orden?:       number | null
}

export interface Capacitacion {
  id:               string
  nombre:           string
  institucion?:     string | null
  fecha?:           string | null
  certificado_url?: string | null
  orden?:           number | null
}

export interface Referencia {
  id:              string
  nombre:          string
  empresa?:        string | null
  cargo?:          string | null
  telefono?:       string | null
  email?:          string | null
  observaciones?:  string | null
  orden?:          number | null
}

// ── Props que recibe cada Card.astro ──────────────────────────
// [slug]/index.astro pasa exactamente esto — ni más ni menos.
// Los arrays vacíos [] para los datos que no aplican al tipo.
export interface CardProps {
  perfil:         Perfil
  experiencia:    Experiencia[]
  estudios:       Estudio[]
  habilidades:    Habilidad[]
  servicios:      Servicio[]
  proyectos:      Proyecto[]
  redes:          Red[]
  logros:         Logro[]
  capacitaciones: Capacitacion[]
  referencias:    Referencia[]
}