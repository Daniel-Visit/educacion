'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, Check } from 'lucide-react'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import PrimaryButton from '@/components/ui/PrimaryButton'
import FabPlanificaciones from '@/components/editor/FabPlanificaciones'
import { useEvaluacionForm } from '@/hooks/use-evaluacion-form'
import { usePreguntasEditor } from '@/hooks/use-preguntas-editor'
import MatrizSelector from '@/components/evaluacion/MatrizSelector'
import PreguntasSidebar from '@/components/evaluacion/PreguntasSidebar'
import SaveModal from '@/components/evaluacion/SaveModal'

export default function CrearEvaluacionPage() {
  const router = useRouter()
  const [isSaveHovered, setIsSaveHovered] = useState(false)
  
  const {
    // Estado
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
    
    // Setters
    setPreguntasExtraidas,
    setShowSaveModal,
    setTitulo,
    setShowSuccess,
    
    // Handlers
    handleEditorReady,
    handleMatrizSelect,
    handleRespuestaCorrectaChange,
    handleSave,
    handleLoadContent,
    clearErrors,
    updateFormData,
    
    // Utilidades
    validateForm
  } = useEvaluacionForm()

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
  } = usePreguntasEditor()

  const handleSaveWithValidation = () => {
    if (evaluacionId) {
      handleSave()
    } else {
      if (validateForm()) {
        handleSave()
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fd] flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto mt-6 mb-6 rounded-3xl bg-white/80 shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] flex flex-col overflow-hidden h-[calc(100vh-48px)] min-h-0 max-h-[calc(100vh-48px)]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-200 bg-white/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-indigo-700 mb-1">
                  {evaluacionId ? 'Editar Evaluación' : 'Crear Nueva Evaluación'}
                </h1>
                <p className="text-gray-500 text-base">
                  {evaluacionId 
                    ? 'Edita tu evaluación existente' 
                    : 'Crea una evaluación basada en una matriz de especificación'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <PrimaryButton 
                onMouseEnter={() => setIsSaveHovered(true)}
                onMouseLeave={() => setIsSaveHovered(false)}
                onClick={() => {
                  if (!evaluacionId) setShowSaveModal(true)
                  else handleSaveWithValidation()
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
                {evaluacionId ? 'Actualizar' : 'Guardar'} Evaluación
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
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} className="text-red-600" />
              <span className="text-red-700">{errors.submit}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Editor Principal */}
          <main className="flex-1 flex flex-col p-8 overflow-auto">
            
            {/* Selector de Matriz */}
            <MatrizSelector
              matrices={matrices}
              selectedMatriz={selectedMatriz}
              onMatrizSelect={handleMatrizSelect}
              error={errors.matriz}
            />

            {/* Editor TipTap */}
            <div className="flex-1 flex flex-col">
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
                  onEditorReady={handleEditorReady}
                />
              </div>
            </div>
          </main>

          {/* Sidebar para Respuestas Correctas */}
          <PreguntasSidebar
            preguntasExtraidas={preguntasExtraidas}
            respuestasCorrectas={formData.respuestasCorrectas}
            onRespuestaChange={handleRespuestaCorrectaChange}
            onPreguntasChange={setPreguntasExtraidas}
            onFormDataChange={updateFormData}
            formData={formData}
            error={errors.respuestas}
          />
        </div>

        {/* FAB para cargar contenido */}
        {selectedMatriz && (
          <FabPlanificaciones
            onLoadContent={handleLoadContent}
            tipoActual="evaluacion"
            matrizId={selectedMatriz.id}
          />
        )}

        {/* Modal de Guardado */}
        {!evaluacionId && (
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
      </div>
    </div>
  )
} 