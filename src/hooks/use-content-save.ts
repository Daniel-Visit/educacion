import { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';

export interface SavedContent {
  id?: number;
  titulo: string;
  tipo: 'planificacion' | 'material' | 'evaluacion';
  contenido: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipo para nodos de TipTap
interface TipTapNode {
  type: string;
  attrs?: {
    src?: string;
    [key: string]: unknown;
  };
  content?: TipTapNode[];
  [key: string]: unknown;
}

// Función para procesar imágenes base64 en el contenido
async function processImagesInContent(
  content: TipTapNode
): Promise<TipTapNode> {
  if (!content || typeof content !== 'object') {
    return content;
  }

  // Si es un nodo de imagen con base64, procesarlo
  if (
    content.type === 'image' &&
    content.attrs?.src?.startsWith('data:image/')
  ) {
    try {
      const base64Data = content.attrs.src;
      const response = await fetch('/api/imagenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: `imagen_${Date.now()}.png`,
          tipo: base64Data.split(';')[0].split(':')[1],
          data: base64Data,
          tamaño: Math.ceil((base64Data.length * 3) / 4), // Estimación del tamaño
        }),
      });

      if (response.ok) {
        const imagen = await response.json();
        return {
          ...content,
          attrs: {
            ...content.attrs,
            src: `/api/imagenes/${imagen.id}`,
          },
        };
      }
    } catch (error) {
      console.error('Error procesando imagen:', error);
      // Si falla, mantener la imagen base64
    }
  }

  // Procesar recursivamente el contenido
  if (content.content && Array.isArray(content.content)) {
    const processedContent = await Promise.all(
      content.content.map(
        async (node: TipTapNode) => await processImagesInContent(node)
      )
    );
    return {
      ...content,
      content: processedContent,
    };
  }

  return content;
}

