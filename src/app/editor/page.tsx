'use client'

import { useState, useRef } from 'react'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import ModalIA from '@/components/editor/ModalIA'
import FabPlanificaciones from '@/components/editor/FabPlanificaciones'
import SidebarEditor from '@/components/editor/SidebarEditor'
import SaveContentModal from '@/components/editor/SaveContentModal'
import { SavedContent } from '@/hooks/use-content-save'
import { Editor } from '@tiptap/react'
import { Save, Sparkles } from 'lucide-react'

export default function EditorPage() {
  const [openModalIA, setOpenModalIA] = useState(false)
  const [openSaveModal, setOpenSaveModal] = useState(false)
  const [tipoContenido, setTipoContenido] = useState('planificacion')
  const [currentContent, setCurrentContent] = useState<any>(null)
  const [currentEditor, setCurrentEditor] = useState<Editor | null>(null)
  const [currentFile, setCurrentFile] = useState<SavedContent | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const handleEditorReady = (editor: Editor) => {
    setCurrentEditor(editor)
  }

  const handleLoadContent = (content: SavedContent) => {
    try {
      const parsedContent = JSON.parse(content.contenido)
      // Validar que sea un JSON de TipTap (type: 'doc')
      if (!parsedContent || typeof parsedContent !== 'object' || parsedContent.type !== 'doc') {
        setLoadError('El archivo no tiene un formato válido de TipTap.');
        return;
      }
      setCurrentContent(parsedContent)
      setTipoContenido(content.tipo)
      setCurrentFile(content) // Guardar referencia al archivo actual
      setLoadError(null)
    } catch (error) {
      setLoadError('Error al leer el archivo: formato inválido.')
      console.error('Error parsing content:', error)
    }
  }

  const handleSaveSuccess = (savedContent: SavedContent) => {
    // Actualizar el archivo actual
    setCurrentFile(savedContent)
    console.log('Contenido guardado:', savedContent)
  }

  const handleGenerateIA = () => {
    if (tipoContenido === 'planificacion') {
      setOpenModalIA(true)
    } else {
      // Para materiales, podrías implementar una generación directa sin metodología
      console.log('Generando material de apoyo con IA...')
      // Aquí iría la lógica para generar material sin metodología
    }
  }

  const handleNewContent = (newTipo: string) => {
    // Limpiar archivo actual cuando se cambia de tipo
    setCurrentFile(null)
    setCurrentContent(null)
    setTipoContenido(newTipo)
    
    // Limpiar el editor si está disponible
    if (currentEditor) {
      currentEditor.commands.clearContent()
    }
    
    // Limpiar errores de carga
    setLoadError(null)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fd] flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto mt-6 mb-6 rounded-3xl bg-white/80 shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] flex flex-row overflow-hidden h-[calc(100vh-48px)] min-h-0 max-h-[calc(100vh-48px)]">
        <SidebarEditor 
          selected={tipoContenido} 
          onSelect={handleNewContent}
          currentFile={currentFile}
        />
        <main className="flex-1 min-h-0 flex flex-col relative p-10 overflow-auto">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700 mb-1">
                {tipoContenido === 'planificacion' ? 'Planificación de Clase' : 'Material de Apoyo'}
              </h1>
              <p className="text-gray-500 text-base">
                {tipoContenido === 'planificacion'
                  ? 'Crea y edita la planificación detallada de tus clases'
                  : 'Gestiona el material de apoyo para tus estudiantes'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold shadow hover:from-green-700 hover:to-emerald-600 transition-all text-base flex items-center gap-2"
                onClick={() => setOpenSaveModal(true)}
              >
                <Save className="w-4 h-4" />
                {currentFile ? 'Guardar Cambios' : 'Guardar'}
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold shadow hover:from-indigo-700 hover:to-purple-600 transition-all text-base flex items-center gap-2"
                onClick={handleGenerateIA}
              >
                <Sparkles className="w-4 h-4" />
                Generar con IA
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-start items-stretch">
            <div className="bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] w-full max-w-3xl flex-1 flex flex-col items-center min-h-[600px] max-h-[calc(100vh-220px)] mx-auto h-fit p-10 self-start transition-all overflow-y-auto mt-5">
              {loadError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 text-center">
                  {loadError}
                </div>
              )}
              <SimpleEditor 
                initialContent={currentContent}
                onEditorReady={handleEditorReady}
              />
            </div>
          </div>
          <ModalIA open={openModalIA} onClose={() => setOpenModalIA(false)} />
          <SaveContentModal 
            open={openSaveModal} 
            onClose={() => setOpenSaveModal(false)}
            editor={currentEditor}
            tipoContenido={tipoContenido as 'planificacion' | 'material'}
            onSave={handleSaveSuccess}
            currentFile={currentFile}
          />
        </main>
        <FabPlanificaciones 
          onLoadContent={handleLoadContent} 
          tipoActual={tipoContenido as 'planificacion' | 'material'}
        />
      </div>
    </div>
  )
} 