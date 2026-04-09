// src/themes/index.ts
// ============================================================
// THEME REGISTRY — agrega un theme creando una carpeta y
// registrándolo aquí
// ============================================================
export interface ThemeMeta {
  id:             string
  nombre:         string
  descripcion:    string
  preview_bg:     string      // color de fondo para la miniatura
  preview_accent: string      // color de acento
  etiquetas:      string[]    // ej: ['moderno', 'minimalista']
  componente:     string      // nombre del archivo en src/themes/{id}/Card.astro
  premium:        boolean     // true = solo plan pro/business
}

export const THEMES: ThemeMeta[] = [
  {
    id:             'app-card',
    nombre:         'App Card',
    descripcion:    'Tarjeta tipo app móvil con portada, íconos circulares y secciones colapsables.',
    preview_bg:     '#0a0508',
    preview_accent: '#2563eb',
    etiquetas:      ['móvil', 'app', 'moderno'],
    componente:     'app-card/Card.astro',
    premium:        false,
  },
  {
    id:             'modern-blue',
    nombre:         'Modern Blue',
    descripcion:    'Degradado azul vibrante, foto hero que se funde con el fondo y tarjetas flotantes.',
    preview_bg:     '#1a4fa0',
    preview_accent: '#ffffff',
    etiquetas:      ['profesional', 'corporativo', 'azul'],
    componente:     'modern-blue/Card.astro',
    premium:        false,
  },
]

export function getTheme(id: string): ThemeMeta {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}