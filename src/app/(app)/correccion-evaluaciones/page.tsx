'use client';

import { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Users,
  BarChart3,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import GlobalDropdown from '@/components/ui/GlobalDropdown';
import CargarResultadosModal from '@/components/correccion/CargarResultadosModal';

interface Evaluacion {
  id: number;
  titulo: string;
  matrizNombre: string;
  preguntasCount: number;
  createdAt: string;
  estado: string;
}

export default function CorreccionEvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] =
    useState<Evaluacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCargarModal, setShowCargarModal] = useState(false);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  const cargarEvaluaciones = async () => {
    try {
      const response = await fetch('/api/evaluaciones');
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo evaluaciones completas
        const evaluacionesCompletas = data.filter(
          (evaluacion: Evaluacion) => evaluacion.estado === 'completa'
        );
        setEvaluaciones(evaluacionesCompletas);
      }
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluacionChange = (evaluacionId: string) => {
    const evaluacion = evaluaciones.find(e => e.id.toString() === evaluacionId);
    setEvaluacionSeleccionada(evaluacion || null);
  };

  const handleResultadosCargados = () => {
    if (evaluacionSeleccionada) {
      cargarEvaluaciones();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-indigo-600 font-medium">
              Cargando evaluaciones...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6 mt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Cargar Resultados</h1>
              <p className="text-indigo-100 text-sm">
                Sube archivos CSV con los resultados de las evaluaciones
                completas para su procesamiento
              </p>
            </div>
          </div>
        </div>

        {/* Stats compactas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">
                  Evaluaciones Completas
                </p>
                <p className="text-lg font-bold">{evaluaciones.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Preguntas</p>
                <p className="text-lg font-bold">
                  {evaluaciones.reduce((sum, e) => sum + e.preguntasCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Promedio Preguntas</p>
                <p className="text-lg font-bold">
                  {evaluaciones.length > 0
                    ? Math.round(
                        evaluaciones.reduce(
                          (sum, e) => sum + e.preguntasCount,
                          0
                        ) / evaluaciones.length
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de evaluación */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Seleccionar Evaluación
            </h2>
            <p className="text-gray-600 text-sm">
              Elige una evaluación completa para cargar sus resultados desde un
              archivo CSV
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Evaluación Completa
            </label>
            <GlobalDropdown
              value={evaluacionSeleccionada?.id.toString() || ''}
              onChange={handleEvaluacionChange}
              options={[
                {
                  value: '',
                  label:
                    'Selecciona una evaluación completa para cargar resultados',
                },
                ...evaluaciones.map(evaluacion => ({
                  value: evaluacion.id.toString(),
                  label: `${evaluacion.titulo} - ${evaluacion.matrizNombre} (${evaluacion.preguntasCount} preguntas)`,
                })),
              ]}
              placeholder="Selecciona una evaluación completa para cargar resultados"
              className="h-12"
            />
          </div>

          {evaluacionSeleccionada && (
            <button
              onClick={() => setShowCargarModal(true)}
              className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              Cargar Resultados
            </button>
          )}
        </div>

        {evaluacionSeleccionada && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-700">
                  Evaluación
                </p>
                <p className="text-sm font-bold text-emerald-900">
                  {evaluacionSeleccionada.titulo}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border border-pink-200">
              <div className="bg-pink-600 p-2 rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-pink-700">Matriz</p>
                <p className="text-sm font-bold text-pink-900">
                  {evaluacionSeleccionada.matrizNombre}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-orange-700">Preguntas</p>
                <p className="text-sm font-bold text-orange-900">
                  {evaluacionSeleccionada.preguntasCount} pregunta
                  {evaluacionSeleccionada.preguntasCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {evaluaciones.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-indigo-200">
              <FileText className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-indigo-900 mb-2">
                No hay evaluaciones completas disponibles
              </h3>
              <p className="text-indigo-600 mb-4">
                Solo se pueden cargar resultados de evaluaciones que estén
                completas (con todas las preguntas, respuestas correctas e
                indicadores asignados)
              </p>
              <button
                onClick={() => (window.location.href = '/evaluaciones')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Ir a Evaluaciones
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de carga */}
      <CargarResultadosModal
        isOpen={showCargarModal}
        onClose={() => setShowCargarModal(false)}
        evaluacionId={evaluacionSeleccionada?.id}
        evaluacionNombre={evaluacionSeleccionada?.titulo}
        onResultadosCargados={handleResultadosCargados}
      />
    </div>
  );
}
