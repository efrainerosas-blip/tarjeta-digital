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
      
      const elToast = window.toast('Guardando nuevo orden...', 'info');

      try {
        const updates = elementos
          .map((el, index) => {
            const id = (el as HTMLElement).dataset.id;
            if (!id) return null;
            return { id, orden: index + 1 };
          })
          .filter(Boolean);

        const { error } = await supabaseClient.from(tabla).upsert(updates);

        if (error) throw error;

        window.toast('Orden actualizado correctamente', 'success');

      } catch (error: any) {
        window.toast('Error al reordenar: ' + error.message, 'error');
        
        // 2. ROLLBACK: Si falla, devolvemos visualmente el elemento a donde estaba
        const itemMove = evt.item;
        const oldParent = evt.from;
        const referenceNode = oldParent.children[evt.oldIndex!];
        
        // Lo insertamos de vuelta en su posición original
        if (referenceNode) {
          oldParent.insertBefore(itemMove, referenceNode);
        } else {
          oldParent.appendChild(itemMove); // Si era el último
        }
        
      } finally {
        // 3. Desbloqueamos la lista pase lo que pase
        isSaving = false;
        sortableInstance.option('disabled', false);
      }
    }
  });
}