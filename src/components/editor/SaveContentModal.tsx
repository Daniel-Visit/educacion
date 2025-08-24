'use client';

import { useState, useEffect } from 'react';
import { X, Save, FileText, BookOpen } from 'lucide-react';
import { useContentSave, SavedContent } from '@/hooks/use-content-save';
import { Button } from '@/components/ui/button';
import { Editor } from '@tiptap/react';

interface SaveContentModalProps {
  open: boolean;
  onClose: () => void;
  editor: Editor | null;
  tipoContenido: 'planificacion' | 'material';
  onSave?: (savedContent: SavedContent) => void;
  currentFile?: SavedContent | null;
}

export default function SaveContentModal({
  open,
  onClose,
  editor,
  tipoContenido,
  onSave,
  currentFile,
}: SaveContentModalProps) {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<'planificacion' | 'material'>(tipoContenido);
  const { saveContent, updateContent, isSaving } = useContentSave();

  useEffect(() => {
    if (open) {
      setTipo(tipoContenido);
      // Pre-cargar el título si ya existe un archivo
      if (currentFile) {
        setTitulo(currentFile.titulo);
      } else {
        setTitulo('');
      }
    }
  }, [open, tipoContenido, currentFile]);

  const handleSave = async () => {
    console.log('🔵 [Modal] handleSave - Iniciando guardado');

    if (!editor) {
      console.log('❌ [Modal] handleSave - No hay editor');
      return;
    }

    // Para archivos nuevos, validar que tenga título
    if (!currentFile && !titulo.trim()) {
      console.log('❌ [Modal] handleSave - No hay título para archivo nuevo');
      return;
    }

    // Prevenir múltiples llamadas
    if (isSaving) {
      console.log('⚠️ [Modal] handleSave - Ya se está guardando');
      return;
    }

    try {
      console.log('🔵 [Modal] handleSave - Ejecutando guardado:', {
        isUpdate: !!currentFile,
        titulo: currentFile ? currentFile.titulo : titulo,
      });

      let savedContent: SavedContent | null = null;

      if (currentFile) {
        // Actualizar archivo existente - usar el título original
        savedContent = await updateContent(
          currentFile.id!,
          editor,
          currentFile.titulo
        );
      } else {
        // Crear nuevo archivo
        savedContent = await saveContent(editor, titulo, tipo);
      }

      console.log('✅ [Modal] handleSave - Guardado exitoso:', savedContent);

      if (savedContent && onSave) {
        onSave(savedContent);
      }
      onClose();
    } catch (error) {
      console.error('❌ [Modal] handleSave - Error:', error);
      // Aquí podrías mostrar un toast de error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Save className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {currentFile ? 'Guardar Cambios' : 'Guardar Contenido'}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {currentFile
                    ? `Actualizando: ${currentFile.titulo}`
                    : 'Crea un nuevo documento en tu biblioteca'}
                </p>
              </div>
            </div>

            {/* Botón de cerrar */}
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          {/* Form */}
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del documento
              </label>
              {currentFile ? (
                // Para archivos existentes, mostrar el título como texto no editable
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {currentFile.titulo}
                </div>
              ) : (
                // Para archivos nuevos, permitir editar el título
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ingresa un título descriptivo..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  autoFocus
                />
              )}
            </div>

            {/* Tipo de contenido - solo mostrar si es un archivo nuevo */}
            {!currentFile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de contenido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('planificacion')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      tipo === 'planificacion'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-medium">Planificación</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('material')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      tipo === 'material'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs font-medium">Material</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={(!currentFile && !titulo.trim()) || isSaving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-lg hover:from-indigo-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {currentFile ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
