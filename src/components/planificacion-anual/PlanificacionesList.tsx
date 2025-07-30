"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Calendar, Edit3, Trash2, BookOpen, User, Clock, Layers, Plus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';

function getPagination(current: number, total: number) {
  const delta = 1;
  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  if (current - delta > 2) range.unshift('...');
  if (current + delta < total - 1) range.push('...');
  range.unshift(1);
  if (total > 1) range.push(total);
  return Array.from(new Set(range));
}

export default function PlanificacionesList() {
  const router = useRouter();
  const [planificaciones, setPlanificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [planificacionToDelete, setPlanificacionToDelete] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;
  const totalPaginas = Math.ceil(planificaciones.length / porPagina);
  const planificacionesPagina = planificaciones.slice((pagina - 1) * porPagina, pagina * porPagina);

  useEffect(() => {
    cargarPlanificaciones();
  }, []);

  const cargarPlanificaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/planificaciones");
      if (response.ok) {
        const data = await response.json();
        setPlanificaciones(data);
      }
    } catch (error) {
      console.error("Error al cargar planificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleEliminar = (planificacion: any) => {
    setPlanificacionToDelete(planificacion);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const confirmarEliminacion = async () => {
    if (!planificacionToDelete) return;
    
    setDeletingId(planificacionToDelete.id);
    try {
      const response = await fetch(`/api/planificaciones/${planificacionToDelete.id}`, { method: "DELETE" });
      if (response.ok) {
        setPlanificaciones(prev => prev.filter(p => p.id !== planificacionToDelete.id));
        setNotification({
          type: 'success',
          message: `Planificación "${planificacionToDelete.nombre}" eliminada exitosamente`
        });
      } else {
        setNotification({
          type: 'error',
          message: "Error al eliminar la planificación"
        });
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      setNotification({
        type: 'error',
        message: "Error al eliminar la planificación"
      });
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
      setPlanificacionToDelete(null);
    }
  };

  const cancelarEliminacion = () => {
    setShowDeleteConfirm(false);
    setPlanificacionToDelete(null);
  };

  const totalClases = (asignaciones: any[]) => {
    return asignaciones.reduce((total, asignacion) => total + (asignacion.cantidadClases || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Planificaciones Anuales
              </h1>
              <p className="text-indigo-100 text-sm">
                Consulta y gestiona las planificaciones anuales guardadas
              </p>
            </div>
          </div>
          
          {/* Botón de acción */}
          <button
            onClick={() => router.push('/planificacion-anual')}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Planificación
          </button>
        </div>
        
        {/* Stats y información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Planificaciones</p>
                <p className="text-lg font-bold">{planificaciones.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Planificaciones Activas</p>
                <p className="text-lg font-bold">
                  {planificaciones.filter(p => p.activa).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Última Creada</p>
                <p className="text-lg font-bold">
                  {planificaciones.length > 0 
                    ? new Date(Math.max(...planificaciones.map(p => new Date(p.createdAt).getTime()))).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {planificaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Layers size={80} className="text-gray-300 mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-2">No hay planificaciones creadas</h3>
          <p className="text-xl text-gray-500 mb-8">Crea tu primera planificación anual para comenzar</p>
          <PrimaryButton onClick={() => router.push('/planificacion-anual')} className="text-lg px-10 py-4">Nueva Planificación</PrimaryButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {planificacionesPagina.map((planificacion) => (
              <div key={planificacion.id} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                {/* Accent line superior */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                
                {/* Botón de acciones */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" ref={openMenuId === planificacion.id ? menuRef : undefined}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === planificacion.id ? null : planificacion.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                    title="Acciones"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === planificacion.id && (
                    <div className="absolute right-0 top-full mt-2 p-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[140px]">
                      <button
                        onClick={() => { router.push(`/planificacion-anual?planificacionId=${planificacion.id}`); setOpenMenuId(null); }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} /> Ver/Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(planificacion)}
                        disabled={deletingId === planificacion.id}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === planificacion.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Contenido principal */}
                <div className="p-6">
                  {/* Icono y título */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Layers size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{planificacion.nombre}</h3>
                    </div>
                  </div>
                  
                  {/* Información de la planificación */}
                  <div className="space-y-4">
                    {/* Horario */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-gray-600 font-medium text-sm">Horario</span>
                      </div>
                      <span className="text-gray-900 font-semibold text-sm block pl-4 truncate">
                        {planificacion.horario?.asignatura?.nombre || 'No asignado'}
                      </span>
                    </div>
                    
                    {/* Nivel */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-gray-600 font-medium">Nivel:</span>
                      <span className="text-gray-900 font-semibold">{planificacion.horario?.nivel?.nombre || 'No asignado'}</span>
                    </div>
                    
                    {/* Profesor */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 font-medium">Profesor:</span>
                      <span className="text-gray-900 font-semibold">{planificacion.horario?.profesor?.nombre || 'No asignado'}</span>
                    </div>
                    
                    {/* Año */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600 font-medium">Año:</span>
                      <span className="text-gray-900 font-semibold">{planificacion.ano}</span>
                    </div>
                    
                    {/* OAs */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 font-medium">OAs:</span>
                      <span className="text-gray-900 font-semibold">{planificacion.asignaciones.length}</span>
                    </div>
                    
                    {/* Total de clases */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-600 font-medium">Total Clases:</span>
                      <span className="text-gray-900 font-semibold">{totalClases(planificacion.asignaciones)}</span>
                    </div>
                  </div>
                  
                  {/* Botón de acción principal */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => router.push(`/planificacion-anual?planificacionId=${planificacion.id}`)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn"
                    >
                      <Edit3 size={16} className="group-hover/btn:scale-110 transition-transform" />
                      Ver Planificación
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Paginación */}
          <div className="flex justify-center mt-8">
            <nav className="inline-flex items-center gap-4 select-none" aria-label="Pagination">
              <button
                className="flex items-center gap-1 text-[1.7rem] text-gray-800 font-normal px-2 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-40"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>
              <div className="flex items-center gap-4">
                {getPagination(pagina, totalPaginas).map((p, idx) =>
                  p === '...'
                    ? <span key={idx} className="text-3xl text-gray-700 font-light px-2">•••</span>
                    : <button
                        key={p}
                        className={
                          pagina === p
                            ? 'flex items-center justify-center text-sm font-medium rounded-xl border-2 border-gray-200 bg-white  shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] px-4 py-2'
                            : 'flex items-center justify-center text-sm font-normal rounded-xl px-4 py-2 hover:bg-gray-50 transition'
                        }
                        onClick={() => setPagina(Number(p))}
                        aria-current={pagina === p ? 'page' : undefined}
                      >
                        {p}
                      </button>
                )}
              </div>
              <button
                className="flex items-center gap-1 text-[1.7rem] text-gray-800 font-normal px-2 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-40"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                 <ChevronRight size={20} strokeWidth={2.2} />
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && planificacionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-t-2xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Confirmar Eliminación</h2>
                  <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que quieres eliminar la planificación{" "}
                <strong className="text-gray-900">"{planificacionToDelete.nombre}"</strong>?
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelarEliminacion}
                  disabled={deletingId === planificacionToDelete.id}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  disabled={deletingId === planificacionToDelete.id}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId === planificacionToDelete.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
} 