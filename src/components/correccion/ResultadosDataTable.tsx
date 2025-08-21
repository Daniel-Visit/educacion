'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface ArchivoResultado {
  id: number;
  nombre: string;
  fechaCarga: string;
  totalAlumnos: number;
  escalaNota: number;
  estadisticas: {
    promedioNota: number;
    aprobados: number;
    totalAlumnos: number;
  };
}

interface ResultadosDataTableProps {
  evaluacionId: number;
  onResultadoEliminado: () => void;
  refreshKey?: number; // Para forzar refreshes
}

export default function ResultadosDataTable({
  evaluacionId,
  onResultadoEliminado,
  refreshKey,
}: ResultadosDataTableProps) {
  const [resultados, setResultados] = useState<ArchivoResultado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archivoAEliminar, setArchivoAEliminar] =
    useState<ArchivoResultado | null>(null);

  const resultadosPerPage = 20;

  const cargarResultados = useCallback(async () => {
    if (!evaluacionId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/evaluaciones/${evaluacionId}/resultados`
      );
      if (response.ok) {
        const data = await response.json();
        setResultados(data);
        setTotalPages(Math.ceil(data.length / resultadosPerPage));
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error cargando resultados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [evaluacionId, resultadosPerPage]);

  useEffect(() => {
    if (evaluacionId) {
      cargarResultados();
    } else {
      setResultados([]);
      setCurrentPage(1);
    }
  }, [evaluacionId, cargarResultados, refreshKey]); // Agregar refreshKey

  const handleEliminarArchivo = (archivo: ArchivoResultado) => {
    setArchivoAEliminar(archivo);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!archivoAEliminar || !evaluacionId) return;

    setDeletingId(archivoAEliminar.id);
    try {
      // Llamada real a la API para eliminar el archivo completo
      const response = await fetch(
        `/api/resultados-evaluaciones/${archivoAEliminar.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Eliminar de la lista local solo si la API fue exitosa
        setResultados(prev => prev.filter(r => r.id !== archivoAEliminar.id));
        onResultadoEliminado();
      } else {
        const errorData = await response.json();
        console.error('Error de la API:', errorData);
        throw new Error(
          `Error ${response.status}: ${errorData.error || 'Error desconocido'}`
        );
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      // No mostrar alert, solo log en consola
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setArchivoAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
    setArchivoAEliminar(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular resultados de la página actual
  const startIndex = (currentPage - 1) * resultadosPerPage;
  const endIndex = startIndex + resultadosPerPage;
  const currentResultados = resultados.slice(startIndex, endIndex);

  if (!evaluacionId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Cargando archivos...</span>
      </div>
    );
  }

  if (resultados.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay archivos de resultados
          </h3>
          <p className="text-gray-500">
            Esta evaluación aún no tiene archivos de resultados cargados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-6">
      {/* Header de la tabla */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">
                Archivos de Resultados
              </h3>
              <p className="text-sm text-indigo-700 font-medium">
                {resultados.length} archivo{resultados.length !== 1 ? 's' : ''}{' '}
                • Página {currentPage} de {totalPages}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border-t border-gray-200">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                Archivo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                Fecha de Carga
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentResultados.map(archivo => (
              <tr
                key={archivo.id}
                className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{archivo.nombre}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-700 text-sm">
                    {new Date(archivo.fechaCarga).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Promedio:</span>
                      <span
                        className={`inline-flex items-center px-3  rounded-full text-sm font-semibold ${
                          archivo.estadisticas.promedioNota >= 4.0
                            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {archivo.estadisticas.promedioNota.toFixed(1)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="text-sm text-gray-600">Total: </span>
                      {archivo.estadisticas.totalAlumnos} alumno
                      {archivo.estadisticas.totalAlumnos !== 1 ? 's' : ''}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEliminarArchivo(archivo)}
                    disabled={deletingId === archivo.id}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a{' '}
              {Math.min(endIndex, resultados.length)} de {resultados.length}{' '}
              resultados
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && archivoAEliminar && (
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
                ¿Estás seguro de que quieres eliminar el archivo{' '}
                <strong className="text-gray-900">
                  &ldquo;{archivoAEliminar.nombre}&rdquo;
                </strong>
                ?
                <span className="block mt-2 text-sm text-red-600 font-medium">
                  Se eliminarán los resultados de{' '}
                  {archivoAEliminar.estadisticas.totalAlumnos} alumno
                  {archivoAEliminar.estadisticas.totalAlumnos !== 1 ? 's' : ''}
                </span>
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelarEliminacion}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  disabled={deletingId !== null}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {deletingId !== null ? (
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
    </div>
  );
}
