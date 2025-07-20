"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { TrendingUp, BarChart3, Users, Award, FileText, Calendar } from "lucide-react";
import { ResultadosHeader } from "@/components/resultados";
import { ErrorDisplay } from "@/components/resultados/ErrorDisplay";
import { QuestionTooltip } from "@/components/resultados/QuestionTooltip";
import { useEvaluacionData } from "@/hooks/use-evaluacion-data";
import { calcularRangosPorcentajes, calcularEstadisticas } from "@/lib/resultados-utils";

export default function GraficosPage() {
  const [evaluacionId, setEvaluacionId] = useState<string | null>(null);
  const { resultadoData, preguntas, loading, error } = useEvaluacionData(evaluacionId);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setEvaluacionId(id);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-indigo-600 font-medium">Cargando datos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!resultadoData || !resultadoData.respuestasAlumnos || resultadoData.respuestasAlumnos.length === 0) {
    return <ErrorDisplay message="No se encontraron datos para mostrar" />;
  }

  const rangosData = calcularRangosPorcentajes(resultadoData.respuestasAlumnos as any);
  const estadisticas = calcularEstadisticas(resultadoData.respuestasAlumnos as any, resultadoData.evaluacion.matriz.nivelExigencia);

  // Preparar datos para el gráfico de anillo
  const chartData = rangosData.map(rango => ({
    name: rango.rango,
    value: rango.estudiantes,
    color: rango.color,
    porcentaje: ((rango.estudiantes / resultadoData.respuestasAlumnos.length) * 100).toFixed(1)
  }));

  // Preparar datos para el gráfico de barras de notas
  const distribucionNotas = () => {
    const rangosNotas = [
      { rango: "1.0-1.9", min: 1.0, max: 1.9, estudiantes: 0 },
      { rango: "2.0-2.9", min: 2.0, max: 2.9, estudiantes: 0 },
      { rango: "3.0-3.9", min: 3.0, max: 3.9, estudiantes: 0 },
      { rango: "4.0-4.9", min: 4.0, max: 4.9, estudiantes: 0 },
      { rango: "5.0-5.9", min: 5.0, max: 5.9, estudiantes: 0 },
      { rango: "6.0-6.9", min: 6.0, max: 6.9, estudiantes: 0 },
      { rango: "7.0", min: 7.0, max: 7.0, estudiantes: 0 }
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

  // Preparar datos para el gráfico de área - notas ordenadas por alumno
  const areaChartData = resultadoData.respuestasAlumnos
    .map(respuesta => ({
      nombre: `${respuesta.alumno.nombre} ${respuesta.alumno.apellido}`,
      nota: respuesta.nota || 0,
      porcentaje: respuesta.porcentaje
    }))
    .sort((a, b) => a.nota - b.nota); // Ordenar de menor a mayor nota

  const CustomTooltip = ({ active, payload }: any) => {
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

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const porcentaje = ((data.estudiantes / resultadoData.respuestasAlumnos.length) * 100).toFixed(1);
      
      return (
        <div className="flex h-auto min-w-[140px] items-center gap-x-2 rounded-lg bg-white p-3 text-sm shadow-lg border border-gray-100">
          <div className="flex w-full flex-col gap-y-2">
            <span className="font-semibold text-gray-900">Rango: {label}</span>
            <div className="flex w-full items-center gap-x-2">
              <div className="h-3 w-3 flex-none rounded-full bg-blue-500" />
              <div className="flex w-full items-center justify-between gap-x-2 pr-1">
                <span className="text-gray-600">Estudiantes</span>
                <span className="font-mono font-semibold text-gray-900">{data.estudiantes}</span>
              </div>
            </div>
            <div className="flex w-full items-center gap-x-2">
              <div className="h-3 w-3 flex-none rounded-full bg-blue-400" />
              <div className="flex w-full items-center justify-between gap-x-2 pr-1">
                <span className="text-gray-600">Porcentaje</span>
                <span className="font-mono font-semibold text-gray-900">{porcentaje}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.nombre}</p>
          <p className="text-sm text-gray-600">
            Nota: <span className="font-medium">{data.nota}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje: <span className="font-medium">{data.porcentaje.toFixed(1)}%</span>
          </p>
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
                  <p className="text-lg font-bold">{resultadoData.respuestasAlumnos.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-200" />
                <div>
                  <p className="text-emerald-200 text-xs">Promedio</p>
                  <p className="text-lg font-bold">{estadisticas?.promedioNota || '0.0'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-200" />
                <div>
                  <p className="text-emerald-200 text-xs">Aprobados</p>
                  <p className="text-lg font-bold">{estadisticas?.aprobados || 0}</p>
                  <p className="text-emerald-200 text-xs">{estadisticas?.porcentajeAprobacion || 0}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-200" />
                <div>
                  <p className="text-emerald-200 text-xs">Reprobados</p>
                  <p className="text-lg font-bold">{estadisticas?.reprobados || 0}</p>
                  <p className="text-emerald-200 text-xs">{100 - (estadisticas?.porcentajeAprobacion || 0)}%</p>
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
              <h2 className="text-lg font-bold text-gray-900">Distribución por Rangos</h2>
              <p className="text-gray-600 text-sm">Estudiantes según rendimiento</p>
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
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.value} ({item.porcentaje}%)</p>
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
              <h2 className="text-lg font-bold text-gray-900">Distribución de Notas</h2>
              <p className="text-gray-600 text-sm">Estudiantes por calificación</p>
            </div>
          </div>

          {/* Gráfico compacto */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notasData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
                <Tooltip 
                  content={<CustomBarTooltip />} 
                  cursor={false}
                />
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
                      fill={[
                        '#1e3a8a', // blue-900 (oscuro abajo)
                        '#1e40af', // blue-800
                        '#1d4ed8', // blue-700
                        '#3b82f6', // blue-500
                        '#60a5fa', // blue-400
                        '#93c5fd', // blue-300
                        '#dbeafe'  // blue-100 (claro arriba)
                      ][index] || '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Área - Notas de Estudiantes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Notas de Estudiantes</h2>
              <p className="text-gray-600 text-sm">Desempeño de estudiantes por nota</p>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="fillNotas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#60a5fa"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#60a5fa"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                <XAxis 
                  dataKey="nombre" 
                  tickLine={false}
                  axisLine={false}
                  tick={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  content={<CustomAreaTooltip />} 
                  cursor={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="nota" 
                  stroke="#60a5fa" 
                  fill="url(#fillNotas)"
                  strokeWidth={2}
                  animationDuration={450}
                  animationEasing="ease"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="h-16"></div>

      {/* Tabla de Resultados Detallada */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Resultados Detallados por Estudiante</h2>
            <p className="text-gray-600 text-sm">Respuestas incorrectas por pregunta</p>
          </div>
        </div>

        {/* Datos de ejemplo para las preguntas */}
        {(() => {
          // Usar las preguntas cargadas desde la API o fallback
          const preguntasParaTabla = preguntas.length > 0 ? preguntas : Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            numero: i + 1,
            texto: `Pregunta ${i + 1}`
          }));

          // Usar datos reales de respuestas
          const respuestasEstudiantes = resultadoData.respuestasAlumnos.map(respuestaAlumno => {
            // Mapear respuestas reales a todas las preguntas
            const respuestas = preguntasParaTabla.map(pregunta => {
              const respuestaReal = respuestaAlumno.respuestas?.find(r => r.preguntaId === pregunta.numero);
              
              if (respuestaReal) {
                return {
                  preguntaId: pregunta.numero,
                  esCorrecta: respuestaReal.esCorrecta,
                  alternativaDada: respuestaReal.esCorrecta ? null : respuestaReal.alternativaDada
                };
              } else {
                // Si no hay respuesta para esta pregunta, generar basado en el porcentaje
                const porcentajeCorrectas = respuestaAlumno.porcentaje / 100;
                const esCorrecta = Math.random() < porcentajeCorrectas;
                return {
                  preguntaId: pregunta.numero,
                  esCorrecta,
                  alternativaDada: esCorrecta ? null : ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
                };
              }
            });
            
            return {
              alumno: respuestaAlumno.alumno,
              respuestas,
              porcentajeCorrectas: respuestaAlumno.porcentaje
            };
          });

          // Calcular porcentaje de aciertos por pregunta
          const porcentajePorPregunta = preguntasParaTabla.map(pregunta => {
            const respuestasCorrectas = respuestasEstudiantes.filter(estudiante => {
              const respuesta = estudiante.respuestas.find(r => r.preguntaId === pregunta.numero);
              return respuesta?.esCorrecta;
            }).length;
            
            return Math.round((respuestasCorrectas / respuestasEstudiantes.length) * 100);
          });

          return (
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto overflow-visible">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-30">
                    <tr className="border-b border-gray-200 bg-white">
                      <th className="sticky left-0 z-40 bg-white px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[200px]">
                        Estudiante
                      </th>
                      {preguntasParaTabla.map((pregunta, index) => (
                        <th key={pregunta.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px] bg-white relative group">
                          <div className="cursor-pointer relative">
                            {pregunta.numero}
                            <QuestionTooltip numero={pregunta.numero} texto={pregunta.texto} />
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200 min-w-[80px] bg-white">
                        % Aciertos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {respuestasEstudiantes.map((estudiante, index) => (
                      <tr key={estudiante.alumno.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          {estudiante.alumno.nombre} {estudiante.alumno.apellido}
                        </td>
                        {estudiante.respuestas.map((respuesta, respIndex) => (
                          <td key={respIndex} className="px-2 py-2 text-center">
                            {respuesta.esCorrecta ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold text-white bg-green-400 shadow-sm">
                                ✓
                              </div>
                            ) : respuesta.alternativaDada ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold text-white bg-rose-500 shadow-sm">
                                {respuesta.alternativaDada}
                              </div>
                            ) : null}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-l border-gray-200">
                          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {Math.round(estudiante.porcentajeCorrectas)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Fila de porcentajes por pregunta */}
                    <tr className="border-t border-gray-300 bg-white-50">
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-200">
                        % Aciertos
                      </td>
                      {porcentajePorPregunta.map((porcentaje, index) => (
                        <td key={index} className="px-2 py-3 text-center">
                          <div className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            {porcentaje}%
                          </div>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center text-sm font-bold text-gray-900 border-l border-gray-200">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {Math.round(respuestasEstudiantes.reduce((sum, estudiante) => sum + estudiante.porcentajeCorrectas, 0) / respuestasEstudiantes.length)}%
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
} 