export function useContentSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar contenido guardado desde la API
  const loadSavedContents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/archivos');
      if (response.ok) {
        const archivos = await response.json();
        setSavedContents(archivos);
      } else {
        console.error('Error al cargar archivos:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading saved contents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar contenido al inicializar
  useEffect(() => {
    loadSavedContents();
  }, [loadSavedContents]);

  // Guardar contenido actual
  const saveContent = useCallback(
    async (
      editor: Editor,
      titulo: string,
      tipo: 'planificacion' | 'material' | 'evaluacion' = 'planificacion'
    ): Promise<SavedContent | null> => {
      console.log('🔵 [Hook] saveContent - Iniciando guardado:', {
        titulo,
        tipo,
      });

      if (!editor || !titulo.trim()) {
        console.log('❌ [Hook] saveContent - Datos faltantes:', {
          editor: !!editor,
          titulo: !!titulo.trim(),
        });
        throw new Error('Editor y título son requeridos');
      }

      setIsSaving(true);
      try {
        const content = editor.getJSON();
        console.log('🔵 [Hook] saveContent - Contenido del editor:', {
          contentType: content?.type,
          hasContent: !!content,
        });

        // Validar que sea un JSON de TipTap (type: 'doc')
        if (!content || typeof content !== 'object' || content.type !== 'doc') {
          console.log('❌ [Hook] saveContent - Contenido inválido:', {
            content,
            type: content?.type,
          });
          throw new Error('El contenido no tiene un formato válido de TipTap.');
        }

        // Procesar imágenes base64 antes de guardar
        console.log('🔵 [Hook] saveContent - Procesando imágenes...');
        let processedContent;
        try {
          processedContent = await processImagesInContent(content);
          console.log('✅ [Hook] saveContent - Imágenes procesadas');
        } catch (imageError) {
          console.log(
            '⚠️ [Hook] saveContent - Error procesando imágenes, usando contenido original:',
            imageError
          );
          processedContent = content;
        }

        console.log('🔵 [Hook] saveContent - Enviando a API...');
        const requestBody = {
          titulo: titulo.trim(),
          tipo,
          contenido: JSON.stringify(processedContent),
        };
        console.log('🔵 [Hook] saveContent - Request body:', {
          titulo: requestBody.titulo,
          tipo: requestBody.tipo,
          contenidoLength: requestBody.contenido.length,
        });

        const response = await fetch('/api/archivos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('🔵 [Hook] saveContent - Respuesta recibida:', {
          status: response.status,
          ok: response.ok,
        });

        if (!response.ok) {
          const error = await response.json();
          console.log('❌ [Hook] saveContent - Error de API:', error);
          throw new Error(error.error || 'Error al guardar');
        }

        const newContent = await response.json();
        console.log(
          '✅ [Hook] saveContent - Contenido guardado exitosamente:',
          { id: newContent.id, titulo: newContent.titulo }
        );

        // Actualizar estado
        console.log(
          '🔵 [Hook] saveContent - Actualizando estado local con nuevo contenido:',
          newContent
        );
        setSavedContents(prev => {
          console.log(
            '🔵 [Hook] saveContent - Estado anterior:',
            prev.length,
            'archivos'
          );
          const newState = [newContent, ...prev];
          console.log(
            '🔵 [Hook] saveContent - Nuevo estado:',
            newState.length,
            'archivos'
          );
          return newState;
        });

        return newContent;
      } catch (error) {
        console.error('Error saving content:', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  // Actualizar contenido existente
  const updateContent = useCallback(
    async (
      id: number,
      editor: Editor,
      titulo: string
    ): Promise<SavedContent | null> => {
      console.log('🔵 [Hook] updateContent - Iniciando actualización:', {
        id,
        titulo,
      });

      if (!editor || !titulo.trim()) {
        console.log('❌ [Hook] updateContent - Datos faltantes:', {
          editor: !!editor,
          titulo: !!titulo.trim(),
        });
        throw new Error('Editor y título son requeridos');
      }

      setIsSaving(true);
      try {
        const content = editor.getJSON();
        console.log('🔵 [Hook] updateContent - Contenido del editor:', {
          contentType: content?.type,
          hasContent: !!content,
        });

        // Validar que sea un JSON de TipTap (type: 'doc')
        if (!content || typeof content !== 'object' || content.type !== 'doc') {
          console.log('❌ [Hook] updateContent - Contenido inválido:', {
            content,
            type: content?.type,
          });
          throw new Error('El contenido no tiene un formato válido de TipTap.');
        }

        // Procesar imágenes base64 antes de guardar
        console.log('🔵 [Hook] updateContent - Procesando imágenes...');
        const processedContent = await processImagesInContent(content);
        console.log('✅ [Hook] updateContent - Imágenes procesadas');

        const tipo =
          savedContents.find(c => c.id === id)?.tipo || 'planificacion';
        console.log('🔵 [Hook] updateContent - Enviando a API:', { id, tipo });

        const response = await fetch(`/api/archivos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titulo: titulo.trim(),
            tipo,
            contenido: JSON.stringify(processedContent),
          }),
        });

        console.log('🔵 [Hook] updateContent - Respuesta recibida:', {
          status: response.status,
          ok: response.ok,
        });

        if (!response.ok) {
          const error = await response.json();
          console.log('❌ [Hook] updateContent - Error de API:', error);
          throw new Error(error.error || 'Error al actualizar');
        }

        const updatedContent = await response.json();
        console.log(
          '✅ [Hook] updateContent - Contenido actualizado exitosamente:',
          { id: updatedContent.id, titulo: updatedContent.titulo }
        );

        // Actualizar estado
        setSavedContents(prev =>
          prev.map(item => (item.id === id ? updatedContent : item))
        );

        return updatedContent;
      } catch (error) {
        console.error('Error updating content:', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [savedContents]
  );

  // Eliminar contenido
  const deleteContent = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/archivos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar');
      }

      // Actualizar estado
      setSavedContents(prev => prev.filter(item => item.id !== id));

      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }, []);

  // Cargar contenido en el editor
  const loadContent = useCallback(
    (id: number): SavedContent | null => {
      const content = savedContents.find(c => c.id === id);
      return content || null;
    },
    [savedContents]
  );

  return {
    isSaving,
    isLoading,
    savedContents,
    loadSavedContents,
    saveContent,
    updateContent,
    deleteContent,
    loadContent,
  };
}
