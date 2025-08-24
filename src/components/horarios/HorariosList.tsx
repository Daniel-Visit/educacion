'use client';

import LoadingState from '@/components/ui/LoadingState';
import { Play, Edit3, Trash2, Calendar, Users, FileText } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import CrearHorarioModal from './CrearHorarioModal';
import { useHorarios } from '@/hooks/use-horarios';
import React, { useEffect, useState } from 'react';

// Importar el tipo Horario del hook para mantener consistencia total
type Horario = {
  id: number;
  nombre: string;
  asignatura: { id: number; nombre: string };
  nivel: { id: number; nombre: string };
  profesor: { id: number; nombre: string };
  fechaPrimeraClase?: string;
  createdAt: string;
  modulos: Array<{
    id: number;
    dia: string;
    horaInicio: string;
    duracion: number;
  }>;
};

// Utilidad para generar los números de página con puntos suspensivos
function getPagination(current: number, total: number) {
  const delta = 1;
  const range = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }
  if (current - delta > 2) range.unshift('...');
  if (current + delta < total - 1) range.push('...');
  range.unshift(1);
  if (total > 1) range.push(total);
  return Array.from(new Set(range));
}

export default function HorariosList() {
  const { horarios, loadHorarios, deleteHorario, isLoading } = useHorarios();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [horarioEditando, setHorarioEditando] = useState<Horario | undefined>(
    undefined
  );
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;
  const totalPaginas = Math.ceil(horarios.length / porPagina);
  const horariosPagina = horarios.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState<Horario | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Funciones de gradientes ordenados
  const getGradient = (index: number) => {
    const gradients = [
      'from-emerald-500 to-teal-600', // 1. Verde
      'from-amber-500 to-orange-600', // 2. Naranja
      'from-indigo-500 to-purple-600', // 3. Índigo
      'from-cyan-500 to-blue-600', // 4. Cyan
      'from-rose-500 to-pink-600', // 5. Rose
      'from-violet-500 to-fuchsia-600', // 6. Violet
    ];
    return gradients[index % gradients.length];
  };

  const getHoverGradient = (index: number) => {
    const hoverGradients = [
      'hover:from-emerald-600 hover:to-teal-700', // 1. Verde
      'hover:from-amber-600 hover:to-orange-700', // 2. Naranja
      'hover:from-indigo-600 hover:to-purple-700', // 3. Índigo
      'hover:from-cyan-600 hover:to-blue-700', // 4. Cyan
      'hover:from-rose-600 hover:to-pink-700', // 5. Rose
      'hover:from-violet-600 hover:to-fuchsia-700', // 6. Violet
    ];
    return hoverGradients[index % hoverGradients.length];
  };

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  // Log de depuración
  if (typeof window !== 'undefined') {
    if (!horarios || horarios.length === 0) {
      console.warn('No se encontraron horarios para mostrar');
    } else {
      console.log('Horarios recibidos:', horarios);
    }
  }

  // Mostrar loading state mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <LoadingState message="Cargando horarios..." />
      </div>
    );
  }

  // Funciones para el modal de confirmación de eliminación
  const handleDeleteClick = (horario: Horario) => {
    setHorarioToDelete(horario);
    setShowDeleteConfirm(true);
  };

  const cancelarEliminacion = () => {
    setShowDeleteConfirm(false);
    setHorarioToDelete(null);
  };

  const confirmarEliminacion = async () => {
    if (!horarioToDelete) return;

    setDeletingId(horarioToDelete.id);
    try {
      await deleteHorario(horarioToDelete.id);
      setShowDeleteConfirm(false);
      setHorarioToDelete(null);
      await loadHorarios(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar horario:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6 mt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Configuración de Horarios</h1>
              <p className="text-indigo-100 text-sm">
                Gestiona los horarios de cursos para la planificación anual
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
          >
            <Calendar className="w-4 h-4" />
            Nuevo Horario
          </button>
        </div>

        {/* Stats compactas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Horarios</p>
                <p className="text-lg font-bold">{horarios.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Profesores</p>
                <p className="text-lg font-bold">
                  {
                    new Set(horarios.map(h => h.profesor?.id).filter(Boolean))
                      .size
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Asignaturas</p>
                <p className="text-lg font-bold">
                  {
                    new Set(horarios.map(h => h.asignatura?.id).filter(Boolean))
                      .size
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CrearHorarioModal
        isOpen={modalOpen || !!horarioEditando}
        onClose={() => {
          setModalOpen(false);
          setHorarioEditando(undefined);
        }}
        onHorarioCreated={() => {
          setModalOpen(false);
          setHorarioEditando(undefined);
          loadHorarios();
        }}
        modoEdicion={!!horarioEditando}
        horarioInicial={horarioEditando}
      />
      {horarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Calendar size={80} className="text-gray-300 mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            No hay horarios creados
          </h3>
          <p className="text-xl text-gray-500 mb-8">
            Crea tu primer horario para comenzar
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg px-10 py-4 rounded-lg transition-colors duration-200"
          >
            Nuevo Horario
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {horariosPagina.map((horario, index) => (
              <div
                key={horario.id}
                className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                {/* Accent line superior */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(index)}`}
                ></div>

                {/* Botones de acciones */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        (window.location.href = `/planificacion-anual?horarioId=${horario.id}`)
                      }
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                      title="Seleccionar horario"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => setHorarioEditando(horario)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                      title="Editar horario"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(horario)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm"
                      title="Eliminar horario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Contenido principal */}
                <div className="p-6">
                  {/* Icono y título */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`h-10 w-10 bg-gradient-to-br ${getGradient(index)} rounded-xl flex items-center justify-center shadow-sm`}
                    >
                      <Calendar size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {horario.nombre}
                      </h3>
                    </div>
                  </div>

                  {/* Información del horario */}
                  <div className="space-y-4">
                    {/* Asignatura con label arriba */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-gray-600 font-medium text-sm">
                          Asignatura
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold text-sm block pl-4 truncate">
                        {horario.asignatura?.nombre || 'No asignada'}
                      </span>
                    </div>

                    {/* Nivel */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-gray-600 font-medium">Nivel:</span>
                      <span className="text-gray-900 font-semibold">
                        {horario.nivel?.nombre || 'No asignado'}
                      </span>
                    </div>

                    {/* Profesor */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 font-medium">
                        Profesor:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {horario.profesor?.nombre || 'No asignado'}
                      </span>
                    </div>
                  </div>

                  {/* Botón de acción principal */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() =>
                        (window.location.href = `/planificacion-anual?horarioId=${horario.id}`)
                      }
                      className={`w-full bg-gradient-to-r ${getGradient(index)} ${getHoverGradient(index)} text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn`}
                    >
                      <Play
                        size={16}
                        className="group-hover/btn:scale-110 transition-transform"
                      />
                      Usar Horario
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Paginación con shadcn */}
          {totalPaginas > 0 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        if (pagina > 1) setPagina(p => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>

                  {getPagination(pagina, totalPaginas).map((p, idx) => (
                    <PaginationItem key={idx}>
                      {p === '...' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            if (typeof p === 'number') setPagina(p);
                          }}
                          isActive={pagina === p}
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        if (pagina < totalPaginas)
                          setPagina(p => Math.min(totalPaginas, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && horarioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-t-2xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Confirmar Eliminación
                  </h2>
                  <p className="text-red-100 text-sm">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que quieres eliminar el horario{' '}
                <strong className="text-gray-900">
                  &ldquo;{horarioToDelete.nombre}&rdquo;
                </strong>
                ?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelarEliminacion}
                  disabled={deletingId === horarioToDelete.id}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  disabled={deletingId === horarioToDelete.id}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId === horarioToDelete.id ? (
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
    </>
  );
}
