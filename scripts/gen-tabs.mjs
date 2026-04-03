#!/usr/bin/env node
// =============================================================
// gen-tabs.mjs — Generador de tabs del dashboard
// Ubicación: tarjeta-digital/scripts/gen-tabs.mjs
// =============================================================

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dest = join(__dirname, '..', 'src', 'pages', 'dashboard')
mkdirSync(dest, { recursive: true })

// =============================================================
// DEFINICIÓN DE TABS
// Para agregar uno nuevo: añade un objeto y corre el script.
// =============================================================

const TABS = [
  {
    id: 'estudios',
    label: 'Educación',
    tabla: 'estudios',
    titulo: 'Educación',
    desc: 'Tus estudios universitarios, técnicos o de especialización.',
    icono: '🎓',
    campos: [
      { name: 'nivel',           label: 'Nivel',           type: 'select',   required: true,
        options: ['Universitario','Técnico','Posgrado','Doctorado','Certificación','Otro'] },
      { name: 'institucion',     label: 'Institución',     type: 'text',     required: true, placeholder: 'Ej: Universidad Nacional', maxlength: 150 },
      { name: 'titulo_obtenido', label: 'Título obtenido', type: 'text',     placeholder: 'Ej: Ing. de Sistemas', maxlength: 150 },
      { name: 'fecha_inicio',    label: 'Año inicio',      type: 'text',     placeholder: '2018', maxlength: 10 },
      { name: 'fecha_fin',       label: 'Año fin',         type: 'text',     placeholder: '2023 (o "Presente")', maxlength: 20 },
    ],
  },
  {
    id: 'servicios',
    label: 'Servicios',
    tabla: 'servicios',
    titulo: 'Servicios',
    desc: 'Los servicios o productos que ofreces a tus clientes.',
    icono: '⚡',
    campos: [
      { name: 'nombre',             label: 'Nombre del servicio', type: 'text',     required: true, placeholder: 'Ej: Diseño de landing page', maxlength: 120 },
      { name: 'descripcion',        label: 'Descripción',         type: 'textarea', placeholder: '¿Qué incluye? ¿Cuál es el resultado?', maxlength: 400 },
      { name: 'icono',              label: 'Ícono (emoji)',        type: 'text',     placeholder: '🚀', maxlength: 5 },
      { name: 'precio_referencial', label: 'Precio referencial',  type: 'text',     placeholder: 'Desde $300', maxlength: 60 },
    ],
  },
  {
    id: 'habilidades',
    label: 'Habilidades',
    tabla: 'habilidades',
    titulo: 'Habilidades',
    desc: 'Tecnologías, herramientas y competencias clave.',
    icono: '🧠',
    campos: [
      { name: 'nombre',    label: 'Habilidad / Tecnología', type: 'text',   required: true, placeholder: 'Ej: TypeScript', maxlength: 80 },
      { name: 'categoria', label: 'Categoría',              type: 'text',   placeholder: 'Ej: Frontend, Backend, Soft Skills', maxlength: 60 },
      { name: 'nivel',     label: 'Nivel',                  type: 'select',
        options: ['', 'Básico', 'Intermedio', 'Avanzado', 'Experto'] },
    ],
  },
  {
    id: 'redes',
    label: 'Redes Sociales',
    tabla: 'redes_sociales',
    titulo: 'Redes sociales',
    desc: 'Tus perfiles en LinkedIn, GitHub, Instagram y otras plataformas.',
    icono: '🔗',
    campos: [
      { name: 'plataforma', label: 'Plataforma', type: 'select', required: true,
        options: ['LinkedIn','GitHub','Twitter/X','Instagram','Facebook','YouTube','TikTok','Behance','Dribbble','Pinterest','Portfolio','WhatsApp','Telegram','Otro'] },
      { name: 'url',    label: 'URL completa',       type: 'url',    required: true, placeholder: 'https://linkedin.com/in/tu-perfil', maxlength: 500 },
      { name: 'activo', label: 'Visible en tarjeta', type: 'toggle' },
    ],
  },
  {
    id: 'logros',
    label: 'Logros',
    tabla: 'logros',
    titulo: 'Logros y reconocimientos',
    desc: 'Premios, hitos, certificaciones o resultados notables de tu carrera.',
    icono: '🏆',
    campos: [
      { name: 'titulo',      label: 'Título del logro', type: 'text',     required: true, placeholder: 'Ej: Premio al mejor diseñador 2023', maxlength: 150 },
      { name: 'descripcion', label: 'Descripción',      type: 'textarea', placeholder: 'Contexto, entidad que lo otorgó, impacto…', maxlength: 400 },
      { name: 'fecha',       label: 'Fecha / Año',      type: 'text',     placeholder: '2023', maxlength: 30 },
    ],
  },
  {
    id: 'capacitaciones',
    label: 'Cursos',
    tabla: 'capacitaciones',
    titulo: 'Cursos y capacitaciones',
    desc: 'Formación continua, cursos online, bootcamps y talleres.',
    icono: '📚',
    campos: [
      { name: 'nombre',          label: 'Nombre del curso',     type: 'text', required: true, placeholder: 'Ej: React Avanzado con TypeScript', maxlength: 150 },
      { name: 'institucion',     label: 'Plataforma / Escuela', type: 'text', placeholder: 'Ej: Udemy, Platzi, Coursera…', maxlength: 100 },
      { name: 'fecha',           label: 'Fecha de obtención',   type: 'text', placeholder: 'Ej: Marzo 2024', maxlength: 30 },
      { name: 'certificado_url', label: 'URL del certificado',  type: 'url',  placeholder: 'https://…', maxlength: 500 },
    ],
  },
  {
    id: 'proyectos',
    label: 'Proyectos',
    tabla: 'proyectos',
    titulo: 'Proyectos',
    desc: 'Muestra tu portafolio: apps, sitios web, investigaciones y más.',
    icono: '🗂',
    campos: [
      { name: 'titulo',      label: 'Título del proyecto',   type: 'text',     required: true, placeholder: 'Ej: App de gestión financiera', maxlength: 120 },
      { name: 'descripcion', label: 'Descripción',           type: 'textarea', placeholder: '¿Qué problema resuelve? ¿Qué tecnologías usaste?', maxlength: 400 },
      { name: 'enlace_url',  label: 'URL del proyecto',      type: 'url',      placeholder: 'https://mi-proyecto.com', maxlength: 500 },
      { name: 'imagen_url',  label: 'URL de imagen preview', type: 'url',      placeholder: 'https://…/imagen.png', maxlength: 500 },
    ],
  },
]

