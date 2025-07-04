import React, { useState, useEffect } from 'react';
import { FileText, Clock, X } from 'lucide-react';
import { useContentSave, SavedContent } from '@/hooks/use-content-save';

interface FabPlanificacionesProps {
  onLoadContent?: (content: SavedContent) => void
  tipoActual: 'planificacion' | 'material' | 'evaluacion'
  matrizId?: number | null
  disabled?: boolean
}

export default function FabPlanificaciones({ onLoadContent, tipoActual, matrizId, disabled }: FabPlanificacionesProps) {
  const [open, setOpen] = useState(false);
  const { savedContents, isLoading } = useContentSave();
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [loadingEvals, setLoadingEvals] = useState(false);

  useEffect(() => {
    if (tipoActual === 'evaluacion' && matrizId && open) {
      setLoadingEvals(true)
      fetch(`/api/evaluaciones`)
        .then(res => res.json())
        .then(data => {
          setEvaluaciones(Array.isArray(data) ? data.filter(e => e.matrizId === matrizId) : [])
        })
        .finally(() => setLoadingEvals(false))
    }
  }, [tipoActual, matrizId, open])

  let filteredContents = savedContents.filter(content => content.tipo === tipoActual);
  if (tipoActual === 'evaluacion' && matrizId) {
    filteredContents = evaluaciones;
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'planificacion':
        return 'Planificaciones'
      case 'material':
        return 'Materiales'
      case 'evaluacion':
        return 'Evaluaciones'
      default:
        return 'Documentos'
    }
  }

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

  const handleLoadContent = (content: any) => {
    if (onLoadContent) {
      onLoadContent(content)
    }
    setOpen(false)
  }

  return (
    <>
      {/* FAB */}
      <button
        className={`fixed bottom-8 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-500 text-white text-4xl flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 active:scale-95 focus:outline-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
        aria-label={open ? "Cerrar archivos" : `Abrir ${getTypeLabel(tipoActual).toLowerCase()}`}
        disabled={disabled}
      >
        {open ? <X size={36} className="text-white" /> : <FileText size={32} className="text-white" />}
      </button>
      
      {/* Panel flotante */}
      {open && (
        <div
          className="fixed top-24 right-20 w-[380px] bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] border border-gray-100 z-40 px-8 pt-8 pb-4 flex flex-col gap-4 animate-fade-in"
          style={{ minWidth: 340, maxHeight: 'calc(100vh - 120px)' }}
        >
          <h2 className="text-lg font-bold text-indigo-700 mb-4">{getTypeLabel(tipoActual)} Guardados</h2>
          
          {tipoActual === 'evaluacion' && loadingEvals ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cargando...</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No hay {getTypeLabel(tipoActual).toLowerCase()} guardados</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
              {filteredContents.map((content: any) => (
                <div
                  key={content.id}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer border border-transparent hover:bg-indigo-50 transition-all group"
                  onClick={() => handleLoadContent(content)}
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600">
                    <FileText size={22} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate group-hover:underline">
                      {content.titulo || content.archivo?.titulo}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={12} className="text-gray-300 mr-1" />
                      {formatDate(content.createdAt || content.archivo?.createdAt || '')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
} 