'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import ModalIA from '@/components/editor/ModalIA'
import FabPlanificaciones from '@/components/editor/FabPlanificaciones'
import SaveContentModal from '@/components/editor/SaveContentModal'
import { SavedContent } from '@/hooks/use-content-save'
import { Editor } from '@tiptap/react'
import { Save, Sparkles, FileText, BookOpen, Edit3, Clock } from 'lucide-react'
import Fab from '@/components/ui/Fab'
import { useContentSave } from '@/hooks/use-content-save'

function EditorPageContent() {
  const searchParams = useSearchParams()
  const [openModalIA, setOpenModalIA] = useState(false)
  const [openSaveModal, setOpenSaveModal] = useState(false)
  const [tipoContenido, setTipoContenido] = useState('planificacion')
  const [currentContent, setCurrentContent] = useState<any>(null)
  const [currentEditor, setCurrentEditor] = useState<Editor | null>(null)
  const [currentFile, setCurrentFile] = useState<SavedContent | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [openFab, setOpenFab] = useState(false)
  const { savedContents, isLoading, loadSavedContents } = useContentSave()

  // Obtener el tipo desde los parámetros de URL
  useEffect(() => {
    const tipo = searchParams.get('tipo')
    if (tipo && (tipo === 'planificacion' || tipo === 'material')) {
      setTipoContenido(tipo)
    }
  }, [searchParams])

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

  // Filtrar archivos guardados por tipo
  const filteredContents = savedContents.filter(content => content.tipo === tipoContenido)

  // Formatear fecha (igual que FabPlanificaciones)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return 'hoy'
    if (diffDays === 2) return 'hace 1 día'
    if (diffDays <= 7) return `hace ${diffDays - 1} días`
    if (diffDays <= 30) return `hace ${Math.floor(diffDays / 7)} semanas`
    if (diffDays <= 365) return `hace ${Math.floor(diffDays / 30)} meses`
    return `hace ${Math.floor(diffDays / 365)} años`
  }

  return (
    <>
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              {tipoContenido === 'planificacion' ? (
                <FileText className="h-6 w-6 text-white" />
              ) : (
                <BookOpen className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {tipoContenido === 'planificacion' ? 'Planificación de Clase' : 'Material de Apoyo'}
              </h1>
              <p className="text-indigo-100 text-sm">
                {tipoContenido === 'planificacion'
                  ? 'Crea y edita la planificación detallada de tus clases'
                  : 'Gestiona el material de apoyo para tus estudiantes'}
              </p>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={() => setOpenSaveModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
            >
              <Save className="w-4 h-4" />
              {currentFile ? 'Guardar Cambios' : 'Guardar'}
            </button>
            <button
              onClick={handleGenerateIA}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              Generar con IA
            </button>
          </div>
        </div>
        
        {/* Stats y información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Tipo de Contenido</p>
                <p className="text-lg font-bold">
                  {tipoContenido === 'planificacion' ? 'Planificación' : 'Material'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Archivos Guardados</p>
                <p className="text-lg font-bold">
                  {filteredContents.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información del archivo actual */}
        {currentFile && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <p className="text-indigo-100 text-sm">
              <strong>Editando:</strong> {currentFile.titulo}
              <span className="ml-2 text-indigo-200">
                (Creado: {currentFile.createdAt ? formatDate(currentFile.createdAt) : 'Fecha no disponible'})
              </span>
            </p>
          </div>
        )}
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
      <Fab 
        onClick={() => setOpenFab(!openFab)}
        open={openFab}
        onClose={() => setOpenFab(false)}
        ariaLabel={openFab ? 'Cerrar archivos' : 'Abrir archivos guardados'}
      />
      {openFab && (
        <div
          data-fab-panel
          className="fixed top-24 right-22 w-[380px] bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] border border-gray-100 z-40 px-8 pt-8 pb-4 flex flex-col gap-4 animate-fade-in"
          style={{ minWidth: 340, maxHeight: 'calc(100vh - 120px)' }}
        >
          <h2 className="text-lg font-bold text-indigo-700 mb-4">
            {tipoContenido === 'planificacion' ? 'Planificaciones Guardadas' : 'Materiales Guardados'}
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cargando...</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16V8a2 2 0 012-2h8a2 2 0 012 2v8m-2 4h-4a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z" /></svg>
              <p className="text-sm text-gray-500">No hay archivos guardados</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
              {filteredContents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer border border-transparent hover:bg-indigo-50 transition-all group"
                  onClick={() => handleLoadContent(content)}
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16V8a2 2 0 012-2h8a2 2 0 012 2v8m-2 4h-4a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z" /></svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate group-hover:underline">
                      {content.titulo}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3 text-gray-300 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                      {formatDate(content.createdAt || '')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditorPageContent />
    </Suspense>
  );
} 