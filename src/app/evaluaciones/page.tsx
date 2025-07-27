'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Plus, FileText, CheckCircle2, BarChart3, Calendar, Target, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import EstadoEvaluacion from '@/components/evaluacion/EstadoEvaluacion';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import type { EstadoEvaluacion as EstadoEvaluacionType } from '@/lib/evaluacion-utils';

interface Evaluacion {
  id: number;
  titulo: string;
  matrizNombre?: string;
  preguntasCount?: number;
  createdAt?: string;
  estado?: EstadoEvaluacionType;
}

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const router = useRouter();
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const evaluacionesPerPage = 6;

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

  const getGradient = (index: number) => {
    const gradients = [
      'from-emerald-500 to-teal-600',    // 1. Verde
      'from-amber-500 to-orange-600',    // 2. Naranja
      'from-indigo-500 to-purple-600',   // 3. Índigo
      'from-cyan-500 to-blue-600',       // 4. Cyan
      'from-rose-500 to-pink-600',       // 5. Rose
      'from-violet-500 to-fuchsia-600'   // 6. Violet
    ];
    return gradients[index % gradients.length];
  };

  const getHoverGradient = (index: number) => {
    const hoverGradients = [
      'hover:from-emerald-600 hover:to-teal-700',  // 1. Verde
      'hover:from-amber-600 hover:to-orange-700',  // 2. Naranja
      'hover:from-indigo-600 hover:to-purple-700', // 3. Índigo
      'hover:from-cyan-600 hover:to-blue-700',     // 4. Cyan
      'hover:from-rose-600 hover:to-pink-700',     // 5. Rose
      'hover:from-violet-600 hover:to-fuchsia-700' // 6. Violet
    ];
    return hoverGradients[index % hoverGradients.length];
  };

  // Funciones de paginación
  const totalPages = Math.ceil(evaluaciones.length / evaluacionesPerPage);
  const startIndex = (currentPage - 1) * evaluacionesPerPage;
  const endIndex = startIndex + evaluacionesPerPage;
  const currentEvaluaciones = evaluaciones.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
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
          <PrimaryButton 
            onClick={() => router.push('/evaluaciones/crear')}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Evaluación
          </PrimaryButton>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentEvaluaciones.map((evaluacion, index) => (
                <div 
                  key={evaluacion.id} 
                  className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                >
                  {/* Accent line superior */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(index)}`}></div>
                  
                  {/* Botones de acciones */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-1">
                      <button
                        onClick={() => router.push(`/evaluaciones/${evaluacion.id}/editar`)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                        title="Editar evaluación"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(evaluacion.id)}
                        disabled={eliminandoId === evaluacion.id}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm ${eliminandoId === evaluacion.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Eliminar evaluación"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Contenido principal */}
                  <div className="p-6">
                    {/* Icono y título */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 bg-gradient-to-br ${getGradient(index)} rounded-xl flex items-center justify-center shadow-sm`}>
                        <CheckCircle2 size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{evaluacion.titulo}</h3>
                      </div>
                    </div>
                    
                    {/* Información de la evaluación */}
                    <div className="space-y-4">
                      {/* Matriz de especificación */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-gray-600 font-medium text-sm">Matriz de Especificación</span>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm block pl-4 truncate">{evaluacion.matrizNombre || 'Sin matriz asignada'}</span>
                      </div>
                      
                      {/* Estado de la evaluación */}
                      {evaluacion.estado && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-600 font-medium text-sm">Estado</span>
                            </div>
                            <EstadoEvaluacion estado={evaluacion.estado} className="text-xs" />
                          </div>
                        </div>
                      )}
                      
                      {/* Total de preguntas */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 font-medium text-sm">Total Preguntas</span>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm block pl-4">{evaluacion.preguntasCount || 0}</span>
                      </div>
                      
                      {/* Fecha de creación */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600 font-medium">Creada:</span>
                        <span className="text-gray-900 font-semibold">{formatDate(evaluacion.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Botón de acción principal */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => router.push(`/evaluaciones/${evaluacion.id}/editar`)}
                        className={`w-full bg-gradient-to-r ${getGradient(index)} ${getHoverGradient(index)} text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn`}
                      >
                        <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
                        Editar Evaluación
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación exacta estilo imagen */}
            <div className="flex justify-center mt-8">
              <nav className="inline-flex items-center gap-4 select-none" aria-label="Pagination">
                <button
                  className="flex items-center gap-1 text-[1.7rem] text-gray-800 font-normal px-2 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-40"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} strokeWidth={2.2} /> 
                </button>
                <div className="flex items-center gap-4">
                  {getPageNumbers().map((page, index) =>
                    page === '...'
                      ? <span key={index} className="text-3xl text-gray-700 font-light px-2">•••</span>
                      : <button
                          key={page}
                          className={
                            currentPage === page
                              ? 'flex items-center justify-center text-sm font-medium rounded-xl border-2 border-gray-200 bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] px-4 py-2'
                              : 'flex items-center justify-center text-sm font-normal rounded-xl px-4 py-2 hover:bg-gray-50 transition'
                          }
                          onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                          aria-current={currentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                  )}
                </div>
                <button
                  className="flex items-center gap-1 text-[1.7rem] text-gray-800 font-normal px-2 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-40"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                   <ChevronRight size={20} strokeWidth={2.2} />
                </button>
              </nav>
            </div>


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