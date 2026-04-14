// =============================================================
// src/themes/types.ts
// =============================================================

export interface Perfil {
    id: string
    nombre: string
    apellidos?: string | null
    titulo_profesional?: string | null
    bio?: string | null
    foto_url?: string | null
    ubicacion?: string | null
    status?: string | null
    cv_pdf_url?: string | null
    foto_portada_url?: string | null
    telefono?: string | null
    email?: string | null
    color_primario?: string | null
    template_id?: string | null
    slug: string
  }
  
  export interface Experiencia {
    id: string
    cargo: string
    empresa: string
    periodo?: string | null
    descripcion?: string | null
    es_trabajo_actual?: boolean | null
  }
  
  export interface Estudio {
    id: string
    nivel: string
    institucion: string
    titulo_obtenido?: string | null
    fecha_inicio?: string | null
    fecha_fin?: string | null
  }
  
  export interface Habilidad {
    id: string
    nombre: string
    categoria?: string | null
    nivel?: string | null
  }
  
  export interface Servicio {
    id: string
    nombre: string
    descripcion?: string | null
    icono?: string | null
    precio_referencial?: string | null
  }
  
  export interface Proyecto {
    id: string
    titulo: string
    descripcion?: string | null
    enlace_url?: string | null
    imagen_url?: string | null
  }
  
  export interface Red {
    id: string
    plataforma: string
    url: string
    activo?: boolean | null
  }
  
  export interface Logro {
    id: string
    titulo: string
    descripcion?: string | null
    fecha?: string | null
  }
  
  export interface Capacitacion {
    id: string
    nombre: string
    institucion?: string | null
    fecha?: string | null
    certificado_url?: string | null
  }

  export interface Referencia {
    id: string
    nombre: string
    empresa?: string | null
    cargo?: string | null
    telefono?: string | null
    email?: string | null
    observaciones?: string | null
  }
  
  // Props que recibe CADA Card.astro de cada theme.
  // El slug/index.astro pasa exactamente esto — ni más ni menos.
  export interface CardProps {
    perfil: Perfil
    experiencia: Experiencia[]
    estudios: Estudio[]
    habilidades: Habilidad[]
    servicios: Servicio[]
    proyectos: Proyecto[]
    redes: Red[]
    logros: Logro[]
    capacitaciones: Capacitacion[]
    referencias: Referencia[]
  }