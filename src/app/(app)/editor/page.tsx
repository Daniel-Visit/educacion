'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import ModalIA from '@/components/editor/ModalIA';

import SaveContentModal from '@/components/editor/SaveContentModal';
import { SavedContent } from '@/hooks/use-content-save';
import { Editor } from '@tiptap/react';

// Tipo para el contenido de TipTap
interface TipTapContent {
  type: 'doc';
  content?: unknown[];
  [key: string]: unknown;
}
import { Save, Sparkles, FileText, BookOpen, Clock } from 'lucide-react';
import Fab from '@/components/ui/Fab';
import { useContentSave } from '@/hooks/use-content-save';

function EditorPageContent() {
  const searchParams = useSearchParams();
  const [openModalIA, setOpenModalIA] = useState(false);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [tipoContenido, setTipoContenido] = useState('planificacion');
  const [currentContent, setCurrentContent] = useState<TipTapContent | null>(
    null
  );
  const [currentEditor, setCurrentEditor] = useState<Editor | null>(null);
  const [currentFile, setCurrentFile] = useState<SavedContent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openFab, setOpenFab] = useState(false);
  const { savedContents, isLoading, loadSavedContents } = useContentSave();

  // Obtener el tipo desde los parámetros de URL
  useEffect(() => {
    const tipo = searchParams.get('tipo');
    if (tipo && (tipo === 'planificacion' || tipo === 'material')) {
      setTipoContenido(tipo);
    }
  }, [searchParams]);

  const handleEditorReady = (editor: Editor) => {
    setCurrentEditor(editor);
  };

  const handleLoadContent = (content: SavedContent) => {
    try {
      const parsedContent = JSON.parse(content.contenido);
      // Validar que sea un JSON de TipTap (type: 'doc')
      if (
        !parsedContent ||
        typeof parsedContent !== 'object' ||
        parsedContent.type !== 'doc'
      ) {
        setLoadError('El archivo no tiene un formato válido de TipTap.');
        return;
      }
      setCurrentContent(parsedContent);
      setTipoContenido(content.tipo);
      setCurrentFile(content); // Guardar referencia al archivo actual
      setLoadError(null);
    } catch (error) {
      setLoadError('Error al leer el archivo: formato inválido.');
      console.error('Error parsing content:', error);
    }
  };

  const handleSaveSuccess = (savedContent: SavedContent) => {
    // Actualizar el archivo actual
    setCurrentFile(savedContent);
    console.log('Contenido guardado:', savedContent);

    // Recargar la lista de archivos guardados para que el FAB se actualice
    loadSavedContents();
  };

  const handleGenerateIA = () => {
    if (tipoContenido === 'planificacion') {
      setOpenModalIA(true);
    } else {
      // Para materiales, podrías implementar una generación directa sin metodología
      console.log('Generando material de apoyo con IA...');
      // Aquí iría la lógica para generar material sin metodología
    }
  };

  // Filtrar archivos guardados por tipo
  const filteredContents = savedContents.filter(
    content => content.tipo === tipoContenido
  );

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'hoy';
    if (diffDays === 2) return 'hace 1 día';
    if (diffDays <= 7) return `hace ${diffDays - 1} días`;
    if (diffDays <= 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays <= 365) return `hace ${Math.floor(diffDays / 30)} meses`;
    return `hace ${Math.floor(diffDays / 365)} años`;
  };

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
                {tipoContenido === 'planificacion'
                  ? 'Planificación de Clase'
                  : 'Material de Apoyo'}
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
                  {tipoContenido === 'planificacion'
                    ? 'Planificación'
                    : 'Material'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Archivos Guardados</p>
                <p className="text-lg font-bold">{filteredContents.length}</p>
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
                (Creado:{' '}
                {currentFile.createdAt
                  ? formatDate(currentFile.createdAt)
                  : 'Fecha no disponible'}
                )
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-start">
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] w-full max-w-3xl flex-1 flex flex-col items-center min-h-[600px] max-h-[calc(100vh-220px)] mx-auto h-fit p-10 self-start transition-all overflow-y-auto mt-5">
          {loadError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 text-center">
              {loadError}
            </div>
          )}
          <SimpleEditor
            initialContent={currentContent || undefined}
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
          className="fixed top-24 right-22 w-[480px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-12px_rgba(99,102,241,0.25)] border border-white/20 z-40 overflow-hidden animate-fade-in"
          style={{ minWidth: 440, maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  {tipoContenido === 'planificacion' ? (
                    <FileText className="w-5 h-5 text-white" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {tipoContenido === 'planificacion'
                      ? 'Planificaciones Guardadas'
                      : 'Materiales Guardados'}
                  </h2>
                  <p className="text-indigo-100 text-sm">
                    {filteredContents.length} archivo
                    {filteredContents.length !== 1 ? 's' : ''} disponible
                    {filteredContents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          {/* Contenido */}
          <div className="px-8 py-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Cargando archivos...
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Buscando en tu biblioteca
                </p>
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16V8a2 2 0 012-2h8a2 2 0 012 2v8m-2 4h-4a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay archivos guardados
                </h3>
                <p className="text-gray-500 text-sm">
                  Crea tu primera{' '}
                  {tipoContenido === 'planificacion'
                    ? 'planificación'
                    : 'material'}{' '}
                  para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 pt-3 pb-3">
                {filteredContents.map(content => (
                  <div
                    key={content.id}
                    className="group relative bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 rounded-2xl p-4 cursor-pointer border border-gray-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    onClick={() => handleLoadContent(content)}
                  >
                    {/* Indicador de hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-indigo-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200 rounded-2xl flex items-center justify-center transition-all duration-300">
                        {tipoContenido === 'planificacion' ? (
                          <FileText className="w-6 h-6 text-indigo-600" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors duration-200">
                          {content.titulo}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              {formatDate(content.createdAt || '')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Badge del tipo a la derecha */}
                      {content.tipo && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full group-hover:bg-indigo-200 transition-colors duration-200 whitespace-nowrap">
                          {content.tipo}
                        </span>
                      )}

                      {/* Flecha de acción */}
                      <div className="w-8 h-8 bg-white/80 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110">
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditorPageContent />
    </Suspense>
  );
}
