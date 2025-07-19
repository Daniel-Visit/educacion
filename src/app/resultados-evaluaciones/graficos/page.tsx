"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, BarChart3, Users } from "lucide-react";
import { ResultadosHeader, LoadingState, ErrorState } from "@/components/resultados";
import { calcularRangosPorcentajes, calcularEstadisticas, descargarCSV, generarCSV } from "@/lib/resultados-utils";

interface ResultadoData {
  id: string;
  nombre: string;
  fecha: string;
  evaluacion: {
    id: string;
    nombre: string;
    matriz: {
      id: string;
      nombre: string;
      nivelExigencia: number;
    };
  };
  respuestasAlumnos: Array<{
    id: string;
    alumno: {
      id: string;
      nombre: string;
      apellido: string;
    };
    nota: number;
    porcentaje: number;
    puntajeTotal?: number;
    puntajeMaximo?: number;
  }>;
}



export default function GraficosPage() {
  const [resultadoData, setResultadoData] = useState<ResultadoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const data = sessionStorage.getItem('resultadoGraficos');
        
        if (data) {
          const parsedData = JSON.parse(data);
          setResultadoData(parsedData);
        } else {
          // Datos de prueba temporales
          const datosPrueba: ResultadoData = {
            id: "1",
            nombre: "Evaluación de Prueba",
            fecha: new Date().toISOString(),
            evaluacion: {
              id: "1",
              nombre: "Evaluación de Prueba",
              matriz: {
                id: "1",
                nombre: "Matriz de Prueba",
                nivelExigencia: 60
              }
            },
            respuestasAlumnos: [
              { id: "1", alumno: { id: "1", nombre: "Juan", apellido: "Pérez" }, nota: 6.5, porcentaje: 85 },
              { id: "2", alumno: { id: "2", nombre: "María", apellido: "García" }, nota: 5.2, porcentaje: 72 },
              { id: "3", alumno: { id: "3", nombre: "Carlos", apellido: "López" }, nota: 4.8, porcentaje: 68 },
              { id: "4", alumno: { id: "4", nombre: "Ana", apellido: "Martínez" }, nota: 3.5, porcentaje: 45 },
              { id: "5", alumno: { id: "5", nombre: "Luis", apellido: "Rodríguez" }, nota: 7.0, porcentaje: 95 },
              { id: "6", alumno: { id: "6", nombre: "Elena", apellido: "Fernández" }, nota: 4.2, porcentaje: 58 },
              { id: "7", alumno: { id: "7", nombre: "Pedro", apellido: "González" }, nota: 6.8, porcentaje: 88 },
              { id: "8", alumno: { id: "8", nombre: "Sofia", apellido: "Hernández" }, nota: 5.5, porcentaje: 75 }
            ]
          };
          setResultadoData(datosPrueba);
        }
      } catch (err) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingState message="Cargando gráficos..." size="lg" />
        </div>
      </div>
    );
  }

  if (error || !resultadoData) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <ErrorState 
            title="Error al cargar datos"
            message={error || 'No se encontraron datos para mostrar'}
            backHref="/resultados-evaluaciones"
            backText="Volver a Resultados"
          />
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <ResultadosHeader
          title="Gráficos de Resultados"
          subtitle="Análisis visual de los resultados de la evaluación"
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          showBackButton={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {resultadoData.evaluacion.nombre}
              </h3>
              <p className="text-emerald-200 text-sm">
                Matriz: {resultadoData.evaluacion.matriz.nombre}
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-emerald-200 text-sm">Fecha: {new Date(resultadoData.fecha).toLocaleDateString()}</p>
              <p className="text-emerald-200 text-sm">
                Nivel de Exigencia: {resultadoData.evaluacion.matriz.nivelExigencia}%
              </p>
            </div>
            <div className="flex items-center gap-4">
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
      </div>
    </div>
  );
} 