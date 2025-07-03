'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Trash2, Edit, Eye } from 'lucide-react';
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

export default function MatricesPage() {
  const router = useRouter();
  const [matrices, setMatrices] = useState<MatrizEspecificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  useEffect(() => {
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    try {
      const response = await fetch('/api/matrices');
      if (response.ok) {
        const data = await response.json();
        setMatrices(data);
      }
    } catch {
      console.error('Error al obtener matrices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatriz = () => {
    router.push('/matrices/crear');
  };

  const handleEditMatriz = (id: number) => {
    router.push(`/matrices/${id}/editar`);
  };

  const handleViewMatriz = (id: number) => {
    router.push(`/matrices/${id}`);
  };

  const handleDeleteMatriz = async (id: number) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteMatriz = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    setShowDeleteModal(false);
    try {
      const response = await fetch(`/api/matrices/${pendingDeleteId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMatrices(prev => prev.filter(matriz => matriz.id !== pendingDeleteId));
        setAlert({ type: 'success', message: 'Matriz eliminada correctamente.' });
      } else {
        setAlert({ type: 'error', message: 'Error al eliminar la matriz.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al eliminar la matriz.' });
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fd] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando matrices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fd] flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto mt-6 mb-6 rounded-3xl bg-white/80 shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200 sticky top-0 z-10 bg-white/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700 mb-1">
                Matrices de Especificación
              </h1>
              <p className="text-gray-500 text-base">
                Gestiona las matrices de especificación para evaluaciones
              </p>
            </div>
            <PrimaryButton onClick={handleCreateMatriz} className="flex items-center gap-2">
              <Plus size={20} />
              Nueva Matriz
            </PrimaryButton>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {matrices.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No hay matrices creadas
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primera matriz de especificación para comenzar
              </p>
              <PrimaryButton onClick={handleCreateMatriz}>
                Crear Matriz
              </PrimaryButton>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-100 via-indigo-50 to-purple-100 rounded-t-2xl shadow-md sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-5 text-left text-base font-bold text-indigo-700 border-b border-indigo-100">Nombre</th>
                      <th className="px-6 py-5 text-center text-base font-bold text-indigo-700 border-b border-indigo-100">Preguntas</th>
                      <th className="px-6 py-5 text-center text-base font-bold text-indigo-700 border-b border-indigo-100">OAs</th>
                      <th className="px-6 py-5 text-center text-base font-bold text-indigo-700 border-b border-indigo-100">Creada</th>
                      <th className="px-6 py-5 text-center text-base font-bold text-indigo-700 border-b border-indigo-100 w-32">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {matrices.map((matriz) => (
                      <tr key={matriz.id} className="hover:bg-indigo-50/40 transition-colors group">
                        <td className="px-6 py-4 text-left align-middle">
                          <div className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                            {matriz.nombre}
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500 font-semibold">ID: {matriz.id}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {matriz.oas.map(oa => oa.oa?.oas_id).filter(Boolean).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                            {matriz.total_preguntas} preguntas
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                            {matriz.oas?.length || 0} OAs
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className="text-sm text-gray-600">
                            {formatDate(matriz.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewMatriz(matriz.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 hover:border hover:border-gray-300 border border-transparent"
                              title="Ver matriz"
                              style={{ aspectRatio: '1 / 1' }}
                            >
                              <Eye size={20} className="text-gray-700" />
                            </button>
                            <button
                              onClick={() => handleEditMatriz(matriz.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 hover:border hover:border-gray-300 border border-transparent"
                              title="Editar matriz"
                              style={{ aspectRatio: '1 / 1' }}
                            >
                              <Edit size={20} className="text-gray-700" />
                            </button>
                            <button
                              onClick={() => handleDeleteMatriz(matriz.id)}
                              disabled={deletingId === matriz.id}
                              className={`h-10 w-10 flex items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:border hover:border-red-300 border border-transparent ${deletingId === matriz.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Eliminar matriz"
                              style={{ aspectRatio: '1 / 1' }}
                            >
                              <Trash2 size={20} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
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
              <PrimaryButton onClick={confirmDeleteMatriz} disabled={deletingId !== null}>Eliminar</PrimaryButton>
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
    </div>
  );
}