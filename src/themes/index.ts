// ============================================================
// THEME REGISTRY — agrega un theme creando una carpeta y
// ============================================================

export interface ThemeMeta {
    id: string
    nombre: string
    descripcion: string
    preview_bg: string      // color de fondo para la miniatura
    preview_accent: string  // color de acento
    etiquetas: string[]     // ej: ['moderno', 'minimalista']
    componente: string      // nombre del archivo en src/themes/{id}/Card.astro
    premium: boolean        // true = solo plan pro/business
  }
  
  export const THEMES: ThemeMeta[] = [
    {
      id: 'minimal',
      nombre: 'Minimal',
      descripcion: 'Limpio, tipográfico y atemporal. Deja que el contenido hable.',
      preview_bg: '#ffffff',
      preview_accent: '#111827',
      etiquetas: ['minimalista', 'profesional'],
      componente: 'minimal/Card.astro',
      premium: false,
    },
    {
      id: 'executive',
      nombre: 'Executive',
      descripcion: 'Oscuro, sofisticado y elegante. Para perfiles de alto impacto.',
      preview_bg: '#0f172a',
      preview_accent: '#38bdf8',
      etiquetas: ['oscuro', 'premium', 'ejecutivo'],
      componente: 'executive/Card.astro',
      premium: false,
    },
    {
      id: 'bold',
      nombre: 'Bold',
      descripcion: 'Colores fuertes, layouts audaces. Ideal para creativos.',
      preview_bg: '#fafaf9',
      preview_accent: '#f97316',
      etiquetas: ['creativo', 'colorido'],
      componente: 'bold/Card.astro',
      premium: true,
    },
    {
      id: 'app-card',
      nombre: 'App Card',
      descripcion: 'Tarjeta tipo app móvil con portada, íconos circulares y secciones colapsables.',
      preview_bg: '#f1f5f9',
      preview_accent: '#2563eb',
      etiquetas: ['móvil', 'app', 'moderno'],
      componente: 'app-card/Card.astro',
      premium: false,
    },
  ]
  
  export function getTheme(id: string): ThemeMeta {
    return THEMES.find(t => t.id === id) ?? THEMES[0]
  }