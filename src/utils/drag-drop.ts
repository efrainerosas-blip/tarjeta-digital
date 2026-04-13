import Sortable from 'sortablejs';
import type { SupabaseClient } from '@supabase/supabase-js';

export function initDragAndDrop(
  contenedorId: string,
  tabla: string,
  supabaseClient: SupabaseClient
) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  let isSaving = false;

  const sortableInstance = Sortable.create(contenedor, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    
    onStart: () => {
      if (isSaving) sortableInstance.option('disabled', true);
    },

    onEnd: async (evt) => {
      if (evt.oldIndex === evt.newIndex) return;

      const elementos = Array.from(contenedor.querySelectorAll('.list-item'));
      if (elementos.length === 0) return;

      isSaving = true;
      sortableInstance.option('disabled', true);
      
      window.toast('Guardando nuevo orden...', 'info');

      try {
        const promesasUpdate = elementos.map((el, index) => {
          const id = (el as HTMLElement).dataset.id;
          if (!id) return null;
          
          return supabaseClient
            .from(tabla)
            .update({ orden: index + 1 })
            .eq('id', id);
        }).filter(Boolean);

        const resultados = await Promise.all(promesasUpdate);
        const algunError = resultados.find((r: any) => r && r.error);
        if (algunError) throw algunError.error;

        window.toast('Orden actualizado correctamente', 'success');

      } catch (error: any) {
        window.toast('Error al reordenar: ' + error.message, 'error');
        
        const itemMove = evt.item;
        const oldParent = evt.from;
        const referenceNode = oldParent.children[evt.oldIndex!];
        
        if (referenceNode) {
          oldParent.insertBefore(itemMove, referenceNode);
        } else {
          oldParent.appendChild(itemMove);
        }
        
      } finally {
        isSaving = false;
        sortableInstance.option('disabled', false);
      }
    }
  });
}