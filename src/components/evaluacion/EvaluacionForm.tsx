'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Check,
  FileText,
  Target,
} from 'lucide-react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Editor } from '@tiptap/react';

import PrimaryButton from '@/components/ui/PrimaryButton';

import { useEvaluacionForm } from '@/hooks/use-evaluacion-form';

import MatrizSelector from '@/components/evaluacion/MatrizSelector';
import PreguntasSidebarContent from '@/components/evaluacion/PreguntasSidebar';
import SaveModal from '@/components/evaluacion/SaveModal';
import Drawer from '@/components/ui/Drawer';
import DrawerToggle from '@/components/ui/DrawerToggle';
import Fab from '@/components/ui/Fab';

interface EvaluacionInicial {
  id: number;
  archivo?: {
    id: number;
    titulo: string;
    contenido: string;
  };
  matriz?: {
    id: number;
    nombre: string;
  };
  preguntas?: Array<{
    numero: number;
    texto: string;
    alternativas: Array<{
      letra: string;
      texto: string;
      esCorrecta: boolean;
    }>;
  }>;
}

interface EvaluacionListItem {
  id: number;
  titulo?: string;
  archivo?: {
    id: number;
    titulo: string;
    createdAt?: string;
  };
  createdAt?: string;
  matrizId?: number;
}

