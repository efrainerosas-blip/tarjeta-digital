// src/themes/index.ts
// ============================================================
// THEME REGISTRY — para agregar un theme nuevo:
//   1. Crear carpeta src/themes/{id}/Card.astro
//   2. Importarlo aquí abajo
//   3. Agregarlo al array THEMES
// ============================================================

import type { AstroComponentFactory } from 'astro/runtime/server/index.js'
import AppCard    from './app-card/Card.astro'
import ModernBlue from './modern-blue/Card.astro'
import CleanWhite from './clean-white/Card.astro'

export interface ThemeMeta {
  id:             string
  nombre:         string
  descripcion:    string
  preview_bg:     string
  preview_accent: string
  etiquetas:      string[] 
  componente:     AstroComponentFactory
  premium:        boolean
}

export const THEMES: ThemeMeta[] = [
  {
    id:             'app-card',
    nombre:         'App Card',
    descripcion:    'Tarjeta tipo app móvil con portada, íconos circulares y secciones colapsables.',
    preview_bg:     '#0a0508',
    preview_accent: '#2563eb',
    etiquetas:      ['móvil', 'app', 'moderno'],
    componente:     AppCard,
    premium:        false,
  },
  {
    id:             'modern-blue',
    nombre:         'Modern Blue',
    descripcion:    'Degradado azul vibrante, foto hero que se funde con el fondo y tarjetas flotantes.',
    preview_bg:     '#1a4fa0',
    preview_accent: '#ffffff',
    etiquetas:      ['profesional', 'corporativo', 'azul'],
    componente:     ModernBlue,
    premium:        false,
  },
  {
    id:             'clean-white',
    nombre:         'Clean White',
    descripcion:    'Foto hero con ola ondulada, íconos con colores oficiales y tarjetas blancas flotantes.',
    preview_bg:     '#f2f4f7',
    preview_accent: '#4f46e5',
    etiquetas:      ['limpio', 'blanco', 'moderno'],
    componente:     CleanWhite,
    premium:        false,
  },
]

export function getTheme(id: string): ThemeMeta {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}