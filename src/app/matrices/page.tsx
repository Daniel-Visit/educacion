'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Trash2, Edit, Eye, BarChart3, Calendar, Target, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import { Dialog } from '@headlessui/react';

interface OA {
  id: number;
  oas_id: string;
  descripcion_oas: string;
  nivel: { nombre: string };
  asignatura: { nombre: string };
}

interface Indicador {
  id: number;
  descripcion: string;
  preguntas: number;
}

interface MatrizOA {
  id: number;
  oaId: number;
  oa: OA;
  indicadores: Indicador[];
}

interface MatrizEspecificacion {
  id: number;
  nombre: string;
  total_preguntas: number;
  createdAt: string;
  oas: MatrizOA[];
}

export default function MatricesPage() {
  const router = useRouter();
  const [matrices, setMatrices] = useState<MatrizEspecificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const matricesPerPage = 6;

  useEffect(() => {
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    try {
      const response = await fetch('/api/matrices');
      if (response.ok) {
        const data = await response.json();
        setMatrices(data);
      }
    } catch {
      console.error('Error al obtener matrices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatriz = () => {
    router.push('/matrices/crear');
  };

  const handleEditMatriz = (id: number) => {
    router.push(`/matrices/${id}/editar`);
  };

  const handleViewMatriz = (id: number) => {
    router.push(`/matrices/${id}`);
  };

  const handleDeleteMatriz = async (id: number) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteMatriz = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    setShowDeleteModal(false);
    try {
      const response = await fetch(`/api/matrices/${pendingDeleteId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMatrices(prev => prev.filter(matriz => matriz.id !== pendingDeleteId));
        setAlert({ type: 'success', message: 'Matriz eliminada correctamente.' });
      } else {
        setAlert({ type: 'error', message: 'Error al eliminar la matriz.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al eliminar la matriz.' });
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-emerald-500 to-teal-600',    // 1. Verde
      'from-amber-500 to-orange-600',    // 2. Naranja
      'from-indigo-500 to-purple-600',   // 3. Índigo
      'from-cyan-500 to-blue-600',       // 4. Azul
      'from-rose-500 to-pink-600',       // 5. Rosa
      'from-violet-500 to-fuchsia-600'     // 6. Violet
    ];
    return gradients[index % gradients.length];
  };

  const getTextColor = (index: number) => {
    const textColors = [
      'text-emerald-200', // 1. Verde
      'text-amber-200',   // 2. Naranja
      'text-indigo-200',    // 3. Rosa
      'text-cyan-200',    // 4. Azul
      'text-rose-200',  // 5. Índigo
      'text-violet-200'     // 6. Teal
    ];
    return textColors[index % textColors.length];
  };

  const getHoverGradient = (index: number) => {
    const hoverGradients = [
      'hover:from-emerald-600 hover:to-teal-700',  // 1. Verde
      'hover:from-amber-600 hover:to-orange-700',  // 2. Naranja
      'hover:from-indigo-600 hover:to-purple-700', // 3. Índigo
      'hover:from-cyan-600 hover:to-blue-700',     // 4. Azul
      'hover:from-rose-600 hover:to-pink-700',     // 5. Rosa
      'hover:from-violet-600 hover:to-fuchsia-700' // 6. Violet
    ];
    return hoverGradients[index % hoverGradients.length];
  };

  // Funciones de paginación
  const totalPages = Math.ceil(matrices.length / matricesPerPage);
  const startIndex = (currentPage - 1) * matricesPerPage;
  const endIndex = startIndex + matricesPerPage;
  const currentMatrices = matrices.slice(startIndex, endIndex);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando matrices...</p>
        </div>
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
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Matrices de Especificación
              </h1>
              <p className="text-indigo-100 text-sm">
                Gestiona las matrices de especificación para evaluaciones
              </p>
            </div>
          </div>
          
          {/* Botones de acción */}
          <PrimaryButton 
            onClick={handleCreateMatriz} 
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Matriz
          </PrimaryButton>
        </div>
        
        {/* Stats y información */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Matrices</p>
                <p className="text-lg font-bold">
                  {matrices.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Preguntas</p>
                <p className="text-lg font-bold">
                  {matrices.reduce((sum, m) => sum + m.total_preguntas, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total OAs</p>
                <p className="text-lg font-bold">
                  {matrices.reduce((sum, m) => sum + (m.oas?.length || 0), 0)}
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
                  {matrices.length > 0 ? formatDate(matrices[0].createdAt) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="space-y-6">
        {matrices.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-16 border-2 border-dashed border-indigo-200 shadow-xl max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-lg">
                <BarChart3 size={48} className="text-indigo-600" />
              </div>
              <h3 className="text-4xl font-bold text-indigo-900 mb-6 leading-tight">
                No hay matrices creadas
              </h3>
              <p className="text-indigo-600 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
                Crea tu primera matriz de especificación para comenzar a diseñar evaluaciones estructuradas y efectivas
              </p>
              <PrimaryButton 
                onClick={handleCreateMatriz}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Plus size={28} className="mr-3" />
                Crear Primera Matriz
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentMatrices.map((matriz, index) => (
                <div 
                  key={matriz.id} 
                  className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                >
                  {/* Accent line superior */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(index)}`}></div>
                  
                  {/* Botones de acciones */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewMatriz(matriz.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                        title="Ver matriz"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditMatriz(matriz.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                        title="Editar matriz"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMatriz(matriz.id)}
                        disabled={deletingId === matriz.id}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm ${deletingId === matriz.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Eliminar matriz"
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
                        <BarChart3 size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{matriz.nombre}</h3>
                      </div>
                    </div>
                    
                    {/* Información de la matriz */}
                    <div className="space-y-4">
                      {/* Total de preguntas */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-gray-600 font-medium text-sm">Total Preguntas</span>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm block pl-4">{matriz.total_preguntas}</span>
                      </div>
                      
                      {/* Total de OAs */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-gray-600 font-medium text-sm">Objetivos de Aprendizaje</span>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm block pl-4">{matriz.oas?.length || 0} OAs</span>
                      </div>
                      
                      {/* Fecha de creación */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600 font-medium">Creada:</span>
                        <span className="text-gray-900 font-semibold">{formatDate(matriz.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Botón de acción principal */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleViewMatriz(matriz.id)}
                        className={`w-full bg-gradient-to-r ${getGradient(index)} ${getHoverGradient(index)} text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn`}
                      >
                        <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                        Ver Matriz
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
            <Dialog.Title className="text-lg font-bold mb-4">¿Eliminar matriz?</Dialog.Title>
            <Dialog.Description className="mb-6 text-gray-600">Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta matriz?</Dialog.Description>
            <div className="flex gap-4 justify-end">
              <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={confirmDeleteMatriz} disabled={deletingId !== null}>Eliminar</PrimaryButton>
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