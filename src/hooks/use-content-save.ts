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

// Función para procesar imágenes base64 en el contenido
async function processImagesInContent(content: any): Promise<any> {
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
        async (node: any) => await processImagesInContent(node)
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
      if (!editor || !titulo.trim()) {
        throw new Error('Editor y título son requeridos');
      }

      setIsSaving(true);
      try {
        const content = editor.getJSON();
        // Validar que sea un JSON de TipTap (type: 'doc')
        if (!content || typeof content !== 'object' || content.type !== 'doc') {
          throw new Error('El contenido no tiene un formato válido de TipTap.');
        }

        // Procesar imágenes base64 antes de guardar
        const processedContent = await processImagesInContent(content);

        const response = await fetch('/api/archivos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titulo: titulo.trim(),
            tipo,
            contenido: JSON.stringify(processedContent),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al guardar');
        }

        const newContent = await response.json();

        // Actualizar estado
        setSavedContents(prev => [newContent, ...prev]);

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
      if (!editor || !titulo.trim()) {
        throw new Error('Editor y título son requeridos');
      }

      setIsSaving(true);
      try {
        const content = editor.getJSON();
        // Validar que sea un JSON de TipTap (type: 'doc')
        if (!content || typeof content !== 'object' || content.type !== 'doc') {
          throw new Error('El contenido no tiene un formato válido de TipTap.');
        }

        // Procesar imágenes base64 antes de guardar
        const processedContent = await processImagesInContent(content);

        const response = await fetch(`/api/archivos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titulo: titulo.trim(),
            tipo: savedContents.find(c => c.id === id)?.tipo || 'planificacion',
            contenido: JSON.stringify(processedContent),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al actualizar');
        }

        const updatedContent = await response.json();

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
