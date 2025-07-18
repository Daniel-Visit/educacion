'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Plus, FileText, CheckCircle2, BarChart3, Calendar, Target, Users, Clock } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';

interface Evaluacion {
  id: number;
  titulo: string;
  matrizNombre?: string;
  preguntasCount?: number;
  createdAt?: string;
}

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/evaluaciones')
      .then(res => res.json())
      .then(data => {
        console.log('Datos recibidos de la API:', data);
        // Asegurar que data sea siempre un array
        const evaluacionesArray = Array.isArray(data) ? data : [];
        setEvaluaciones(evaluacionesArray);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar evaluaciones:', error);
        setAlert({ type: 'error', message: 'Error al cargar las evaluaciones' });
        setLoading(false);
      });
  }, []);

  const handleEliminar = async (id: number) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvaluacion = async () => {
    if (!pendingDeleteId) return;
    setEliminandoId(pendingDeleteId);
    setShowDeleteModal(false);
    try {
      const res = await fetch(`/api/evaluaciones/${pendingDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setEvaluaciones(prev => prev.filter(e => e.id !== pendingDeleteId));
        setAlert({ type: 'success', message: 'Evaluación eliminada correctamente.' });
      } else {
        setAlert({ type: 'error', message: 'Error al eliminar la evaluación.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al eliminar la evaluación.' });
    } finally {
      setEliminandoId(null);
      setPendingDeleteId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRandomGradient = (id: number) => {
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-blue-500 to-cyan-600',
      'from-violet-500 to-purple-600'
    ];
    return gradients[id % gradients.length];
  };

  const getHoverColor = (id: number) => {
    const hoverColors = [
      'hover:bg-red-500/30', // indigo/purple
      'hover:bg-red-500/30', // emerald/teal
      'hover:bg-red-500/30', // amber/orange
      'hover:bg-red-500/30', // rose/pink
      'hover:bg-red-500/30', // blue/cyan
      'hover:bg-red-500/30'  // violet/purple
    ];
    return hoverColors[id % hoverColors.length];
  };

  const getTextColor = (id: number) => {
    const textColors = [
      'text-indigo-200', // indigo/purple
      'text-emerald-200', // emerald/teal
      'text-amber-200',   // amber/orange
      'text-rose-200',    // rose/pink
      'text-blue-200',    // blue/cyan
      'text-violet-200'   // violet/purple
    ];
    return textColors[id % textColors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Evaluaciones</h1>
              <p className="text-indigo-100 text-sm">
                Gestiona las evaluaciones creadas en la plataforma
              </p>
            </div>
          </div>
          <Link href="/evaluaciones/crear">
            <PrimaryButton 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50"
            >
              <Plus size={16} className="mr-2" />
              Nueva Evaluación
            </PrimaryButton>
          </Link>
        </div>
        
        {/* Stats compactas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Evaluaciones</p>
                <p className="text-lg font-bold">{evaluaciones.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Preguntas</p>
                <p className="text-lg font-bold">
                  {evaluaciones.reduce((sum, e) => sum + (e.preguntasCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Matrices Únicas</p>
                <p className="text-lg font-bold">
                  {new Set(evaluaciones.map(e => e.matrizNombre).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Última Creada</p>
                <p className="text-lg font-bold">
                  {evaluaciones.length > 0 ? formatDate(evaluaciones[0].createdAt) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="space-y-6">
        {evaluaciones.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-12 border-2 border-dashed border-indigo-200">
              <CheckCircle2 size={80} className="mx-auto text-indigo-400 mb-6" />
              <h3 className="text-3xl font-bold text-indigo-900 mb-4">
                No hay evaluaciones creadas
              </h3>
              <p className="text-indigo-600 text-lg mb-8 max-w-md mx-auto">
                Crea tu primera evaluación para comenzar a evaluar el aprendizaje de tus estudiantes
              </p>
              <Link href="/evaluaciones/crear">
                <PrimaryButton 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                >
                  <Plus size={24} className="mr-2" />
                  Crear Primera Evaluación
                </PrimaryButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {evaluaciones.map((evaluacion) => (
                <div 
                  key={evaluacion.id} 
                  className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 min-h-[380px] max-w-sm mx-auto w-full"
                >
                  {/* Header con gradiente */}
                  <div className={`bg-gradient-to-r ${getRandomGradient(evaluacion.id)} p-4 text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-bold leading-tight pr-2 line-clamp-2">{evaluacion.titulo}</h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => router.push(`/evaluaciones/${evaluacion.id}/editar`)}
                            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 transition-colors"
                            title="Editar evaluación"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleEliminar(evaluacion.id)}
                            disabled={eliminandoId === evaluacion.id}
                            className={`p-1.5 bg-white/20 backdrop-blur-sm rounded-md ${getHoverColor(evaluacion.id)} transition-colors ${eliminandoId === evaluacion.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Eliminar evaluación"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Stats en el header */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                          <p className={`text-xs ${getTextColor(evaluacion.id)}`}>Preguntas</p>
                          <p className="text-sm font-bold">{evaluacion.preguntasCount || 0}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                          <p className={`text-xs ${getTextColor(evaluacion.id)}`}>Matriz</p>
                          <p className="text-sm font-bold">{evaluacion.matrizNombre ? '✓' : '✗'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenido del card */}
                  <div className="p-4 space-y-3 flex flex-col h-full">
                    {/* Información de la matriz */}
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <BarChart3 size={12} />
                        Matriz de Especificación
                      </h4>
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-100">
                        <span className="text-xs font-medium text-emerald-800 line-clamp-2">
                          {evaluacion.matrizNombre || 'Sin matriz asignada'}
                        </span>
                      </div>
                    </div>

                    {/* Detalles adicionales */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Target size={10} />
                        <span>{evaluacion.preguntasCount || 0} preguntas totales</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={10} />
                        <span>Creada el {formatDate(evaluacion.createdAt)}</span>
                      </div>
                    </div>

                    {/* Acciones en el footer */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => router.push(`/evaluaciones/${evaluacion.id}/editar`)}
                          className="flex-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 py-1.5 px-2 rounded-md font-medium hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 text-xs"
                        >
                          <Edit size={12} className="mr-1" />
                          Editar
                        </button>
                        <Link
                          href={`/correccion-evaluaciones`}
                          className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 py-1.5 px-2 rounded-md font-medium hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-xs text-center"
                        >
                          <CheckCircle2 size={12} className="mr-1" />
                          Corregir
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación simple si hay muchas evaluaciones */}
            {evaluaciones.length > 20 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Anterior
                </button>
                <div className="flex gap-1">
                  <button className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md">1</button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">2</button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">3</button>
                </div>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales de confirmación y alerta */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
            <Dialog.Title className="text-lg font-bold mb-4">¿Eliminar evaluación?</Dialog.Title>
            <Dialog.Description className="mb-6 text-gray-600">Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta evaluación?</Dialog.Description>
            <div className="flex gap-4 justify-end">
              <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={confirmDeleteEvaluacion} disabled={eliminandoId !== null}>Eliminar</PrimaryButton>
            </div>
          </div>
        </div>
      </Dialog>
      
      {alert && (
        <Dialog open={!!alert} onClose={() => setAlert(null)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
              <Dialog.Title className="text-lg font-bold mb-4">{alert.type === 'error' ? 'Error' : 'Éxito'}</Dialog.Title>
              <Dialog.Description className="mb-6 text-gray-600">{alert.message}</Dialog.Description>
              <div className="flex gap-4 justify-end">
                <PrimaryButton onClick={() => setAlert(null)}>Cerrar</PrimaryButton>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
} 