// =============================================================
// HELPERS DE RENDERIZADO
// =============================================================

function renderFormField(f) {
  // data-field es el selector universal — el script cliente
  // usa querySelector('[data-field="x"]') en lugar de getElementById
  // para que funcione genéricamente en cualquier tab.

  if (f.type === 'select') {
    const opts = f.options
      .map(o => `              <option value="${o}">${o || '— Sin especificar —'}</option>`)
      .join('\n')
    return `
        <div class="form-group">
          <label for="f_${f.name}">${f.label}${f.required ? ' *' : ''}</label>
          <select id="f_${f.name}" data-field="${f.name}"${f.required ? ' required' : ''}>
${opts}
          </select>
        </div>`
  }

  if (f.type === 'toggle') {
    return `
        <label class="toggle">
          <input type="checkbox" id="f_${f.name}" data-field="${f.name}" />
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          ${f.label}
        </label>`
  }

  if (f.type === 'textarea') {
    return `
        <div class="form-group">
          <label for="f_${f.name}">${f.label}${f.required ? ' *' : ''}</label>
          <textarea
            id="f_${f.name}"
            data-field="${f.name}"
            rows="3"
            placeholder="${f.placeholder ?? ''}"
            ${f.maxlength ? `maxlength="${f.maxlength}"` : ''}
            style="resize:vertical"
            ${f.required ? 'required' : ''}
          ></textarea>
        </div>`
  }

  return `
        <div class="form-group">
          <label for="f_${f.name}">${f.label}${f.required ? ' *' : ''}</label>
          <input
            type="${f.type ?? 'text'}"
            id="f_${f.name}"
            data-field="${f.name}"
            placeholder="${f.placeholder ?? ''}"
            ${f.maxlength ? `maxlength="${f.maxlength}"` : ''}
            ${f.required ? 'required' : ''}
          />
        </div>`
}

function renderFillLines(campos) {
  return campos.map(f => {
    if (f.type === 'toggle')
      return `    getField('${f.name}').checked = !!(data && data['${f.name}'])`
    return `    getField('${f.name}').value = (data && data['${f.name}'] != null) ? String(data['${f.name}']) : ''`
  }).join('\n')
}

function renderPayloadLines(campos) {
  return campos.map(f => {
    if (f.type === 'toggle')
      return `      ${f.name}: getField('${f.name}').checked,`
    return `      ${f.name}: getField('${f.name}').value.trim() || null,`
  }).join('\n')
}

