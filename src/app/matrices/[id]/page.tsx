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

  return (
    <>
      <div className="flex items-center gap-4 pb-2 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-indigo-700 mb-1">
            {matriz.nombre}
          </h1>
          <p className="text-gray-500 text-base">
            Matriz de Especificación #{matriz.id}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleEdit}
            className="h-10 px-4 flex items-center justify-center rounded-lg text-gray-700 border border-gray-300 transition-colors hover:bg-gray-100 hover:border-gray-400 gap-2 font-semibold"
            title="Editar matriz"
          >
            <Edit size={20} className="text-gray-700" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="h-10 w-10 flex items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:border hover:border-red-300 border border-transparent"
            title="Eliminar matriz"
          >
            <Trash2 size={20} className="text-red-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Hash size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Preguntas</p>
              <p className="text-2xl font-bold text-indigo-700">{matriz.total_preguntas}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">OAs Incluidos</p>
              <p className="text-2xl font-bold text-green-700">{matriz.oas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <List size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Indicadores</p>
              <p className="text-2xl font-bold text-blue-700">
                {matriz.oas.reduce((sum, matrizOA) => sum + matrizOA.indicadores.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Creada</p>
              <p className="text-sm font-semibold text-purple-700">
                {formatDate(matriz.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      <div className="mb-8">
        <div className={`p-4 rounded-xl border ${
          totalPreguntasIndicadores === matriz.total_preguntas
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              totalPreguntasIndicadores === matriz.total_preguntas
                ? 'bg-green-100'
                : 'bg-yellow-100'
            }`}>
              {totalPreguntasIndicadores === matriz.total_preguntas ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              ) : (
                <Clock size={16} className="text-yellow-600" />
              )}
            </div>
            <div>
              <p className={`font-semibold ${
                totalPreguntasIndicadores === matriz.total_preguntas
                  ? 'text-green-800'
                  : 'text-yellow-800'
              }`}>
                {totalPreguntasIndicadores === matriz.total_preguntas
                  ? 'Matriz válida'
                  : 'Matriz incompleta'
                }
              </p>
              <p className={`text-sm ${
                totalPreguntasIndicadores === matriz.total_preguntas
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}>
                Preguntas de indicadores: {totalPreguntasIndicadores} / {matriz.total_preguntas}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OAs Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Objetivos de Aprendizaje</h2>
        
        {matriz.oas.map((matrizOA) => (
          <div key={matrizOA.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {matrizOA.oa?.oas_id || `OA ${matrizOA.oaId}`}
                    </span>
                    {matrizOA.oa?.nivel && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        {matrizOA.oa.nivel.nombre}
                      </span>
                    )}
                    {matrizOA.oa?.asignatura && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <List size={20} className="text-indigo-600" />
                Indicadores ({matrizOA.indicadores.length})
              </h3>
              
              {matrizOA.indicadores.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No hay indicadores definidos</p>
              ) : (
                <div className="space-y-3">
                  {matrizOA.indicadores.map((indicador) => (
                    <div key={indicador.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{indicador.descripcion}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="text-indigo-600" />
                        <span className="font-semibold text-indigo-700">
                          {indicador.preguntas} preguntas
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
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