import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Clock,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useContentSave, SavedContent } from '@/hooks/use-content-save';

interface FabPlanificacionesProps {
  onLoadContent?: (content: SavedContent) => void;
  tipoActual: 'planificacion' | 'material' | 'evaluacion';
  matrizId?: number | null;
  disabled?: boolean;
  className?: string;
}

interface Evaluacion {
  id: number;
  titulo: string;
  matrizId: number;
  createdAt: string;
  archivo?: {
    titulo: string;
    createdAt: string;
  };
}

type ContentItem = SavedContent | Evaluacion;

const ITEMS_PER_PAGE = 8;

export default function FabPlanificaciones({
  onLoadContent,
  tipoActual,
  matrizId,
  disabled,
  className,
}: FabPlanificacionesProps) {
  const [open, setOpen] = useState(false);
  const { savedContents } = useContentSave();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loadingEvals, setLoadingEvals] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (tipoActual === 'evaluacion' && matrizId && open) {
      setLoadingEvals(true);
      fetch(`/api/evaluaciones`)
        .then(res => res.json())
        .then(data => {
          setEvaluaciones(
            Array.isArray(data)
              ? data.filter((e: Evaluacion) => e.matrizId === matrizId)
              : []
          );
        })
        .finally(() => setLoadingEvals(false));
    }
  }, [tipoActual, matrizId, open]);

  // Resetear búsqueda y página cuando se abre/cierra
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [open]);

  let filteredContents: ContentItem[] = savedContents.filter(
    content => content.tipo === tipoActual
  );
  if (tipoActual === 'evaluacion' && matrizId) {
    filteredContents = evaluaciones;
  }

  // Filtrar por búsqueda
  const searchFilteredContents = useMemo(() => {
    if (!searchTerm.trim()) return filteredContents;

    return filteredContents.filter(content => {
      const title = getContentTitle(content).toLowerCase();
      return title.includes(searchTerm.toLowerCase());
    });
  }, [filteredContents, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(searchFilteredContents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedContents = searchFilteredContents.slice(startIndex, endIndex);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'planificacion':
        return 'Planificaciones';
      case 'material':
        return 'Materiales';
      case 'evaluacion':
        return 'Evaluaciones';
      default:
        return 'Documentos';
    }
  };

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

  const handleLoadContent = async (content: ContentItem) => {
    if (tipoActual === 'evaluacion' && 'id' in content && content.id) {
      // Para evaluaciones, obtener datos completos desde la API
      try {
        const response = await fetch(`/api/evaluaciones/${content.id}`);
        if (response.ok) {
          const evaluacionCompleta = await response.json();
          if (onLoadContent) {
            onLoadContent(evaluacionCompleta);
          }
        } else {
          console.error('Error al cargar evaluación completa');
        }
      } catch (error) {
        console.error('Error al cargar evaluación:', error);
      }
    } else {
      // Para otros tipos, usar el contenido directamente
      if (onLoadContent && 'tipo' in content) {
        onLoadContent(content as SavedContent);
      }
    }
    setOpen(false);
  };

  const getContentTitle = (content: ContentItem): string => {
    if ('tipo' in content) {
      return content.titulo;
    } else {
      return content.titulo || content.archivo?.titulo || '';
    }
  };

  const getContentDate = (content: ContentItem): string => {
    if ('tipo' in content) {
      return content.createdAt || '';
    } else {
      return content.createdAt || content.archivo?.createdAt || '';
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      {/* FAB con estilo consistente */}
      <button
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-4xl flex items-center justify-center transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:scale-110 active:scale-95 focus:outline-none shadow-lg hover:shadow-xl ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className || ''}`}
        onClick={() => !disabled && setOpen(!open)}
        aria-label={
          open
            ? 'Cerrar archivos'
            : `Abrir ${getTypeLabel(tipoActual).toLowerCase()}`
        }
        disabled={disabled}
      >
        {open ? (
          <X size={32} className="text-white" />
        ) : (
          <FileText size={28} className="text-white" />
        )}
      </button>

      {/* Panel flotante con estilo de la plataforma */}
      {open && (
        <div
          className="fixed top-20 right-6 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header simple y funcional */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-white" />
                <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {getTypeLabel(tipoActual)} Guardados
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
              />
              <input
                type="text"
                placeholder={`Buscar ${getTypeLabel(tipoActual).toLowerCase()}...`}
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-xl pl-10 pr-4 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="flex flex-col h-full">
            {tipoActual === 'evaluacion' && loadingEvals ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 font-medium">
                  Cargando...
                </span>
              </div>
            ) : searchFilteredContents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {searchTerm
                    ? 'No se encontraron resultados'
                    : `No hay ${getTypeLabel(tipoActual).toLowerCase()} guardados`}
                </p>
                {searchTerm && (
                  <p className="text-xs mt-1 text-gray-500">
                    Intenta con otros términos de búsqueda
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Lista de archivos con estilo de cards */}
                <div className="flex-1 overflow-y-auto max-h-96">
                  <div className="p-4 space-y-3">
                    {paginatedContents.map((content: ContentItem) => (
                      <div
                        key={content.id}
                        className="group bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden hover:border-indigo-200"
                        onClick={() => handleLoadContent(content)}
                      >
                        {/* Accent line superior */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all">
                                <FileText
                                  size={18}
                                  className="text-indigo-600"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
                                {getContentTitle(content)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <Clock size={12} className="mr-1" />
                                {formatDate(getContentDate(content))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paginación con estilo consistente */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 font-medium">
                        {searchFilteredContents.length}{' '}
                        {searchFilteredContents.length === 1
                          ? 'archivo'
                          : 'archivos'}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-700 font-medium px-3">
                          {currentPage} de {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