// =============================================================
// TEMPLATE
// =============================================================

function generateTab(tab) {
  const formFields   = tab.campos.map(renderFormField).join('\n')
  const fillLines    = renderFillLines(tab.campos)
  const payloadLines = renderPayloadLines(tab.campos)
  const p0           = tab.campos[0].name
  const p1           = (tab.campos[1] ?? tab.campos[0]).name
  const labelMin     = tab.label.toLowerCase()

  return `---
// src/pages/dashboard/${tab.id}.astro — generado por scripts/gen-tabs.mjs
export const prerender = false
import DashboardLayout from '../../layouts/DashboardLayout.astro'
import { createServerClient } from '@supabase/ssr'

const supabase = createServerClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      getAll() {
        return (Astro.request.headers.get('Cookie') ?? '')
          .split(';').filter(Boolean)
          .map(c => { const [k, ...v] = c.trim().split('='); return { name: k, value: v.join('=') } })
      },
      setAll(cs) {
        cs.forEach(({ name, value, options }) => Astro.cookies.set(name, value, options))
      },
    },
  }
)

const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) return Astro.redirect('/auth/login')

const { data: perfil } = await supabase
  .from('perfiles').select('id').eq('user_id', user.id).single()

const perfilId = perfil?.id ?? null

const { data: items } = perfilId
  ? await supabase.from('${tab.tabla}').select('*').eq('perfil_id', perfilId).order('orden')
  : { data: [] }
---

<DashboardLayout title="${tab.titulo}" tabActivo="${tab.id}" user={{ email: user.email, id: user.id }}>

  <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div>
      <h1 class="page-title">${tab.titulo}</h1>
      <p class="page-desc">${tab.desc}</p>
    </div>
    <button
      class="btn btn-primary"
      id="btn-nuevo"
      data-perfil-id={perfilId ?? ''}
      data-tabla="${tab.tabla}"
      data-label="${labelMin}"
      disabled={!perfilId}
      title={!perfilId ? 'Primero guarda tu perfil básico' : undefined}
    >
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      Agregar
    </button>
  </div>

  {!perfilId && (
    <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:12px;padding:14px 18px;margin-bottom:16px;font-size:13px;color:var(--warn)">
      ⚠ Primero guarda tu <a href="/dashboard" style="color:var(--warn);text-decoration:underline">perfil básico</a> para poder agregar registros aquí.
    </div>
  )}

  <div id="lista-items">
    {items && items.length > 0 ? items.map(item => (
      <div class="list-item" data-id={item.id}>
        <div style="width:36px;height:36px;border-radius:8px;background:var(--bg-4);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">
          ${tab.icono}
        </div>
        <div class="list-item-body">
          <div class="list-item-title">{item.${p0}}</div>
          <div class="list-item-sub">{item.${p1}}</div>
        </div>
        <div class="list-item-actions">
          <button class="icon-btn btn-editar" data-id={item.id} title="Editar">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
            </svg>
          </button>
          <button class="icon-btn danger btn-eliminar" data-id={item.id} title="Eliminar">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
            </svg>
          </button>
        </div>
      </div>
    )) : (
      <div style="text-align:center;padding:48px 20px;color:var(--text-3)">
        <div style="font-size:36px;margin-bottom:12px">${tab.icono}</div>
        <div style="font-size:14px;font-weight:600;color:var(--text-2);margin-bottom:4px">Sin registros aún</div>
        <div style="font-size:13px">${tab.desc}</div>
        {perfilId && (
          <button class="btn btn-primary" style="margin-top:16px" id="btn-empty-state">
            Agregar el primero
          </button>
        )}
      </div>
    )}
  </div>

</DashboardLayout>

<!-- MODAL — fuera del slot del layout -->
<div class="modal-backdrop" id="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title" id="modal-title">Agregar ${labelMin}</h2>
      <button class="modal-close" id="modal-close" aria-label="Cerrar modal">✕</button>
    </div>
    <div class="form-grid" style="gap:14px">
      <input type="hidden" id="item-id" />
${formFields}
      <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid var(--border);margin-top:4px">
        <button class="btn btn-ghost" id="btn-cancelar">Cancelar</button>
        <button class="btn btn-primary" id="btn-submit">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Guardar
        </button>
      </div>
    </div>
  </div>
</div>

<script>
  import { createBrowserClient } from '@supabase/ssr'

  const btnNuevo = document.getElementById('btn-nuevo') as HTMLButtonElement
  const perfilId = btnNuevo?.dataset.perfilId || null
  const tabla    = btnNuevo?.dataset.tabla    || ''
  const labelStr = btnNuevo?.dataset.label    || ''

  const sb = createBrowserClient(
    document.querySelector<HTMLMetaElement>('meta[name="supabase-url"]')!.content,
    document.querySelector<HTMLMetaElement>('meta[name="supabase-anon"]')!.content,
  )

  function getField(name: string) {
    return document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      \`[data-field="\${name}"]\`
    )!
  }

  const backdrop   = document.getElementById('modal-backdrop')!
  const modalTitle = document.getElementById('modal-title')!
  const itemIdEl   = document.getElementById('item-id') as HTMLInputElement
  const submitBtn  = document.getElementById('btn-submit') as HTMLButtonElement

  function openModal(titulo: string, data: Record<string, any> | null = null) {
    modalTitle.textContent = titulo
    itemIdEl.value = ''
    document.querySelectorAll<HTMLElement>('[data-field]').forEach(el => {
      if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = false
      else if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)
        el.value = ''
    })
    if (data) {
      itemIdEl.value = data['id'] ?? ''
${fillLines}
    }
    backdrop.classList.add('open')
    setTimeout(() => document.querySelector<HTMLElement>('[data-field]')?.focus(), 60)
  }

  function closeModal() { backdrop.classList.remove('open') }

  btnNuevo?.addEventListener('click', () => openModal('Agregar ' + labelStr))
  document.getElementById('btn-empty-state')?.addEventListener('click', () => openModal('Agregar ' + labelStr))
  document.getElementById('modal-close')!.addEventListener('click', closeModal)
  document.getElementById('btn-cancelar')!.addEventListener('click', closeModal)
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal() })

  document.querySelectorAll<HTMLButtonElement>('.btn-editar').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true
      const { data, error } = await sb.from(tabla).select('*').eq('id', btn.dataset.id!).single()
      btn.disabled = false
      if (error || !data) { window.toast('No se pudo cargar el registro', 'error'); return }
      openModal('Editar ' + labelStr, data)
    })
  })

  document.querySelectorAll<HTMLButtonElement>('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return
      btn.disabled = true
      const { error } = await sb.from(tabla).delete().eq('id', btn.dataset.id!)
      if (error) { window.toast('Error: ' + error.message, 'error'); btn.disabled = false; return }
      document.querySelector(\`.list-item[data-id="\${btn.dataset.id}"]\`)?.remove()
      window.toast('Eliminado correctamente', 'success')
    })
  })

  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true
    submitBtn.innerHTML = '<span style="opacity:.6">Guardando…</span>'

    const id = itemIdEl.value.trim()
    const payload: Record<string, any> = {
      perfil_id: perfilId,
${payloadLines}
    }

    let error: any
    if (id) {
      ;({ error } = await sb.from(tabla).update(payload).eq('id', id))
    } else {
      const { data: last } = await sb
        .from(tabla).select('orden')
        .eq('perfil_id', perfilId!)
        .order('orden', { ascending: false })
        .limit(1).single()
      payload['orden'] = (last?.orden ?? 0) + 1
      ;({ error } = await sb.from(tabla).insert(payload))
    }

    submitBtn.disabled = false
    submitBtn.innerHTML = \`<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Guardar\`

    if (error) { window.toast('Error: ' + error.message, 'error'); return }
    window.toast(id ? 'Actualizado correctamente' : 'Agregado correctamente', 'success')
    closeModal()
    setTimeout(() => window.location.reload(), 500)
  })
</script>
`
}

// =============================================================
// MAIN
// =============================================================

console.log('\nGenerando tabs del dashboard...\n')

let ok = 0
for (const tab of TABS) {
  const outPath = join(dest, `${tab.id}.astro`)
  try {
    writeFileSync(outPath, generateTab(tab), 'utf-8')
    console.log(`  ✓  src/pages/dashboard/${tab.id}.astro`)
    ok++
  } catch (e) {
    console.error(`  ✗  ${tab.id}.astro — ${e.message}`)
  }
}

console.log(`\n${ok === TABS.length ? '✅' : '⚠'} ${ok}/${TABS.length} generados en src/pages/dashboard/\n`)
console.log('Próximos pasos:')
console.log('  npx astro check   → verificar TypeScript')
console.log('  npm run dev       → levantar el servidor\n')