export default function EvaluacionForm({
  modoEdicion = false,
  evaluacionInicial = null,
}: {
  modoEdicion?: boolean;
  evaluacionInicial?: EvaluacionInicial | null;
}) {
  const router = useRouter();
  const [isSaveHovered, setIsSaveHovered] = useState(false);
  const [dataPreloaded, setDataPreloaded] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [openFab, setOpenFab] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionListItem[]>([]);
  const [loadingEvals, setLoadingEvals] = useState(false);
  const [shouldSetInitialContent, setShouldSetInitialContent] = useState(false);
  const lastEvaluacionId = useRef<number | null>(null);

  // Hook personalizado
  const {
    saving,
    matrices,
    selectedMatriz,
    preguntasExtraidas,
    formData,
    showSaveModal,
    titulo,
    errors,
    evaluacionId,
    currentEditor,
    setPreguntasExtraidas,
    setShowSaveModal,
    setTitulo,
    handleEditorReady,
    handleMatrizSelect,
    handleRespuestaCorrectaChange,
    handleIndicadorChange,
    handleSave,
    handleLoadContent,
    updateFormData,
    validateForm,
  } = useEvaluacionForm();

  // Precargar datos si es edición
  useEffect(() => {
    if (
      modoEdicion &&
      evaluacionInicial &&
      matrices.length > 0 &&
      !dataPreloaded
    ) {
      console.log(
        '🔍 [EvaluacionForm] Precargando datos de evaluación inicial:',
        evaluacionInicial
      );

      // Cargar el título inicial
      if (evaluacionInicial.archivo?.titulo) {
        setTitulo(evaluacionInicial.archivo.titulo);
      }

      // Usar handleLoadContent para cargar todos los datos incluyendo indicadores
      handleLoadContent(evaluacionInicial);
      setDataPreloaded(true);
    }
  }, [
    modoEdicion,
    evaluacionInicial,
    matrices.length,
    dataPreloaded,
    handleLoadContent,
    setTitulo,
  ]);

  // Detectar cuando se carga una evaluación nueva (modo edición o desde FAB)
  useEffect(() => {
    if (
      (modoEdicion || evaluacionId) &&
      evaluacionId !== lastEvaluacionId.current
    ) {
      setShouldSetInitialContent(true);
      lastEvaluacionId.current = evaluacionId;
      console.log(
        '[EvaluacionForm] Se va a setear initialContent para evaluación:',
        evaluacionId
      );
    }
  }, [modoEdicion, evaluacionId]);

  // Establecer contenido inicial cuando el editor esté listo
  useEffect(() => {
    if (
      editorReady &&
      modoEdicion &&
      evaluacionInicial?.archivo?.contenido &&
      dataPreloaded
    ) {
      try {
        // Verificar que el contenido no esté vacío y sea un string válido
        const contenido = evaluacionInicial.archivo.contenido.trim();
        if (!contenido) {
          console.log(
            '[EvaluacionForm] Contenido vacío, saltando carga inicial'
          );
          return;
        }

        // Intentar parsear como JSON primero
        let parsedContent;
        try {
          parsedContent = JSON.parse(contenido);
        } catch (jsonError) {
          console.warn(
            '[EvaluacionForm] Contenido no es JSON válido, intentando como texto plano:',
            jsonError
          );
          // Si no es JSON válido, crear un contenido básico de TipTap
          parsedContent = {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: contenido,
                  },
                ],
              },
            ],
          };
        }

        // Usar el editor directamente para establecer el contenido
        if (currentEditor) {
          currentEditor.commands.setContent(parsedContent);
          // También actualizar el formData para mantener sincronización
          updateFormData({
            contenido: parsedContent,
          });
          console.log(
            '[EvaluacionForm] Contenido cargado exitosamente en modo edición'
          );
        }
      } catch (error) {
        console.error('Error al establecer contenido en el editor:', error);
        console.log(
          'Contenido que causó el error:',
          evaluacionInicial.archivo.contenido
        );

        // Crear un contenido básico como fallback
        const fallbackContent = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Error al cargar el contenido original. Por favor, edita manualmente.',
                },
              ],
            },
          ],
        };

        if (currentEditor) {
          try {
            currentEditor.commands.setContent(fallbackContent);
            updateFormData({
              contenido: fallbackContent,
            });
            console.log('[EvaluacionForm] Contenido fallback cargado');
          } catch (fallbackError) {
            console.error('Error al cargar contenido fallback:', fallbackError);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorReady, modoEdicion, evaluacionInicial, dataPreloaded]);

  // Cargar evaluaciones cuando se abre el FAB y hay una matriz seleccionada
  useEffect(() => {
    if (selectedMatriz && openFab) {
      setLoadingEvals(true);
      fetch(`/api/evaluaciones`)
        .then(res => res.json())
        .then(data => {
          setEvaluaciones(
            Array.isArray(data)
              ? data.filter(e => e.matrizId === selectedMatriz.id)
              : []
          );
        })
        .finally(() => setLoadingEvals(false));
    }
  }, [selectedMatriz, openFab]);

  // Formatear fecha (igual que FabPlanificaciones)
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

  const handleLoadEvaluacion = async (evaluacion: EvaluacionListItem) => {
    try {
      const response = await fetch(`/api/evaluaciones/${evaluacion.id}`);
      if (response.ok) {
        const evaluacionCompleta = await response.json();
        handleLoadContent(evaluacionCompleta);
      } else {
        console.error('Error al cargar evaluación completa');
      }
    } catch (error) {
      console.error('Error al cargar evaluación:', error);
    }
    setOpenFab(false);
  };

  const handleSaveWithValidation = () => {
    console.log('[EvaluacionForm] handleSaveWithValidation llamado', {
      modoEdicion,
      evaluacionId,
      selectedMatriz: !!selectedMatriz,
      preguntasExtraidas: preguntasExtraidas.length,
    });

    if (modoEdicion || evaluacionId) {
      console.log('[EvaluacionForm] Llamando handleSave()');
      handleSave();
    } else {
      if (validateForm()) {
        handleSave();
      }
    }
  };

  const handleEditorReadyWithContent = (editor: Editor) => {
    handleEditorReady(editor);
    setEditorReady(true);
    if (
      shouldSetInitialContent &&
      (modoEdicion || evaluacionId) &&
      formData.contenido
    ) {
      try {
        editor.commands.setContent(formData.contenido);
        setShouldSetInitialContent(false);
        console.log('[EvaluacionForm] setContent ejecutado en editorReady');
      } catch (e) {
        console.error('[EvaluacionForm] Error al setear contenido inicial:', e);
      }
    }
  };

  return (
    <>
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/80 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {modoEdicion || evaluacionId
                  ? 'Editar Evaluación'
                  : 'Crear Nueva Evaluación'}
              </h1>
              {modoEdicion ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Título de la evaluación"
                    className="px-3 py-1.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-colors text-sm"
                  />
                </div>
              ) : (
                <p className="text-indigo-100 text-sm">
                  Crea una evaluación basada en una matriz de especificación
                </p>
              )}
            </div>
          </div>

          {/* Botón de acción */}
          <PrimaryButton
            onMouseEnter={() => setIsSaveHovered(true)}
            onMouseLeave={() => setIsSaveHovered(false)}
            onClick={() => {
              console.log('[EvaluacionForm] Botón clickeado', {
                modoEdicion,
                evaluacionId,
                saving,
                selectedMatriz: !!selectedMatriz,
                preguntasExtraidas: preguntasExtraidas.length,
                respuestasCorrectas: Object.keys(formData.respuestasCorrectas)
                  .length,
              });

              const isDisabled =
                saving ||
                !selectedMatriz ||
                preguntasExtraidas.length === 0 ||
                preguntasExtraidas.some(
                  p => !formData.respuestasCorrectas[p.numero]
                );

              console.log('[EvaluacionForm] Botón disabled:', isDisabled, {
                saving,
                noSelectedMatriz: !selectedMatriz,
                noPreguntas: preguntasExtraidas.length === 0,
                preguntasSinRespuesta: preguntasExtraidas.some(
                  p => !formData.respuestasCorrectas[p.numero]
                ),
              });

              if (!modoEdicion && !evaluacionId) setShowSaveModal(true);
              else handleSaveWithValidation();
            }}
            disabled={
              saving ||
              !selectedMatriz ||
              preguntasExtraidas.length === 0 ||
              preguntasExtraidas.some(
                p => !formData.respuestasCorrectas[p.numero]
              )
            }
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
          >
            <Save className="w-4 h-4" />
            {modoEdicion || evaluacionId ? 'Actualizar' : 'Guardar'} Evaluación
            {preguntasExtraidas.length > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {Object.keys(formData.respuestasCorrectas).length}/
                {preguntasExtraidas.length}
              </span>
            )}
            {/* Tooltip personalizado */}
            {isSaveHovered &&
              (saving ||
                !selectedMatriz ||
                preguntasExtraidas.length === 0 ||
                preguntasExtraidas.some(
                  p => !formData.respuestasCorrectas[p.numero]
                )) && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg w-64 text-center pointer-events-none">
                  Debes seleccionar una matriz, agregar preguntas y marcar todas
                  las respuestas correctas para poder guardar.
                </div>
              )}
          </PrimaryButton>
        </div>

        {/* Stats y información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Matriz Seleccionada</p>
                <p className="text-lg font-bold">
                  {selectedMatriz ? selectedMatriz.nombre : 'Ninguna'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Preguntas Creadas</p>
                <p className="text-lg font-bold">{preguntasExtraidas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Respuestas Marcadas</p>
                <p className="text-lg font-bold">
                  {Object.keys(formData.respuestasCorrectas).length}/
                  {preguntasExtraidas.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fila de MatrizSelector */}
      <div className="mb-6">
        <MatrizSelector
          matrices={matrices}
          selectedMatriz={selectedMatriz}
          onMatrizSelect={handleMatrizSelect}
          error={errors.matriz}
        />
      </div>

      {/* Errores generales */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          <span className="text-red-700">{errors.submit}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Editor Principal */}
        <main className="flex-1 flex flex-col">
          {/* Editor TipTap */}
          <div className="flex flex-col mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Contenido de la Evaluación *
            </label>
            {errors.contenido && (
              <p className="mb-2 text-sm text-red-600">{errors.contenido}</p>
            )}
            {errors.preguntas && (
              <p className="mb-2 text-sm text-red-600">{errors.preguntas}</p>
            )}
            {selectedMatriz ? (
              <div className="bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] p-8 min-h-[400px]">
                <SimpleEditor onEditorReady={handleEditorReadyWithContent} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-transparent">
                <span className="text-lg font-semibold mb-2">
                  Selecciona una matriz para comenzar a crear tu evaluación
                </span>
                <span className="text-sm">
                  El editor aparecerá aquí una vez que elijas una matriz de
                  especificación.
                </span>
              </div>
            )}
          </div>
        </main>
        {/* Drawer animado para Respuestas Correctas */}
        <Drawer
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          width={600}
        >
          <PreguntasSidebarContent
            preguntasExtraidas={preguntasExtraidas}
            respuestasCorrectas={formData.respuestasCorrectas}
            onRespuestaChange={handleRespuestaCorrectaChange}
            onPreguntasChange={setPreguntasExtraidas}
            onFormDataChange={updateFormData}
            formData={formData}
            error={errors.respuestas || errors.indicadores}
            selectedMatriz={selectedMatriz}
            indicadoresAsignados={formData.indicadoresAsignados}
            onIndicadorChange={handleIndicadorChange}
          />
        </Drawer>
        {/* Oreja siempre visible y animada */}
        <DrawerToggle
          isOpen={sidebarOpen}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Nuevo Fab global */}
      {selectedMatriz && (
        <>
          <Fab
            onClick={() => setOpenFab(!openFab)}
            open={openFab}
            onClose={() => setOpenFab(false)}
            ariaLabel={
              openFab ? 'Cerrar archivos' : 'Abrir evaluaciones guardadas'
            }
            className="z-10 fixed bottom-8 right-8"
          />
          {/* Panel flotante de evaluaciones guardadas */}
          {openFab && (
            <div
              data-fab-panel
              className="fixed top-24 right-22 w-[380px] bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] border border-gray-100 z-40 px-8 pt-8 pb-4 flex flex-col gap-4 animate-fade-in"
              style={{ minWidth: 340, maxHeight: 'calc(100vh - 120px)' }}
            >
              <h2 className="text-lg font-bold text-indigo-700 mb-4">
                Evaluaciones Guardadas
              </h2>
              {loadingEvals ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando...</p>
                </div>
              ) : evaluaciones.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16V8a2 2 0 012-2h8a2 2 0 012 2v8m-2 4h-4a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    No hay evaluaciones guardadas
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
                  {evaluaciones.map(evaluacion => (
                    <div
                      key={evaluacion.id}
                      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer border border-transparent hover:bg-indigo-50 transition-all group"
                      onClick={() => handleLoadEvaluacion(evaluacion)}
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16V8a2 2 0 012-2h8a2 2 0 012 2v8m-2 4h-4a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z"
                          />
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate group-hover:underline">
                          {evaluacion.archivo?.titulo || evaluacion.titulo}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 text-gray-300 mr-1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4l3 3"
                            />
                          </svg>
                          {formatDate(
                            evaluacion.createdAt ||
                              evaluacion.archivo?.createdAt ||
                              ''
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* Modal de Guardado */}
      {!modoEdicion && !evaluacionId && (
        <SaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveWithValidation}
          titulo={titulo}
          onTituloChange={setTitulo}
          saving={saving}
          error={errors.titulo}
        />
      )}
    </>
  );
}
