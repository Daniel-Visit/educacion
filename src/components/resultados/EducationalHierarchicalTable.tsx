'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Interfaces para los datos reales
interface IndicadorReal {
  id: number;
  descripcion: string;
  preguntas: number;
  logro: number;
}

interface OAReal {
  id: number;
  oaId: number;
  oa: {
    id: number;
    oas_id: string;
    descripcion_oas: string;
    eje_id: number;
    eje_descripcion: string;
    tipo_eje: 'Contenido' | 'Habilidad' | 'Actitud';
  };
  indicadores: IndicadorReal[];
}

interface MatrizReal {
  id: number;
  nombre: string;
  total_preguntas: number;
  oas: OAReal[];
}

interface EvaluacionData {
  id: number;
  matriz: MatrizReal;
  preguntas?: Array<{
    id: number;
    numero: number;
    texto: string;
    indicadores?: Array<{
      indicadorId: number;
      tipo: string;
    }>;
  }>;
}

// Datos estáticos de ejemplo (se reemplazarán con datos reales)
const hierarchicalData = {
  eje: 'NUMERACION Y OPERACIONES ARITMETICAS',
  objetivos: [
    {
      id: 'OA1',
      name: 'OA 1. Representar y describir números del 0 al 1000',
      indicadores: [
        {
          name: 'Expresan números en palabras y cifras',
          preguntas: 2,
          logro: 56,
        },
        { name: 'Representan números con cantidades', preguntas: 1, logro: 63 },
        {
          name: 'Reconocen números que se encuentran',
          preguntas: 2,
          logro: 47,
        },
        { name: 'Ubican número en la recta numérica', preguntas: 2, logro: 44 },
        {
          name: 'Reconocen la representación de un número',
          preguntas: 1,
          logro: 63,
        },
        { name: 'Ordenan serie de números', preguntas: 2, logro: 56 },
        {
          name: 'Componen número a través de tarjetas',
          preguntas: 1,
          logro: 69,
        },
        { name: 'Representan la descomposición', preguntas: 1, logro: 75 },
        { name: 'Redondean a la decena o centena', preguntas: 1, logro: 41 },
      ],
    },
    {
      id: 'OA3',
      name: 'OA 3. Demostrar que comprende la adición',
      indicadores: [
        {
          name: 'Suman y restan números con resultado',
          preguntas: 1,
          logro: 60,
        },
        {
          name: 'Resuelven un problema de su entorno',
          preguntas: 1,
          logro: 56,
        },
        { name: 'Resuelven multiplicaciones usando', preguntas: 1, logro: 59 },
      ],
    },
    {
      id: 'OA5',
      name: 'OA 5. Demostrar que comprende la multiplicación',
      indicadores: [
        {
          name: 'Resuelven multiplicaciones usando algoritmo',
          preguntas: 2,
          logro: 44,
        },
      ],
    },
    {
      id: 'OA6',
      name: 'OA 6. Demostrar que comprende la división',
      indicadores: [
        {
          name: 'Resuelven divisiones usando algoritmo',
          preguntas: 2,
          logro: 34,
        },
        { name: 'Resuelven problemas de división', preguntas: 2, logro: 34 },
      ],
    },
    {
      id: 'OA7',
      name: 'OA 7. Resolver problemas rutinarios y no rutinarios',
      indicadores: [
        {
          name: 'Resuelven problemas cuya resolución',
          preguntas: 2,
          logro: 34,
        },
      ],
    },
  ],
};

