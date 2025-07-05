'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, Check } from 'lucide-react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import PrimaryButton from '@/components/ui/PrimaryButton';
import FabPlanificaciones from '@/components/editor/FabPlanificaciones';
import { useEvaluacionForm } from '@/hooks/use-evaluacion-form';
import { usePreguntasEditor } from '@/hooks/use-preguntas-editor';
import MatrizSelector from '@/components/evaluacion/MatrizSelector';
import PreguntasSidebarContent from '@/components/evaluacion/PreguntasSidebar';
import SaveModal from '@/components/evaluacion/SaveModal';
import PreguntasDrawer from '@/components/evaluacion/PreguntasDrawer';
import DrawerToggleButton from '@/components/evaluacion/DrawerToggleButton';

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

export default function EvaluacionForm({ 
  modoEdicion = false, 
  evaluacionInicial = null 
}: { 
  modoEdicion?: boolean; 
  evaluacionInicial?: EvaluacionInicial | null; 
}) {
  const router = useRouter();
  const [isSaveHovered, setIsSaveHovered] = useState(false);
  const [dataPreloaded, setDataPreloaded] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentInitialized, setContentInitialized] = useState(false);

  // Hook personalizado
  const {
    loading,
    saving,
    matrices,
    selectedMatriz,
    preguntasExtraidas,
    formData,
    showSaveModal,
    titulo,
    errors,
    showSuccess,
    evaluacionId,
    currentEditor,
    setPreguntasExtraidas,
    setShowSaveModal,
    setTitulo,
    setShowSuccess,
    setEvaluacionId,
    handleEditorReady,
    handleMatrizSelect,
    handleRespuestaCorrectaChange,
    handleSave,
    handleLoadContent,
    clearErrors,
    updateFormData,
    validateForm
  } = useEvaluacionForm();

  const {
    editingPregunta,
    editValue,
    openDropdown,
    setEditValue,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleKeyPress,
    handleDeletePregunta,
    handleDeleteAlternativa,
    handleToggleDropdown,
    handleDropdownAction
  } = usePreguntasEditor();

  // Precargar datos si es edición
  useEffect(() => {
    if (modoEdicion && evaluacionInicial && matrices.length > 0 && !dataPreloaded) {
      // Establecer el ID de la evaluación para modo edición
      console.log('Estableciendo evaluacionId para edición:', evaluacionInicial.id);
      setEvaluacionId(evaluacionInicial.id);
      setTitulo(evaluacionInicial.archivo?.titulo || '');
      
      // Buscar y seleccionar la matriz
      const matriz = matrices.find(m => m.id === evaluacionInicial.matriz?.id);
      if (matriz) {
        handleMatrizSelect(matriz);
      }
      
      // Precargar preguntas y respuestas
      if (evaluacionInicial.preguntas) {
        setPreguntasExtraidas(evaluacionInicial.preguntas);
        
        // Reconstruir respuestas correctas
        const respuestasCorrectas: { [key: number]: string } = {};
        evaluacionInicial.preguntas.forEach((pregunta: any) => {
          const correcta = pregunta.alternativas.find((a: any) => a.esCorrecta);
          if (correcta) {
            respuestasCorrectas[pregunta.numero] = correcta.letra;
          }
        });
        
        updateFormData({
          respuestasCorrectas
        });
      }
      

      
      setDataPreloaded(true);
    }
  }, [modoEdicion, evaluacionInicial, matrices, dataPreloaded]);

  // Establecer contenido inicial cuando el editor esté listo
  useEffect(() => {
    if (editorReady && modoEdicion && evaluacionInicial?.archivo?.contenido && dataPreloaded) {
      try {
        const parsedContent = JSON.parse(evaluacionInicial.archivo.contenido);
        // Usar el editor directamente para establecer el contenido
        if (currentEditor) {
          currentEditor.commands.setContent(parsedContent);
          // También actualizar el formData para mantener sincronización
          updateFormData({
            contenido: parsedContent
          });
        }
      } catch (error) {
        console.error('Error al establecer contenido en el editor:', error);
      }
    }
  }, [editorReady, modoEdicion, evaluacionInicial, dataPreloaded]);

  const handleSaveWithValidation = () => {
    if (modoEdicion || evaluacionId) {
      handleSave();
    } else {
      if (validateForm()) {
        handleSave();
      }
    }
  };

  const handleEditorReadyWithContent = (editor: any) => {
    handleEditorReady(editor);
    setEditorReady(true);
  };

  return (
    <>
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-indigo-700 mb-1">
              {modoEdicion || evaluacionId ? 'Editar Evaluación' : 'Crear Nueva Evaluación'}
            </h1>
            <p className="text-gray-500 text-base">
              {modoEdicion || evaluacionId
                ? 'Edita tu evaluación existente'
                : 'Crea una evaluación basada en una matriz de especificación'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <PrimaryButton
            onMouseEnter={() => setIsSaveHovered(true)}
            onMouseLeave={() => setIsSaveHovered(false)}
            onClick={() => {
              if (!modoEdicion && !evaluacionId) setShowSaveModal(true);
              else handleSaveWithValidation();
            }}
            disabled={
              saving ||
              !selectedMatriz ||
              preguntasExtraidas.length === 0 ||
              preguntasExtraidas.some(p => !formData.respuestasCorrectas[p.numero])
            }
            className="flex items-center gap-2 relative"
          >
            <Save size={20} />
            {modoEdicion || evaluacionId ? 'Actualizar' : 'Guardar'} Evaluación
            {preguntasExtraidas.length > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {Object.keys(formData.respuestasCorrectas).length}/{preguntasExtraidas.length}
              </span>
            )}
            {/* Tooltip personalizado */}
            {isSaveHovered && (
              (saving ||
                !selectedMatriz ||
                preguntasExtraidas.length === 0 ||
                preguntasExtraidas.some(p => !formData.respuestasCorrectas[p.numero])
              ) && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg w-64 text-center pointer-events-none">
                  Debes seleccionar una matriz, agregar preguntas y marcar todas las respuestas correctas para poder guardar.
                </div>
              )
            )}
          </PrimaryButton>
        </div>
      </div>

      {/* Errores generales */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          <span className="text-red-700">{errors.submit}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Principal */}
        <main className="flex-1 flex flex-col overflow-auto">
          {/* Selector de Matriz */}
          <MatrizSelector
            matrices={matrices}
            selectedMatriz={selectedMatriz}
            onMatrizSelect={handleMatrizSelect}
            error={errors.matriz}
          />
          {/* Editor TipTap */}
          <div className="flex-1 flex flex-col mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Contenido de la Evaluación *
            </label>
            {errors.contenido && (
              <p className="mb-2 text-sm text-red-600">{errors.contenido}</p>
            )}
            {errors.preguntas && (
              <p className="mb-2 text-sm text-red-600">{errors.preguntas}</p>
            )}
            <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] p-8 overflow-auto">
              <SimpleEditor 
                onEditorReady={handleEditorReadyWithContent}
                initialContent={null}
              />
            </div>
          </div>
        </main>
        {/* Drawer animado para Respuestas Correctas */}
        <PreguntasDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <PreguntasSidebarContent
            preguntasExtraidas={preguntasExtraidas}
            respuestasCorrectas={formData.respuestasCorrectas}
            onRespuestaChange={handleRespuestaCorrectaChange}
            onPreguntasChange={setPreguntasExtraidas}
            onFormDataChange={updateFormData}
            formData={formData}
            error={errors.respuestas}
          />
        </PreguntasDrawer>
        {/* Oreja siempre visible y animada */}
        <DrawerToggleButton isOpen={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>
      
      {/* FAB para cargar contenido, siempre debajo del drawer */}
      {selectedMatriz && (
        <FabPlanificaciones
          onLoadContent={handleLoadContent}
          tipoActual="evaluacion"
          matrizId={selectedMatriz.id}
          className="z-10 fixed bottom-8 right-8"
        />
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
      {/* Toast de éxito */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check size={20} />
          <span>Evaluación guardada exitosamente</span>
        </div>
      )}
    </>
  );
} 