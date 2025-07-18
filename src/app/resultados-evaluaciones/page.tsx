'use client';

import { useState, useEffect } from 'react';
import { BarChart3, FileText, Users, TrendingUp, CheckCircle2, Award, Eye, Download, Calendar } from 'lucide-react';
import GlobalDropdown from '@/components/ui/GlobalDropdown';

interface Evaluacion {
  id: number;
  titulo: string;
  matrizNombre: string;
  preguntasCount: number;
  createdAt: string;
}

interface ResultadoEvaluacion {
  id: number;
  evaluacionId: number;
  fechaCarga: string;
  totalAlumnos: number;
  promedioPuntaje: number;
  porcentajeAprobacion: number;
  evaluacion: Evaluacion;
}

export default function ResultadosEvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [resultados, setResultados] = useState<ResultadoEvaluacion[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<string>("");
  const [resultadoSeleccionado, setResultadoSeleccionado] = useState<ResultadoEvaluacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar evaluaciones
      const responseEvaluaciones = await fetch('/api/evaluaciones');
      if (responseEvaluaciones.ok) {
        const dataEvaluaciones = await responseEvaluaciones.json();
        setEvaluaciones(dataEvaluaciones);
      }

      // Cargar resultados
      const responseResultados = await fetch('/api/resultados-evaluaciones');
      if (responseResultados.ok) {
        const dataResultados = await responseResultados.json();
        setResultados(dataResultados);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluacionChange = (evaluacionId: string) => {
    setEvaluacionSeleccionada(evaluacionId);
  };

  const resultadosFiltrados = evaluacionSeleccionada 
    ? resultados.filter(r => r.evaluacionId.toString() === evaluacionSeleccionada)
    : resultados;

  const statsGenerales = {
    totalResultados: resultados.length,
    totalAlumnos: resultados.reduce((sum, r) => sum + r.totalAlumnos, 0),
    promedioGeneral: resultados.length > 0 
      ? Math.round(resultados.reduce((sum, r) => sum + r.promedioPuntaje, 0) / resultados.length)
      : 0,
    evaluacionesConResultados: new Set(resultados.map(r => r.evaluacionId)).size
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-indigo-600 font-medium">Cargando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg mb-6 mt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resultados de Evaluaciones</h1>
              <p className="text-emerald-100 text-sm">
                Visualiza y analiza los resultados de evaluaciones ya cargados
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats compactas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-200" />
              <div>
                <p className="text-emerald-200 text-xs">Total Resultados</p>
                <p className="text-lg font-bold">{statsGenerales.totalResultados}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-200" />
              <div>
                <p className="text-emerald-200 text-xs">Total Alumnos</p>
                <p className="text-lg font-bold">{statsGenerales.totalAlumnos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-200" />
              <div>
                <p className="text-emerald-200 text-xs">Promedio General</p>
                <p className="text-lg font-bold">{statsGenerales.promedioGeneral}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-200" />
              <div>
                <p className="text-emerald-200 text-xs">Evaluaciones</p>
                <p className="text-lg font-bold">{statsGenerales.evaluacionesConResultados}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Eye className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Filtros de Visualización</h2>
            <p className="text-gray-600 text-sm">Filtra los resultados por evaluación específica</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Filtrar por Evaluación
            </label>
            <GlobalDropdown
              value={evaluacionSeleccionada}
              onChange={handleEvaluacionChange}
              options={[
                { value: "", label: "Todas las evaluaciones" },
                ...evaluaciones
                  .filter(e => resultados.some(r => r.evaluacionId === e.id))
                  .map((evaluacion) => ({
                    value: evaluacion.id.toString(),
                    label: `${evaluacion.titulo} - ${evaluacion.matrizNombre}`
                  }))
              ]}
              placeholder="Todas las evaluaciones"
              className="h-12"
            />
          </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      {resultadosFiltrados.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Resultados Disponibles</h2>
              <p className="text-gray-600 text-sm">
                {resultadosFiltrados.length} resultado{resultadosFiltrados.length !== 1 ? 's' : ''} encontrado{resultadosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {resultadosFiltrados.map((resultado) => (
              <div key={resultado.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Header de la card */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{resultado.evaluacion.titulo}</h3>
                        <p className="text-blue-100 text-sm">{resultado.evaluacion.matrizNombre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                        ID: {resultado.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido de la card */}
                <div className="p-6 space-y-4">
                  {/* Stats principales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                      <div className="bg-emerald-600 p-2 rounded-lg w-fit mx-auto mb-2">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-emerald-700 text-xs font-medium">Alumnos</p>
                      <p className="text-emerald-900 text-lg font-bold">{resultado.totalAlumnos}</p>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="bg-blue-600 p-2 rounded-lg w-fit mx-auto mb-2">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-blue-700 text-xs font-medium">Promedio</p>
                      <p className="text-blue-900 text-lg font-bold">{resultado.promedioPuntaje}%</p>
                    </div>
                  </div>

                  {/* Porcentaje de aprobación */}
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="bg-orange-600 p-2 rounded-lg w-fit mx-auto mb-2">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-orange-700 text-xs font-medium">Aprobación</p>
                    <p className="text-orange-900 text-xl font-bold">{resultado.porcentajeAprobacion}%</p>
                  </div>

                  {/* Fecha de carga */}
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Cargado: {new Date(resultado.fechaCarga).toLocaleDateString()}</span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => setResultadoSeleccionado(resultado)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors duration-200">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-dashed border-emerald-200">
            <BarChart3 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">
              {evaluacionSeleccionada ? 'No hay resultados para esta evaluación' : 'No hay resultados disponibles'}
            </h3>
            <p className="text-emerald-600 mb-4">
              {evaluacionSeleccionada 
                ? 'Esta evaluación aún no tiene resultados cargados'
                : 'Primero necesitas cargar resultados de evaluaciones en la sección de Corrección'
              }
            </p>
            <button 
              onClick={() => window.location.href = '/correccion-evaluaciones'}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Ir a Cargar Resultados
            </button>
          </div>
        </div>
      )}

      {/* Detalles del Resultado Seleccionado */}
      {resultadoSeleccionado && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalles del Resultado</h2>
                <p className="text-gray-600 text-sm">
                  Análisis detallado de: {resultadoSeleccionado.evaluacion.titulo}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setResultadoSeleccionado(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors duration-200"
            >
              ✕
            </button>
          </div>

          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-700 text-xs font-medium">Evaluación</p>
                  <p className="text-blue-900 font-bold">{resultadoSeleccionado.evaluacion.titulo}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-purple-700 text-xs font-medium">Total Alumnos</p>
                  <p className="text-purple-900 font-bold">{resultadoSeleccionado.totalAlumnos}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-emerald-700 text-xs font-medium">Promedio</p>
                  <p className="text-emerald-900 font-bold">{resultadoSeleccionado.promedioPuntaje}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-orange-700 text-xs font-medium">Aprobación</p>
                  <p className="text-orange-900 font-bold">{resultadoSeleccionado.porcentajeAprobacion}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Evaluación</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Matriz:</span>
                  <span className="font-medium">{resultadoSeleccionado.evaluacion.matrizNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preguntas:</span>
                  <span className="font-medium">{resultadoSeleccionado.evaluacion.preguntasCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de Carga:</span>
                  <span className="font-medium">{new Date(resultadoSeleccionado.fechaCarga).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Resultado:</span>
                  <span className="font-medium">{resultadoSeleccionado.id}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Rendimiento</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Promedio General</span>
                    <span className="font-medium">{resultadoSeleccionado.promedioPuntaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${resultadoSeleccionado.promedioPuntaje}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tasa de Aprobación</span>
                    <span className="font-medium">{resultadoSeleccionado.porcentajeAprobacion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${resultadoSeleccionado.porcentajeAprobacion}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-sm text-gray-600 mb-2">Distribución de Notas:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                      Aprobados: {Math.round(resultadoSeleccionado.totalAlumnos * resultadoSeleccionado.porcentajeAprobacion / 100)}
                    </div>
                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded">
                      Reprobados: {Math.round(resultadoSeleccionado.totalAlumnos * (100 - resultadoSeleccionado.porcentajeAprobacion) / 100)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ver Gráficos Detallados
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Reporte
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ver Alumnos Individuales
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 