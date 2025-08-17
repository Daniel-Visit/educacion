'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Download,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';

interface ResultadosEvaluacionProps {
  evaluacionId: number;
  evaluacionNombre: string;
}

interface ResultadoAlumno {
  id: number;
  alumno: {
    rut: string;
    nombre: string;
    apellido: string;
  };
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
  nota: number;
  respuestas: RespuestaAlumno[];
}

interface RespuestaAlumno {
  id: number;
  preguntaId: number;
  alternativaDada: string;
  esCorrecta: boolean;
  puntajeObtenido: number;
}

export default function ResultadosEvaluacion({
  evaluacionId,
  evaluacionNombre,
}: ResultadosEvaluacionProps) {
  const [resultados, setResultados] = useState<ResultadoAlumno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResultado, setSelectedResultado] =
    useState<ResultadoAlumno | null>(null);

  useEffect(() => {
    cargarResultados();
  }, [evaluacionId, cargarResultados]);

  const cargarResultados = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/evaluaciones/${evaluacionId}/resultados`
      );
      if (response.ok) {
        const data = await response.json();
        setResultados(data);
      } else {
        setError('Error al cargar los resultados');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, [evaluacionId]);

  const calcularEstadisticas = () => {
    if (resultados.length === 0) return null;

    const notas = resultados.map(r => r.nota);
    const porcentajes = resultados.map(r => r.porcentaje);

    return {
      promedio: notas.reduce((a, b) => a + b, 0) / notas.length,
      maximo: Math.max(...notas),
      minimo: Math.min(...notas),
      aprobados: notas.filter(n => n >= 4.0).length,
      reprobados: notas.filter(n => n < 4.0).length,
      porcentajePromedio:
        porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length,
    };
  };

  const prepararDatosGrafico = () => {
    const stats = calcularEstadisticas();
    if (!stats) return [];

    return [
      { name: 'Aprobados', value: stats.aprobados, color: '#10b981' },
      { name: 'Reprobados', value: stats.reprobados, color: '#ef4444' },
    ];
  };

  const prepararDatosNotas = () => {
    const rangos = [
      { rango: '1.0-2.0', count: 0, color: '#ef4444' },
      { rango: '2.0-3.0', count: 0, color: '#f59e0b' },
      { rango: '3.0-4.0', count: 0, color: '#f97316' },
      { rango: '4.0-5.0', count: 0, color: '#06b6d4' },
      { rango: '5.0-6.0', count: 0, color: '#8b5cf6' },
      { rango: '6.0-7.0', count: 0, color: '#10b981' },
    ];

    resultados.forEach(resultado => {
      const nota = resultado.nota;
      if (nota >= 1.0 && nota < 2.0) rangos[0].count++;
      else if (nota >= 2.0 && nota < 3.0) rangos[1].count++;
      else if (nota >= 3.0 && nota < 4.0) rangos[2].count++;
      else if (nota >= 4.0 && nota < 5.0) rangos[3].count++;
      else if (nota >= 5.0 && nota < 6.0) rangos[4].count++;
      else if (nota >= 6.0 && nota <= 7.0) rangos[5].count++;
    });

    return rangos;
  };

  const exportarResultados = () => {
    const csvContent = [
      'RUT,Nombre,Apellido,Puntaje Total,Puntaje Máximo,Porcentaje,Nota',
      ...resultados.map(
        r =>
          `${r.alumno.rut},${r.alumno.nombre},${r.alumno.apellido},${r.puntajeTotal},${r.puntajeMaximo},${r.porcentaje.toFixed(2)}%,${r.nota.toFixed(1)}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados_${evaluacionNombre.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-indigo-600 font-medium">
              Cargando resultados...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (resultados.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-indigo-600">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>No hay resultados cargados para esta evaluación</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = calcularEstadisticas();
  const datosGrafico = prepararDatosGrafico();
  const datosNotas = prepararDatosNotas();

  return (
    <div className="space-y-8">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-700">
                  Total Alumnos
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {resultados.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Promedio</p>
                <p className="text-3xl font-bold text-emerald-900">
                  {stats?.promedio.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-600 p-3 rounded-xl">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Aprobados</p>
                <p className="text-3xl font-bold text-amber-900">
                  {stats?.aprobados}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Reprobados</p>
                <p className="text-3xl font-bold text-red-900">
                  {stats?.reprobados}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de distribución de notas */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <CardTitle className="flex items-center gap-3 text-indigo-900">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
              Distribución de Notas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosNotas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="rango" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de aprobados vs reprobados */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-3 text-emerald-900">
              <PieChartIcon className="h-6 w-6 text-emerald-600" />
              Aprobados vs Reprobados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosGrafico}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de resultados */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-3 text-indigo-900">
              <Users className="h-6 w-6 text-indigo-600" />
              Resultados por Alumno
            </CardTitle>
            <Button
              onClick={exportarResultados}
              variant="outline"
              size="sm"
              className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-indigo-900">
                    Alumno
                  </th>
                  <th className="text-left p-4 font-semibold text-indigo-900">
                    RUT
                  </th>
                  <th className="text-left p-4 font-semibold text-indigo-900">
                    Puntaje
                  </th>
                  <th className="text-left p-4 font-semibold text-indigo-900">
                    Porcentaje
                  </th>
                  <th className="text-left p-4 font-semibold text-indigo-900">
                    Nota
                  </th>
                  <th className="text-left p-4 font-semibold text-indigo-900">
                    Estado
                  </th>
                  <th className="text-left p-4 font-semibold text-indigo-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((resultado, index) => (
                  <tr
                    key={resultado.id}
                    className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'}`}
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {resultado.alumno.nombre} {resultado.alumno.apellido}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {resultado.alumno.rut}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {resultado.puntajeTotal}/{resultado.puntajeMaximo}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {resultado.porcentaje.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-lg">
                        {resultado.nota.toFixed(1)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          resultado.nota >= 4.0 ? 'default' : 'destructive'
                        }
                        className="font-semibold"
                      >
                        {resultado.nota >= 4.0 ? 'Aprobado' : 'Reprobado'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedResultado(resultado)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalle de respuestas */}
      {selectedResultado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  Detalle de Respuestas - {selectedResultado.alumno.nombre}{' '}
                  {selectedResultado.alumno.apellido}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedResultado(null)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 text-center">
                  <p className="text-sm font-medium text-indigo-700">Puntaje</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {selectedResultado.puntajeTotal}/
                    {selectedResultado.puntajeMaximo}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 text-center">
                  <p className="text-sm font-medium text-purple-700">
                    Porcentaje
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {selectedResultado.porcentaje.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 text-center">
                  <p className="text-sm font-medium text-emerald-700">Nota</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {selectedResultado.nota.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Respuestas por Pregunta:
                </h4>
                <div className="grid gap-3">
                  {selectedResultado.respuestas.map(respuesta => (
                    <div
                      key={respuesta.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${respuesta.esCorrecta ? 'bg-emerald-500' : 'bg-red-500'}`}
                        ></div>
                        <div>
                          <span className="font-semibold text-gray-900">
                            Pregunta {respuesta.preguntaId}:
                          </span>
                          <span className="ml-2 text-gray-600">
                            Alternativa {respuesta.alternativaDada}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            respuesta.esCorrecta ? 'default' : 'destructive'
                          }
                          className="font-semibold"
                        >
                          {respuesta.esCorrecta ? 'Correcta' : 'Incorrecta'}
                        </Badge>
                        <span className="text-sm font-medium text-gray-600">
                          {respuesta.puntajeObtenido} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
