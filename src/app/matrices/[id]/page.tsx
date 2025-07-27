'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Hash, Calendar, BookOpen, List, Clock, Edit, Trash2 } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import { Dialog } from '@headlessui/react';

interface OA {
  id: number;
  oas_id: string;
  descripcion_oas: string;
  nivel: { nombre: string };
  asignatura: { nombre: string };
  tipo_eje: 'Contenido' | 'Habilidad' | 'Actitud';
}

interface Indicador {
  id: number;
  descripcion: string;
  preguntas: number;
}

interface MatrizOA {
  id: number;
  oaId: number;
  oa: OA;
  indicadores: Indicador[];
}

interface MatrizEspecificacion {
  id: number;
  nombre: string;
  total_preguntas: number;
  createdAt: string;
  oas: MatrizOA[];
}

export default function VerMatrizPage() {
  const router = useRouter();
  const params = useParams();
  const [matriz, setMatriz] = useState<MatrizEspecificacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMatriz(Number(params.id));
    }
  }, [params.id]);

  const fetchMatriz = async (id: number) => {
    try {
      const response = await fetch(`/api/matrices/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMatriz(data);
      } else {
        setError('Matriz no encontrada');
      }
    } catch (error) {
      console.error('Error al obtener matriz:', error);
      setError('Error al cargar la matriz');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/matrices/${matriz?.id}/editar`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!matriz) return;
    setShowDeleteModal(false);
    try {
      const response = await fetch(`/api/matrices/${matriz.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push('/matrices');
      } else {
        setAlert({ type: 'error', message: 'Error al eliminar la matriz.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al eliminar la matriz.' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fd] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando matriz...</p>
        </div>
      </div>
    );
  }

  if (error || !matriz) {
    return (
      <div className="min-h-screen bg-[#f7f8fd] flex items-center justify-center">
        <div className="text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Matriz no encontrada'}
          </h3>
          <SecondaryButton onClick={() => router.push('/matrices')}>
            Volver a Matrices
          </SecondaryButton>
        </div>
      </div>
    );
  }

  const totalPreguntasIndicadores = matriz.oas.reduce((sum, matrizOA) => 
    sum + matrizOA.indicadores.reduce((oaSum, ind) => oaSum + ind.preguntas, 0), 0
  );

  // Separar OAs por tipo de eje
  const oasContenido = matriz.oas.filter(matrizOA => matrizOA.oa.tipo_eje === 'Contenido');
  const oasHabilidad = matriz.oas.filter(matrizOA => matrizOA.oa.tipo_eje === 'Habilidad');

  // Calcular totales separados por tipo de eje
  const totalPreguntasContenido = oasContenido.reduce((sum, matrizOA) => 
    sum + matrizOA.indicadores.reduce((oaSum, ind) => oaSum + ind.preguntas, 0), 0
  );
  
  const totalPreguntasHabilidad = oasHabilidad.reduce((sum, matrizOA) => 
    sum + matrizOA.indicadores.reduce((oaSum, ind) => oaSum + ind.preguntas, 0), 0
  );

  // Determinar si hay ambos tipos de eje
  const hasBothTypes = oasContenido.length > 0 && oasHabilidad.length > 0;
  
  // Para mostrar el total correcto: si hay ambos tipos, usar el total de contenido (o habilidad, ambos deberían ser iguales)
  const totalPreguntasToShow = hasBothTypes ? totalPreguntasContenido : totalPreguntasIndicadores;
  
  // Validación: si hay ambos tipos, ambos deben sumar el total de la matriz
  const isMatrizValid = hasBothTypes 
    ? (totalPreguntasContenido === matriz.total_preguntas && totalPreguntasHabilidad === matriz.total_preguntas)
    : (totalPreguntasIndicadores === matriz.total_preguntas);

  return (
    <>
      {/* Header modernizado */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/80 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {matriz.nombre}
                </h1>
                <p className="text-indigo-100 text-sm">
                  Matriz de Especificación #{matriz.id}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="h-10 px-4 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-200 backdrop-blur-sm gap-2 font-medium text-sm"
              title="Editar matriz"
            >
              <Edit size={16} />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all duration-200 backdrop-blur-sm"
              title="Eliminar matriz"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {/* Stats compactas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Preguntas</p>
                <p className="text-lg font-bold">{matriz.total_preguntas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">OAs Incluidos</p>
                <p className="text-lg font-bold">{matriz.oas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Indicadores</p>
                <p className="text-lg font-bold">
                  {matriz.oas.reduce((sum, matrizOA) => sum + matrizOA.indicadores.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Creada</p>
                <p className="text-sm font-semibold">
                  {formatDate(matriz.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Status - Modernizado */}
      <div className="mb-8">
        <div className={`relative overflow-hidden rounded-2xl shadow-lg ${
          isMatrizValid
            ? 'bg-gradient-to-r from-emerald-500 to-green-500'
            : 'bg-gradient-to-r from-amber-500 to-orange-500'
        }`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  isMatrizValid
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-white/20 backdrop-blur-sm'
                }`}>
                  {isMatrizValid ? (
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  ) : (
                    <Clock size={20} className="text-white" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {isMatrizValid
                      ? 'Matriz Válida'
                      : 'Matriz Incompleta'
                    }
                  </p>
                  <p className="text-white/90 text-sm">
                    Preguntas de indicadores: {totalPreguntasToShow} / {matriz.total_preguntas}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {Math.round((totalPreguntasToShow / matriz.total_preguntas) * 100)}%
                </div>
                <div className="text-white/80 text-xs">Completado</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OAs Section - Modernizada */}
      <div className="space-y-8">
        {/* OAs de Contenido */}
        {oasContenido.length > 0 && (
          <div className="space-y-6">
            {/* Header de Contenido */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Objetivos de Aprendizaje - Contenido</h2>
                    <p className="text-blue-100">OAs de contenido incluidos en esta matriz</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-200">
                    {oasContenido.length} OAs
                  </div>
                  <div className="text-sm text-blue-100">
                    {totalPreguntasContenido} preguntas
                  </div>
                </div>
              </div>
            </div>

            {/* OAs de Contenido */}
            <div className="grid gap-6">
              {oasContenido.map((matrizOA, index) => (
                <div key={matrizOA.id} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Header del OA */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {matrizOA.oa?.oas_id || `OA ${matrizOA.oaId}`}
                          </div>
                          {matrizOA.oa?.nivel && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {matrizOA.oa.nivel.nombre}
                            </span>
                          )}
                          {matrizOA.oa?.asignatura && (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                              {matrizOA.oa.asignatura.nombre}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {matrizOA.oa?.descripcion_oas || 'Descripción no disponible'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <List size={16} className="text-blue-600" />
                        </div>
                        Indicadores
                      </h3>
                      <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {matrizOA.indicadores.length} indicadores
                      </div>
                    </div>
                    
                    {matrizOA.indicadores.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <List size={20} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No hay indicadores definidos</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {matrizOA.indicadores.map((indicador, idx) => (
                          <div key={indicador.id} className="group/indicator bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </div>
                                  <p className="text-gray-900 font-medium text-sm leading-relaxed">
                                    {indicador.descripcion}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                                <Hash size={14} className="text-blue-600" />
                                <span className="font-semibold text-blue-700 text-sm">
                                  {indicador.preguntas} preguntas
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OAs de Habilidad */}
        {oasHabilidad.length > 0 && (
          <div className="space-y-6">
            {/* Header de Habilidad */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Objetivos de Aprendizaje - Habilidad</h2>
                    <p className="text-green-100">OAs de habilidad incluidos en esta matriz</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-200">
                    {oasHabilidad.length} OAs
                  </div>
                  <div className="text-sm text-green-100">
                    {totalPreguntasHabilidad} preguntas
                  </div>
                </div>
              </div>
            </div>

            {/* OAs de Habilidad */}
            <div className="grid gap-6">
              {oasHabilidad.map((matrizOA, index) => (
                <div key={matrizOA.id} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Header del OA */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {matrizOA.oa?.oas_id || `OA ${matrizOA.oaId}`}
                          </div>
                          {matrizOA.oa?.nivel && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {matrizOA.oa.nivel.nombre}
                            </span>
                          )}
                          {matrizOA.oa?.asignatura && (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                              {matrizOA.oa.asignatura.nombre}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {matrizOA.oa?.descripcion_oas || 'Descripción no disponible'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <List size={16} className="text-green-600" />
                        </div>
                        Indicadores
                      </h3>
                      <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {matrizOA.indicadores.length} indicadores
                      </div>
                    </div>
                    
                    {matrizOA.indicadores.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <List size={20} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No hay indicadores definidos</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {matrizOA.indicadores.map((indicador, idx) => (
                          <div key={indicador.id} className="group/indicator bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 border border-gray-200 hover:border-green-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </div>
                                  <p className="text-gray-900 font-medium text-sm leading-relaxed">
                                    {indicador.descripcion}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                                <Hash size={14} className="text-green-600" />
                                <span className="font-semibold text-green-700 text-sm">
                                  {indicador.preguntas} preguntas
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modales de confirmación y alerta */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
            <Dialog.Title className="text-lg font-bold mb-4">¿Eliminar matriz?</Dialog.Title>
            <Dialog.Description className="mb-6 text-gray-600">Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta matriz?</Dialog.Description>
            <div className="flex gap-4 justify-end">
              <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={confirmDelete}>Eliminar</PrimaryButton>
            </div>
          </div>
        </div>
      </Dialog>
      {alert && (
        <Dialog open={!!alert} onClose={() => setAlert(null)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
              <Dialog.Title className="text-lg font-bold mb-4">{alert.type === 'error' ? 'Error' : 'Éxito'}</Dialog.Title>
              <Dialog.Description className="mb-6 text-gray-600">{alert.message}</Dialog.Description>
              <div className="flex gap-4 justify-end">
                <PrimaryButton onClick={() => setAlert(null)}>Cerrar</PrimaryButton>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
} 