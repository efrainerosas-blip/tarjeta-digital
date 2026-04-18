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
import GeniusCard from './genius-card/Card.astro'
import TealWave from './teal-wave/Card.astro'
import FreshCircle from './fresh-circle/Card.astro'

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
  {
    id:             'genius-card',
    nombre:         'Genius Card',
    descripcion:    'Tarjeta oscura elegante con gradiente púrpura, avatar circular con glow y secciones colapsables.',
    preview_bg:     '#0E0B14',
    preview_accent: '#7C3AED',
    etiquetas:      ['oscuro', 'elegante', 'púrpura'],
    componente:     GeniusCard,
    premium:        false,
  },
  {
    id:             'teal-wave',
    nombre:         'Teal Wave',
    descripcion:    'Foto hero a pantalla completa, ola SVG curva teal, iconos de contacto circulares y barra de acción fija.',
    preview_bg:     '#0A7075',
    preview_accent: '#ffffff',
    etiquetas:      ['teal', 'profesional', 'médico', 'ola'],
    componente:     TealWave,
    premium:        false,
  },
  {
    id:             'fresh-circle',
    nombre:         'Fresh Circle',
    descripcion:    'Banner superior, foto circular centrada, nombre destacado y menú inferior de navegación rápida.',
    preview_bg:     '#ffffff', 
    preview_accent: '#0078D7', 
    etiquetas:      ['limpio', 'circular', 'moderno', 'claro'],
    componente:     FreshCircle,
    premium:        false,
  },
]

export function getTheme(id: string): ThemeMeta {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}