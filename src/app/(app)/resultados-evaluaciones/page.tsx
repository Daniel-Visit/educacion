'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  Award,
  Download,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import GlobalDropdown from '@/components/ui/GlobalDropdown';
import LoadingState from '@/components/ui/LoadingState';
import { ResultadosHeader } from '@/components/resultados';
import {
  calcularNota,
  calcularEstadisticas,
  generarCSV,
  descargarCSV,
} from '@/lib/resultados-utils';

interface Evaluacion {
  id: number;
  titulo: string;
}

interface ResultadoEvaluacion {
  id: number;
  evaluacionId: number;
  fechaCarga: string;
  totalAlumnos: number;
  escalaNota: number;
  evaluacion: {
    id: number;
    titulo: string;
    matrizNombre: string;
    preguntasCount: number;
  };
  resultados: {
    id: number;
    puntajeTotal: number;
    puntajeMaximo: number;
    porcentaje: number;
    alumno: {
      id: number;
      nombre: string;
      apellido: string;
    };
  }[];
}

export default function ResultadosEvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<
    number | null
  >(null);
  const [resultados, setResultados] = useState<ResultadoEvaluacion[]>([]);
  const [resultadoSeleccionado, setResultadoSeleccionado] = useState<
    number | null
  >(null);
  const [nivelExigencia, setNivelExigencia] = useState<string>('60');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resultadoAEliminar, setResultadoAEliminar] =
    useState<ResultadoEvaluacion | null>(null);
  const [tablaAbierta, setTablaAbierta] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Timeout alcanzado, forzando fin de carga');
        setIsLoading(false);
      }
    }, 10000);

    cargarDatos();
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Limpiar resultado seleccionado cuando cambie la evaluación
  useEffect(() => {
    setResultadoSeleccionado(null);
  }, [evaluacionSeleccionada]);

  const cargarDatos = async () => {
    try {
      console.log('Cargando datos...');

      // Cargar evaluaciones primero
      const responseEvaluaciones = await fetch('/api/evaluaciones');
      if (responseEvaluaciones.ok) {
        const dataEvaluaciones = await responseEvaluaciones.json();
        setEvaluaciones(
          Array.isArray(dataEvaluaciones) ? dataEvaluaciones : []
        );
      }

      // Cargar resultados
      const responseResultados = await fetch('/api/resultados-evaluaciones');
      console.log('Respuesta resultados:', responseResultados.status);

      if (responseResultados.ok) {
        const dataResultados = await responseResultados.json();
        console.log('Datos resultados:', dataResultados);
        setResultados(Array.isArray(dataResultados) ? dataResultados : []);
      } else {
        console.error('Error al cargar resultados:', responseResultados.status);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarResultado = (resultado: ResultadoEvaluacion) => {
    setResultadoAEliminar(resultado);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!resultadoAEliminar) return;

    try {
      const response = await fetch(
        `/api/resultados-evaluaciones/${resultadoAEliminar.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setResultados(resultados.filter(r => r.id !== resultadoAEliminar.id));
        if (resultadoSeleccionado === resultadoAEliminar.id) {
          setResultadoSeleccionado(null);
        }
        setShowDeleteModal(false);
        setResultadoAEliminar(null);
      } else {
        alert('Error al eliminar el resultado');
      }
    } catch (error) {
      console.error('Error eliminando resultado:', error);
      alert('Error al eliminar el resultado');
    }
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
    setResultadoAEliminar(null);
  };

  const handleDescargarCSV = (resultado: ResultadoEvaluacion) => {
    const csvContent = generarCSV(
      resultado.resultados,
      parseInt(nivelExigencia)
    );
    descargarCSV(csvContent, resultado.evaluacion.titulo);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <LoadingState message="Cargando resultados..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ResultadosHeader
        title="Resultados de Evaluaciones"
        subtitle="Visualiza y analiza los resultados guardados"
        icon={<BarChart3 className="h-6 w-6 text-white" />}
        totalCount={resultados.length}
        totalLabel="Total Resultados"
      />

      {/* Configuración de Nivel de Exigencia */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Configuración de Notas
            </h2>
            <p className="text-gray-600 text-sm">
              Ajusta el nivel de exigencia para recalcular las notas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Nivel de Exigencia
            </label>
            <GlobalDropdown
              value={nivelExigencia}
              onChange={setNivelExigencia}
              options={[
                { value: '10', label: '10% - Muy Baja' },
                { value: '20', label: '20% - Baja' },
                { value: '30', label: '30% - Moderadamente Baja' },
                { value: '40', label: '40% - Moderada' },
                { value: '50', label: '50% - Moderadamente Alta' },
                { value: '55', label: '55% - Alta' },
                { value: '60', label: '60% - Muy Alta' },
                { value: '70', label: '70% - Extremadamente Alta' },
                { value: '80', label: '80% - Muy Exigente' },
                { value: '90', label: '90% - Extremadamente Exigente' },
                { value: '100', label: '100% - Máxima Exigencia' },
              ]}
              placeholder="Selecciona nivel de exigencia"
              className="h-10"
            />
          </div>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Nota 4:</strong> {nivelExigencia}% de respuestas correctas
            </p>
            <p>
              <strong>Escala:</strong> 1.00 - 7.00
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      {resultados.length > 0 ? (
        <div className="space-y-4">
          {/* Selector de Evaluación */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Seleccionar Evaluación
                </h3>
                <p className="text-gray-600 text-sm">
                  Elige una evaluación para ver sus resultados
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Evaluación
                </label>
                <GlobalDropdown
                  value={evaluacionSeleccionada?.toString() || ''}
                  onChange={value =>
                    setEvaluacionSeleccionada(value ? parseInt(value) : null)
                  }
                  options={[
                    { value: '', label: 'Selecciona una evaluación' },
                    ...evaluaciones.map(evaluacion => ({
                      value: evaluacion.id.toString(),
                      label: evaluacion.titulo,
                    })),
                  ]}
                  placeholder="Selecciona una evaluación"
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Selector de Resultado (solo si hay evaluación seleccionada) */}
          {evaluacionSeleccionada && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Seleccionar Resultado
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Elige un resultado de esta evaluación para analizar
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Resultado a Visualizar
                  </label>
                  <GlobalDropdown
                    value={resultadoSeleccionado?.toString() || ''}
                    onChange={value =>
                      setResultadoSeleccionado(value ? parseInt(value) : null)
                    }
                    options={[
                      { value: '', label: 'Selecciona un resultado' },
                      ...resultados
                        .filter(
                          resultado =>
                            resultado.evaluacionId === evaluacionSeleccionada
                        )
                        .map(resultado => ({
                          value: resultado.id.toString(),
                          label: `${resultado.evaluacion.titulo} - ${resultado.evaluacion.matrizNombre} (${resultado.totalAlumnos} alumnos, ${new Date(resultado.fechaCarga).toLocaleDateString()})`,
                        })),
                    ]}
                    placeholder="Selecciona un resultado"
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Detalles del Resultado Seleccionado */}
          {resultadoSeleccionado &&
            (() => {
              const resultado = resultados.find(
                r => r.id === resultadoSeleccionado
              );
              if (!resultado) return null;

              const stats = calcularEstadisticas(
                resultado.resultados,
                parseInt(nivelExigencia)
              );

              return (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Header del resultado */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {resultado.evaluacion.titulo}
                        </h3>
                        <p className="text-gray-600">
                          {resultado.evaluacion.matrizNombre}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Cargado el{' '}
                          {new Date(resultado.fechaCarga).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEliminarResultado(resultado)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                        <div className="bg-blue-600 p-3 rounded-lg">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Total Alumnos
                          </p>
                          <p className="text-lg font-bold text-blue-900">
                            {stats.totalAlumnos}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                        <div className="bg-emerald-600 p-3 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-700">
                            Promedio Nota
                          </p>
                          <p className="text-lg font-bold text-emerald-900">
                            {stats.promedioNota}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                        <div className="bg-orange-600 p-3 rounded-lg">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-700">
                            Aprobación
                          </p>
                          <p className="text-lg font-bold text-orange-900">
                            {stats.porcentajeAprobacion}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de alumnos con notas calculadas - Acordeón */}
                  <div className="p-6">
                    <div className="mb-6">
                      <button
                        onClick={() => setTablaAbierta(!tablaAbierta)}
                        className={`w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 flex items-center justify-between border border-gray-200 shadow-sm ${
                          tablaAbierta
                            ? 'rounded-t-xl border-b-0'
                            : 'rounded-xl'
                        }`}
                      >
                        <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-indigo-600" />
                          Detalle por Alumno ({resultado.resultados.length}{' '}
                          alumnos)
                        </h4>
                        {tablaAbierta ? (
                          <ChevronDown className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-indigo-600" />
                        )}
                      </button>

                      {tablaAbierta && (
                        <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl shadow-sm">
                          <div className="overflow-x-auto transition-all duration-300 ease-in-out">
                            <table className="w-full">
                              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    Alumno
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    Puntaje
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    % Correctas
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    Nota
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {resultado.resultados.map(resultadoAlumno => {
                                  const nota = calcularNota(
                                    resultadoAlumno.porcentaje,
                                    parseInt(nivelExigencia)
                                  );
                                  return (
                                    <tr
                                      key={resultadoAlumno.id}
                                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors"
                                    >
                                      <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">
                                          {resultadoAlumno.alumno.nombre}{' '}
                                          {resultadoAlumno.alumno.apellido}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-gray-700 font-medium">
                                          {resultadoAlumno.puntajeTotal}/
                                          {resultadoAlumno.puntajeMaximo}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-gray-700 font-medium">
                                          {resultadoAlumno.porcentaje.toFixed(
                                            1
                                          )}
                                          %
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span
                                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                            nota >= 4.0
                                              ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200'
                                              : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                                          }`}
                                        >
                                          {nota}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Guardar datos calculados en sessionStorage
                          const resultadoGraficos = {
                            id: resultado.id.toString(),
                            nombre: resultado.evaluacion.titulo,
                            fecha: resultado.fechaCarga,
                            evaluacion: {
                              id: resultado.evaluacion.id.toString(),
                              nombre: resultado.evaluacion.titulo,
                              matriz: {
                                id: '1', // Placeholder
                                nombre: resultado.evaluacion.matrizNombre,
                                nivelExigencia: parseInt(nivelExigencia),
                              },
                            },
                            respuestasAlumnos: resultado.resultados.map(
                              resultadoAlumno => ({
                                id: resultadoAlumno.id.toString(),
                                alumno: {
                                  id: resultadoAlumno.alumno.id.toString(),
                                  nombre: resultadoAlumno.alumno.nombre,
                                  apellido: resultadoAlumno.alumno.apellido,
                                },
                                nota: calcularNota(
                                  resultadoAlumno.porcentaje,
                                  parseInt(nivelExigencia)
                                ),
                                porcentaje: resultadoAlumno.porcentaje,
                              })
                            ),
                          };
                          sessionStorage.setItem(
                            'resultadoGraficos',
                            JSON.stringify(resultadoGraficos)
                          );
                          window.location.href = `/resultados-evaluaciones/graficos?id=${resultado.id}`;
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Ver Gráficos
                      </button>
                      <button
                        onClick={() => handleDescargarCSV(resultado)}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Download className="h-4 w-4" />
                        Descargar CSV
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-dashed border-emerald-200">
            <BarChart3 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">
              No hay resultados disponibles
            </h3>
            <p className="text-emerald-600 mb-4">
              Primero necesitas cargar resultados de evaluaciones en la sección
              de Corrección
            </p>
            <button
              onClick={() =>
                (window.location.href = '/correccion-evaluaciones')
              }
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Ir a Cargar Resultados
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && resultadoAEliminar && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-t-2xl  p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  ¿Estás seguro de que quieres eliminar el siguiente resultado?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="font-semibold text-gray-900">
                    {resultadoAEliminar.evaluacion.titulo}
                  </p>
                  <p className="text-sm text-gray-600">
                    {resultadoAEliminar.evaluacion.matrizNombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {resultadoAEliminar.totalAlumnos} alumnos •{' '}
                    {new Date(
                      resultadoAEliminar.fechaCarga
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelarEliminacion}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
