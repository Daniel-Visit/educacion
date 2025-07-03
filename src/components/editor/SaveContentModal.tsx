'use client'

import { useState, useEffect } from 'react'
import { X, Save, FileText, BookOpen } from 'lucide-react'
import { useContentSave, SavedContent } from '@/hooks/use-content-save'
import { Editor } from '@tiptap/react'

interface SaveContentModalProps {
  open: boolean
  onClose: () => void
  editor: Editor | null
  tipoContenido: 'planificacion' | 'material'
  onSave?: (savedContent: SavedContent) => void
  currentFile?: SavedContent | null
}

export default function SaveContentModal({
  open,
  onClose,
  editor,
  tipoContenido,
  onSave,
  currentFile
}: SaveContentModalProps) {
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<'planificacion' | 'material'>(tipoContenido)
  const { saveContent, updateContent, isSaving } = useContentSave()

  useEffect(() => {
    if (open) {
      setTipo(tipoContenido)
      // Pre-cargar el título si ya existe un archivo
      if (currentFile) {
        setTitulo(currentFile.titulo)
      } else {
        setTitulo('')
      }
    }
  }, [open, tipoContenido, currentFile])

  const handleSave = async () => {
    if (!editor || !titulo.trim()) {
      return
    }

    try {
      let savedContent: SavedContent | null = null

      if (currentFile) {
        // Actualizar archivo existente
        savedContent = await updateContent(currentFile.id!, editor, titulo)
      } else {
        // Crear nuevo archivo
        savedContent = await saveContent(editor, titulo, tipo)
      }

      if (savedContent && onSave) {
        onSave(savedContent)
      }
      onClose()
    } catch (error) {
      console.error('Error saving content:', error)
      // Aquí podrías mostrar un toast de error
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <Save className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {currentFile ? 'Guardar Cambios' : 'Guardar Contenido'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del documento
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa un título descriptivo..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              autoFocus
            />
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
            disabled={!titulo.trim() || isSaving}
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
  )
} 