'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  BookOpen,
  ClipboardCheck,
  Trash2,
  Edit,
  Calendar,
  Clock,
} from 'lucide-react';
import { useContentSave, SavedContent } from '@/hooks/use-content-save';

interface SavedContentListProps {
  onLoadContent?: (content: SavedContent) => void;
  onEditContent?: (content: SavedContent) => void;
}

export default function SavedContentList({
  onLoadContent,
  onEditContent,
}: SavedContentListProps) {
  const { savedContents, loadSavedContents, deleteContent, isLoading } =
    useContentSave();
  const [filterType, setFilterType] = useState<
    'all' | 'planificacion' | 'material' | 'evaluacion'
  >('all');

  useEffect(() => {
    loadSavedContents();
  }, [loadSavedContents]);

  const filteredContents = savedContents.filter(
    content => filterType === 'all' || content.tipo === filterType
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'planificacion':
        return <FileText className="w-4 h-4" />;
      case 'material':
        return <BookOpen className="w-4 h-4" />;
      case 'evaluacion':
        return <ClipboardCheck className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'planificacion':
        return 'Planificación';
      case 'material':
        return 'Material';
      case 'evaluacion':
        return 'Evaluación';
      default:
        return 'Documento';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'planificacion':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'material':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'evaluacion':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      await deleteContent(id);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Cargando documentos...</p>
      </div>
    );
  }

  if (savedContents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay documentos guardados
        </h3>
        <p className="text-gray-500">
          Guarda tu primer documento para verlo aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos ({savedContents.length})
        </button>
        <button
          onClick={() => setFilterType('planificacion')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'planificacion'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Planificaciones (
          {savedContents.filter(c => c.tipo === 'planificacion').length})
        </button>
        <button
          onClick={() => setFilterType('material')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'material'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Materiales ({savedContents.filter(c => c.tipo === 'material').length})
        </button>
        <button
          onClick={() => setFilterType('evaluacion')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'evaluacion'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Evaluaciones (
          {savedContents.filter(c => c.tipo === 'evaluacion').length})
        </button>
      </div>

      {/* Lista de documentos */}
      <div className="space-y-3">
        {filteredContents.map(content => (
          <div
            key={content.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-1 rounded ${getTypeColor(content.tipo)}`}>
                    {getTypeIcon(content.tipo)}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeColor(content.tipo)}`}
                  >
                    {getTypeLabel(content.tipo)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {content.titulo}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(content.createdAt || '')}</span>
                  </div>
                  {content.updatedAt &&
                    content.updatedAt !== content.createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Actualizado: {formatDate(content.updatedAt)}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {onLoadContent && (
                  <button
                    onClick={() => onLoadContent(content)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Cargar contenido"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onEditContent && (
                  <button
                    onClick={() => onEditContent(content)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar documento"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(content.id || 0)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar documento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && savedContents.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No hay documentos del tipo seleccionado
          </p>
        </div>
      )}
    </div>
  );
}
