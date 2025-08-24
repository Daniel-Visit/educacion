'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Users,
  Award,
  FileText,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import { ResultadosHeader } from '@/components/resultados';
import { TablaResultadosTranspuesta } from '@/components/resultados/TablaResultadosTranspuesta';
import EducationalHierarchicalTable from '@/components/resultados/EducationalHierarchicalTable';
import { useEvaluacionData } from '@/hooks/use-evaluacion-data';
import {
  calcularRangosPorcentajes,
  calcularEstadisticas,
} from '@/lib/resultados-utils';

export default function GraficosPage() {
  const [evaluacionId, setEvaluacionId] = useState<string | null>(null);
  const { resultadoData, preguntas, isLoading, error } =
    useEvaluacionData(evaluacionId);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setEvaluacionId(id);
  }, []);

  // Mostrar loading mientras se está cargando o mientras no hay evaluacionId
  if (isLoading || !evaluacionId) {
    return (
      <div className="container mx-auto">
        <LoadingState message="Cargando datos..." />
      </div>
    );
  }

  // Mostrar error si hay un error específico
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border border-red-200 rounded-3xl p-8 shadow-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-800 mb-3">
                Error al cargar datos
              </h3>
              <div className="max-w-md mx-auto space-y-3">
                <p className="text-red-700 text-base leading-relaxed">
                  {error}
                </p>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mx-auto my-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay datos después de la carga (solo si no está cargando)
  if (
    !isLoading &&
    (!resultadoData ||
      !resultadoData.respuestasAlumnos ||
      resultadoData.respuestasAlumnos.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border border-red-200 rounded-3xl p-8 shadow-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-800 mb-3">
                Sin datos disponibles
              </h3>
              <div className="max-w-md mx-auto space-y-3">
                <p className="text-red-700 text-base leading-relaxed">
                  No se encontraron datos para mostrar
                </p>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mx-auto my-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Asegurar que resultadoData existe antes de continuar
  if (!resultadoData) {
    return null;
  }

  const rangosData = calcularRangosPorcentajes(
    resultadoData.respuestasAlumnos as Array<{
      id: string;
      alumno: { id: string; nombre: string; apellido: string };
      nota: number;
      porcentaje: number;
      puntajeTotal: number;
      puntajeMaximo: number;
    }>
  );
  const estadisticas = calcularEstadisticas(
    resultadoData.respuestasAlumnos as Array<{
      id: string;
      alumno: { id: string; nombre: string; apellido: string };
      nota: number;
      porcentaje: number;
      puntajeTotal: number;
      puntajeMaximo: number;
    }>,
    resultadoData.evaluacion.matriz.nivelExigencia
  );

  // Preparar datos para el gráfico de anillo
  const chartData = rangosData.map(rango => ({
    name: rango.rango,
    value: rango.estudiantes,
    color: rango.color,
    porcentaje: (
      (rango.estudiantes / resultadoData.respuestasAlumnos.length) *
      100
    ).toFixed(1),
  }));

  // Preparar datos para el gráfico de barras de notas
  const distribucionNotas = () => {
    const rangosNotas = [
      { rango: '1.0-1.9', min: 1.0, max: 1.9, estudiantes: 0 },
      { rango: '2.0-2.9', min: 2.0, max: 2.9, estudiantes: 0 },
      { rango: '3.0-3.9', min: 3.0, max: 3.9, estudiantes: 0 },
      { rango: '4.0-4.9', min: 4.0, max: 4.9, estudiantes: 0 },
      { rango: '5.0-5.9', min: 5.0, max: 5.9, estudiantes: 0 },
      { rango: '6.0-6.9', min: 6.0, max: 6.9, estudiantes: 0 },
      { rango: '7.0', min: 7.0, max: 7.0, estudiantes: 0 },
    ];

    resultadoData.respuestasAlumnos.forEach(respuesta => {
      const nota = respuesta.nota || 0;
      const rango = rangosNotas.find(r => nota >= r.min && nota <= r.max);
      if (rango) {
        rango.estudiantes++;
      }
    });

    return rangosNotas.filter(rango => rango.estudiantes > 0);
  };

  const notasData = distribucionNotas();

  // Interfaces para los tooltips
  interface PieChartTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        value: number;
        porcentaje: string;
      };
    }>;
  }

  interface BarChartTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        estudiantes: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload }: PieChartTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Estudiantes: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje: <span className="font-medium">{data.porcentaje}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({
    active,
    payload,
    label,
  }: BarChartTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const porcentaje = (
        (data.estudiantes / resultadoData.respuestasAlumnos.length) *
        100
      ).toFixed(1);

      return (
        <div className="flex h-auto min-w-[140px] items-center gap-x-2 rounded-lg bg-white p-3 text-sm shadow-lg border border-gray-100">
          <div className="flex w-full flex-col gap-y-2">
            <span className="font-semibold text-gray-900">Rango: {label}</span>
            <div className="flex w-full items-center gap-x-2">
              <div className="h-3 w-3 flex-none rounded-full bg-blue-500" />
              <div className="flex w-full items-center justify-between gap-x-2 pr-1">
                <span className="text-gray-600">Estudiantes</span>
                <span className="font-mono font-semibold text-gray-900">
                  {data.estudiantes}
                </span>
              </div>
            </div>
            <div className="flex w-full items-center gap-x-2">
              <div className="h-3 w-3 flex-none rounded-full bg-blue-400" />
              <div className="flex w-full items-center justify-between gap-x-2 pr-1">
                <span className="text-gray-600">Porcentaje</span>
                <span className="font-mono font-semibold text-gray-900">
                  {porcentaje}%
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ResultadosHeader
          title="Gráficos de Resultados"
          subtitle="Análisis visual de los resultados de la evaluación"
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          showBackButton={true}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sección 1: Información de Evaluación */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {resultadoData.evaluacion.nombre}
                </h3>
                <p className="text-emerald-200 text-sm">
                  Matriz: {resultadoData.evaluacion.matriz.nombre}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-200" />
                  <span className="text-emerald-200">
                    Fecha: {new Date(resultadoData.fecha).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-200" />
                  <span className="text-emerald-200">
                    Nivel: {resultadoData.evaluacion.matriz.nivelExigencia}%
                  </span>
                </div>
              </div>
            </div>

            {/* Sección 2: Estadísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-200" />
                <div>
                  <p className="text-emerald-200 text-xs">Total Estudiantes</p>
                  <p className="text-lg font-bold">
                    {resultadoData.respuestasAlumnos.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-200" />
                <div>
                  <p className="text-emerald-200 text-xs">Promedio</p>
                  <p className="text-lg font-bold">
                    {estadisticas?.promedioNota || '0.0'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-200" />
                <div>
                  <p className="text-emerald-200 text-xs">Aprobados</p>
                  <p className="text-lg font-bold">
                    {estadisticas?.aprobados || 0}
                  </p>
                  <p className="text-emerald-200 text-xs">
                    {estadisticas?.porcentajeAprobacion || 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-200" />
                <div>
                  <p className="text-emerald-200 text-xs">Reprobados</p>
                  <p className="text-lg font-bold">
                    {estadisticas?.reprobados || 0}
                  </p>
                  <p className="text-emerald-200 text-xs">
                    {100 - (estadisticas?.porcentajeAprobacion || 0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ResultadosHeader>

        {/* Gráfico de Anillo - Distribución por Rangos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Distribución por Rangos
              </h2>
              <p className="text-gray-600 text-sm">
                Estudiantes según rendimiento
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Gráfico */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda compacta */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-2">
                {chartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.value} ({item.porcentaje}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras - Distribución de Notas */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Award className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Distribución de Notas
              </h2>
              <p className="text-gray-600 text-sm">
                Estudiantes por calificación
              </p>
            </div>
          </div>

          {/* Gráfico compacto */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={notasData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis
                  dataKey="rango"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={false} />
                <Bar
                  dataKey="estudiantes"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                  animationDuration={450}
                  animationEasing="ease"
                >
                  {notasData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          '#1e3a8a', // blue-900 (oscuro abajo)
                          '#1e40af', // blue-800
                          '#1d4ed8', // blue-700
                          '#3b82f6', // blue-500
                          '#60a5fa', // blue-400
                          '#93c5fd', // blue-300
                          '#dbeafe', // blue-100 (claro arriba)
                        ][index] || '#3b82f6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados Detallada */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Resultados Detallados por Estudiante
            </h2>
            <p className="text-gray-600 text-sm">
              Respuestas incorrectas por pregunta
            </p>
          </div>
        </div>

        {/* Datos reales para las preguntas */}
        {(() => {
          // Usar las preguntas cargadas desde la API
          if (preguntas.length === 0) {
            return (
              <div className="text-center py-8 text-gray-500">
                <p>No hay preguntas disponibles para esta evaluación</p>
              </div>
            );
          }

          // Usar datos reales de respuestas
          const respuestasEstudiantes = resultadoData.respuestasAlumnos.map(
            respuestaAlumno => {
              // Mapear respuestas reales a todas las preguntas
              const respuestas = preguntas.map(pregunta => {
                const respuestaReal = respuestaAlumno.respuestas?.find(
                  r => r.preguntaId === pregunta.id
                );

                if (respuestaReal) {
                  return {
                    preguntaId: pregunta.numero, // Mantener numero para mostrar
                    preguntaIdReal: pregunta.id, // Agregar ID real para debug
                    esCorrecta: respuestaReal.esCorrecta,
                    alternativaDada: respuestaReal.alternativaDada,
                    tieneDatos: true,
                  };
                } else {
                  // Si no hay respuesta para esta pregunta, mostrar sin datos
                  return {
                    preguntaId: pregunta.numero,
                    esCorrecta: false,
                    alternativaDada: null,
                    tieneDatos: false,
                  };
                }
              });

              return {
                alumno: respuestaAlumno.alumno,
                respuestas,
                porcentajeCorrectas: respuestaAlumno.porcentaje,
              };
            }
          );

          // Calcular porcentaje de aciertos por pregunta (solo con datos reales)
          const porcentajePorPregunta = preguntas.map(pregunta => {
            const respuestasConDatos = respuestasEstudiantes.filter(
              estudiante => {
                const respuesta = estudiante.respuestas.find(
                  r => r.preguntaId === pregunta.numero
                );
                return respuesta?.tieneDatos;
              }
            );

            if (respuestasConDatos.length === 0) {
              return 0; // No hay datos para esta pregunta
            }

            const respuestasCorrectas = respuestasConDatos.filter(
              estudiante => {
                const respuesta = estudiante.respuestas.find(
                  r => r.preguntaId === pregunta.numero
                );
                return respuesta?.esCorrecta;
              }
            ).length;

            return Math.round(
              (respuestasCorrectas / respuestasConDatos.length) * 100
            );
          });

          return (
            <TablaResultadosTranspuesta
              preguntas={preguntas}
              respuestasEstudiantes={respuestasEstudiantes}
              porcentajePorPregunta={porcentajePorPregunta}
            />
          );
        })()}
      </div>
      <div className="h-8"></div>
      {/* Nueva Card: Análisis Jerárquico de Resultados */}
      <EducationalHierarchicalTable
        evaluacionId={resultadoData?.evaluacion?.id?.toString()}
        resultadoId={evaluacionId}
        preguntas={preguntas}
        respuestasAlumnos={resultadoData.respuestasAlumnos.map(alumno => ({
          id: parseInt(alumno.id),
          respuestas:
            alumno.respuestas?.map(respuesta => ({
              preguntaId: respuesta.preguntaId,
              esCorrecta: respuesta.esCorrecta,
            })) || [],
        }))}
      />

      <div className="h-16"></div>
    </div>
  );
}