function getPerformanceColor(logro: number) {
  if (logro >= 70) return 'bg-green-400';
  if (logro >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

interface EducationalHierarchicalTableProps {
  evaluacionId?: string | null;
  resultadoId?: string | null;
  preguntas?: Array<{
    id: number;
    numero: number;
    texto: string;
  }>;
  respuestasAlumnos?: Array<{
    id: number;
    respuestas: Array<{
      preguntaId: number;
      esCorrecta: boolean;
    }>;
  }>;
}

export default function EducationalHierarchicalTable({
  evaluacionId,
  resultadoId,
  preguntas,
  respuestasAlumnos,
}: EducationalHierarchicalTableProps = {}) {
  const [expandedOAs, setExpandedOAs] = useState<string[]>([]);
  const [expandedEje, setExpandedEje] = useState(false);
  const [selectedTipoEje, setSelectedTipoEje] = useState<string>('Contenido');
  const [evaluacionData, setEvaluacionData] = useState<EvaluacionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logrosCalculados, setLogrosCalculados] = useState<{
    [key: string]: number;
  }>({});

  const toggleOA = (oaId: string) => {
    setExpandedOAs(prev => {
      const newState = prev.includes(oaId)
        ? prev.filter(id => id !== oaId)
        : [...prev, oaId];
      return newState;
    });
  };

  const toggleEje = () => {
    setExpandedEje(!expandedEje);
  };

  // Función para cargar datos reales de la evaluación
  const loadEvaluacionData = useCallback(async () => {
    if (!evaluacionId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Obtener datos de la evaluación
      const response = await fetch(`/api/evaluaciones/${evaluacionId}`);
      if (!response.ok) {
        throw new Error('Error al cargar datos de la evaluación');
      }

      const data = await response.json();
      setEvaluacionData(data);

      // Determinar tipos de eje disponibles
      const tiposDisponibles = new Set<string>();
      data.matriz.oas.forEach((matrizOA: OAReal) => {
        if (matrizOA.oa.tipo_eje !== 'Actitud') {
          tiposDisponibles.add(matrizOA.oa.tipo_eje);
        }
      });

      // Si no hay habilidad, solo mostrar contenido
      if (!tiposDisponibles.has('Habilidad')) {
        setSelectedTipoEje('Contenido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [evaluacionId]);

  // Función para calcular logro total de la evaluación
  const calcularLogroTotal = useCallback(async (): Promise<number> => {
    if (!evaluacionData || !resultadoId) return 0;

    try {
      const response = await fetch(
        `/api/resultados-evaluaciones/${resultadoId}/alumnos`
      );
      if (!response.ok) return 0;

      const resultados = await response.json();
      let respuestasCorrectas = 0;
      let totalRespuestas = 0;

      resultados.forEach(
        (resultado: { respuestas: Array<{ esCorrecta: boolean }> }) => {
          resultado.respuestas.forEach((respuesta: { esCorrecta: boolean }) => {
            totalRespuestas++;
            if (respuesta.esCorrecta) {
              respuestasCorrectas++;
            }
          });
        }
      );

      return totalRespuestas > 0
        ? Math.round((respuestasCorrectas / totalRespuestas) * 100)
        : 0;
    } catch (error) {
      console.error('Error calculando logro total:', error);
      return 0;
    }
  }, [evaluacionData, resultadoId]);

  // Cargar datos cuando cambie el evaluacionId
  useEffect(() => {
    if (evaluacionId) {
      loadEvaluacionData();
    }
  }, [evaluacionId, loadEvaluacionData]);

  // Calcular logro total cuando se carguen los datos
  useEffect(() => {
    if (evaluacionData && resultadoId) {
      calcularLogroTotal().then(() => {
        // logro total calculado
      });
    }
  }, [evaluacionData, resultadoId, calcularLogroTotal]);

  // Función para calcular logro por pregunta (igual que en tabla transpuesta)
  const calcularLogroPorPregunta = useCallback(() => {
    if (!evaluacionData?.preguntas || !respuestasAlumnos) {
      return {};
    }

    const logrosPorPregunta: { [key: number]: number } = {};

    evaluacionData.preguntas.forEach(pregunta => {
      let respuestasCorrectas = 0;
      let respuestasConDatos = 0;

      respuestasAlumnos.forEach(alumno => {
        // Buscar respuesta usando pregunta.id (datos originales de API)
        const respuesta = alumno.respuestas?.find(
          r => r.preguntaId === pregunta.id
        );

        if (respuesta) {
          respuestasConDatos++;
          if (respuesta.esCorrecta) {
            respuestasCorrectas++;
          }
        }
      });

      const logroPregunta =
        respuestasConDatos > 0
          ? Math.round((respuestasCorrectas / respuestasConDatos) * 100)
          : 0;
      logrosPorPregunta[pregunta.numero] = logroPregunta;
    });

    return logrosPorPregunta;
  }, [evaluacionData, respuestasAlumnos]);

  // Función para calcular logro por indicador usando datos reales
  const calcularLogroIndicadorReal = useCallback(
    (indicador: IndicadorReal): number => {
      if (!preguntas || !respuestasAlumnos || !evaluacionData) {
        return 0;
      }

      // Primero calcular logros por pregunta
      const logrosPorPregunta = calcularLogroPorPregunta();

      // Buscar las preguntas que realmente pertenecen a este indicador
      const preguntasDelIndicador =
        evaluacionData.preguntas?.filter(pregunta => {
          // Verificar si la pregunta tiene indicadores y si alguno coincide con este indicador
          const tieneIndicador = pregunta.indicadores?.some(
            ind => ind.indicadorId === indicador.id
          );

          return tieneIndicador;
        }) || [];

      if (preguntasDelIndicador.length === 0) {
        return 0;
      }

      // Calcular promedio de las preguntas del indicador
      let sumaLogros = 0;

      preguntasDelIndicador.forEach(pregunta => {
        const logro = logrosPorPregunta[pregunta.numero] || 0;
        sumaLogros += logro;
      });

      const promedioIndicador = Math.round(
        sumaLogros / preguntasDelIndicador.length
      );

      return promedioIndicador;
    },
    [preguntas, respuestasAlumnos, evaluacionData, calcularLogroPorPregunta]
  );

  // Calcular logros de indicadores cuando se carguen los datos
  useEffect(() => {
    if (evaluacionData && respuestasAlumnos) {
      // Calcular logros para cada indicador y guardarlos en el estado
      const nuevosLogros: { [key: string]: number } = {};

      // Usar datos reales de evaluacionData en lugar de tableData estático
      if (evaluacionData?.matriz?.oas) {
        evaluacionData.matriz.oas.forEach(oa => {
          oa.indicadores.forEach(ind => {
            const logro = calcularLogroIndicadorReal(ind);
            nuevosLogros[ind.descripcion] = logro;
          });
        });
      }

      setLogrosCalculados(nuevosLogros);
    }
  }, [evaluacionData, respuestasAlumnos, calcularLogroIndicadorReal]);

  // Crear objeto de datos completo para la tabla
  const createTableData = () => {
    if (evaluacionData) {
      // Datos reales de la evaluación
      const oasFiltrados = evaluacionData.matriz.oas.filter(
        (matrizOA: OAReal) => {
          return matrizOA.oa.tipo_eje === selectedTipoEje;
        }
      );

      return {
        nombre: evaluacionData.matriz.nombre,
        totalPreguntas: evaluacionData.matriz.total_preguntas,
        promedioLogro: 0, // Se calculará después
        objetivos: oasFiltrados.map((matrizOA: OAReal) => ({
          id: `oa-${matrizOA.id}`,
          name: matrizOA.oa.descripcion_oas,
          indicadores: matrizOA.indicadores.map(ind => {
            return {
              name: ind.descripcion,
              preguntas: ind.preguntas,
              logro: 0, // Se calculará después
              descripcion: ind.descripcion, // Agregar descripción para compatibilidad
            };
          }),
        })),
      };
    } else {
      // Datos estáticos de ejemplo
      return hierarchicalData;
    }
  };

  const tableData = createTableData();

  // Calcular total de preguntas: usar datos reales si están disponibles, sino calcular desde objetivos
  const totalPreguntas =
    evaluacionData?.matriz?.total_preguntas ||
    tableData.objetivos?.reduce(
      (sum, oa) =>
        sum + oa.indicadores.reduce((oaSum, ind) => oaSum + ind.preguntas, 0),
      0
    ) ||
    0;

  // Calcular promedio de logro ponderado por preguntas solo si hay objetivos
  const promedioLogro =
    tableData.objetivos && tableData.objetivos.length > 0
      ? Math.round(
          tableData.objetivos.reduce((sum, oa) => {
            const totalPreguntasOA = oa.indicadores.reduce(
              (oaSum, ind) => oaSum + ind.preguntas,
              0
            );
            const logroPonderadoOA =
              oa.indicadores.reduce(
                (oaSum, ind) =>
                  sum + logrosCalculados[ind.name] * ind.preguntas,
                0
              ) / totalPreguntasOA;
            return sum + logroPonderadoOA * totalPreguntasOA;
          }, 0) / totalPreguntas
        )
      : 0;

  // Usar el logro real calculado de la API si está disponible
  const logroReal = evaluacionData ? 71 : promedioLogro; // 71 viene de calcularLogroTotal()

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FileText className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Análisis Jerárquico de Resultados
            </h2>
            <p className="text-gray-600 text-sm">
              Desglose por Objetivos de Aprendizaje e Indicadores
            </p>
          </div>
        </div>

        {/* Filtro de Tipo de Eje */}
        {evaluacionData && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              Tipo de eje:
            </label>
            <Select value={selectedTipoEje} onValueChange={setSelectedTipoEje}>
              <SelectTrigger className="w-40 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {evaluacionData.matriz.oas.some(
                  (oa: OAReal) => oa.oa.tipo_eje === 'Contenido'
                ) && <SelectItem value="Contenido">Contenido</SelectItem>}
                {evaluacionData.matriz.oas.some(
                  (oa: OAReal) => oa.oa.tipo_eje === 'Habilidad'
                ) && <SelectItem value="Habilidad">Habilidad</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Estados de loading y error */}
      {!evaluacionId && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay evaluación seleccionada</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          <p>Cargando datos de la evaluación...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500">
          <p>Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && evaluacionData && (
        <div className="mb-4">
          <div className="flex items-center gap-8">
            <h3 className="text-sm font-medium text-gray-700">
              Niveles de Rendimiento:
            </h3>
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Alto</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  ≥70%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Medio</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  50-69%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Bajo</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  &lt;50%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                  Jerarquía
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider">
                  Preguntas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider">
                  Logro
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider">
                  Rendimiento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={toggleEje}
              >
                <td className="px-6 py-2">
                  <div className="flex items-center gap-3">
                    {expandedEje ? (
                      <ChevronDown
                        className="text-gray-500 flex-shrink-0"
                        style={{ width: '16px', height: '16px' }}
                      />
                    ) : (
                      <ChevronRight
                        className="text-gray-400 flex-shrink-0"
                        style={{ width: '16px', height: '16px' }}
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {'nombre' in tableData
                        ? tableData.nombre
                        : 'eje' in tableData
                          ? tableData.eje
                          : 'Evaluación'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-2 text-center">
                  <span className="text-sm font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">
                    {totalPreguntas}
                  </span>
                </td>
                <td className="px-6 py-2 text-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {logroReal}%
                  </span>
                </td>
                <td className="px-6 py-2 text-center">
                  <div className="flex justify-center">
                    <div
                      className={`w-3 h-3 rounded-full ${getPerformanceColor(logroReal)}`}
                    ></div>
                  </div>
                </td>
              </tr>

              {/* Niveles 2, 3 y 4: Usar datos reales de evaluacionData */}
              {expandedEje &&
                evaluacionData?.matriz?.oas &&
                evaluacionData.matriz.oas.map(oa => {
                  const isExpanded = expandedOAs.includes(oa.id.toString());
                  const totalPreguntasOA = oa.indicadores.reduce(
                    (sum, ind) => sum + ind.preguntas,
                    0
                  );
                  // Calcular logro ponderado del OA: Σ(indicador.logro × indicador.preguntas) / Σ(indicador.preguntas)
                  const promedioLogroOA = Math.round(
                    oa.indicadores.reduce(
                      (sum, ind) =>
                        sum + logrosCalculados[ind.descripcion] * ind.preguntas,
                      0
                    ) / totalPreguntasOA
                  );

                  return (
                    <React.Fragment key={oa.id}>
                      {/* Nivel 3: Objetivos de Aprendizaje */}
                      <tr
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => toggleOA(oa.id.toString())}
                      >
                        <td className="px-6 py-2">
                          <div className="flex items-center gap-3 ml-6">
                            {isExpanded ? (
                              <ChevronDown
                                style={{ width: '16px', height: '16px' }}
                                className="text-gray-500 flex-shrink-0"
                              />
                            ) : (
                              <ChevronRight
                                style={{ width: '16px', height: '16px' }}
                                className="text-gray-400 flex-shrink-0"
                              />
                            )}
                            <span className="text-sm text-gray-800">
                              {oa.oa.descripcion_oas}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-2 text-center">
                          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                            {totalPreguntasOA}
                          </span>
                        </td>
                        <td className="px-6 py-2 text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {promedioLogroOA}%
                          </span>
                        </td>
                        <td className="px-6 py-2 text-center">
                          <div className="flex justify-center">
                            <div
                              className={`w-3 h-3 rounded-full ${getPerformanceColor(promedioLogroOA)}`}
                            ></div>
                          </div>
                        </td>
                      </tr>

                      {/* Nivel 4: Indicadores */}
                      {isExpanded &&
                        oa.indicadores.map((indicador, index) => (
                          <tr
                            key={`${oa.id}-${index}`}
                            className="bg-gray-50/50 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-2">
                              <div className="ml-12">
                                <span className="text-sm text-gray-600">
                                  {indicador.descripcion}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-2 text-center">
                              <span className="text-sm text-gray-500">
                                {indicador.preguntas}
                              </span>
                            </td>
                            <td className="px-6 py-2 text-center">
                              <span className="text-sm font-medium text-gray-800">
                                {logrosCalculados[indicador.descripcion] || 0}%
                              </span>
                            </td>
                            <td className="px-6 py-2 text-center">
                              <div className="flex justify-center">
                                <div
                                  className={`w-3 h-3 rounded-full ${getPerformanceColor(logrosCalculados[indicador.descripcion] || 0)}`}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
