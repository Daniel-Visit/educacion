'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Plus, FileText } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';

interface Evaluacion {
  id: number;
  titulo: string;
  matrizNombre?: string;
  preguntasCount?: number;
  createdAt?: string;
}

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/evaluaciones')
      .then(res => res.json())
      .then(data => {
        setEvaluaciones(data);
        setLoading(false);
      })
      .catch(() => {
        setAlert({ type: 'error', message: 'Error al cargar las evaluaciones' });
        setLoading(false);
      });
  }, []);

  const handleEliminar = async (id: number) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvaluacion = async () => {
    if (!pendingDeleteId) return;
    setEliminandoId(pendingDeleteId);
    setShowDeleteModal(false);
    try {
      const res = await fetch(`/api/evaluaciones/${pendingDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setEvaluaciones(prev => prev.filter(e => e.id !== pendingDeleteId));
        setAlert({ type: 'success', message: 'Evaluación eliminada correctamente.' });
      } else {
        setAlert({ type: 'error', message: 'Error al eliminar la evaluación.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Error al eliminar la evaluación.' });
    } finally {
      setEliminandoId(null);
      setPendingDeleteId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700 mb-1">
            Evaluaciones
          </h1>
          <p className="text-gray-500 text-base">
            Gestiona las evaluaciones creadas en la plataforma
          </p>
        </div>
        <Link href="/evaluaciones/crear">
          <PrimaryButton className="flex items-center gap-2">
            <Plus size={20} />
            Nueva Evaluación
          </PrimaryButton>
        </Link>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando evaluaciones...</p>
          </div>
        ) : evaluaciones.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No hay evaluaciones creadas
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera evaluación para comenzar
            </p>
            <Link href="/evaluaciones/crear">
              <PrimaryButton>
                Crear Evaluación
              </PrimaryButton>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden mt-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-100 via-indigo-50 to-purple-100 rounded-t-2xl shadow-md sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-indigo-700 border-b border-indigo-100">Título</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-indigo-700 border-b border-indigo-100">Matriz</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-indigo-700 border-b border-indigo-100">Preguntas</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-indigo-700 border-b border-indigo-100">Creada</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-indigo-700 border-b border-indigo-100 w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {evaluaciones.map((ev) => (
                    <tr key={ev.id} className="hover:bg-indigo-50/40 transition-colors group">
                      <td className="px-6 py-3 text-left align-middle">
                        <div className="font-bold text-base text-gray-900 mb-1">
                          {ev.titulo}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ev.matrizNombre || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center align-middle">
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs">
                          {ev.matrizNombre || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center align-middle">
                        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                          {typeof ev.preguntasCount === 'number' ? `${ev.preguntasCount} preguntas` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center align-middle">
                        <span className="text-xs text-gray-600">
                          {formatDate(ev.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/evaluaciones/${ev.id}/editar`)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 hover:border hover:border-gray-300 border border-transparent"
                            title="Editar evaluación"
                            style={{ aspectRatio: '1 / 1' }}
                          >
                            <Edit size={16} className="text-gray-700" />
                          </button>
                          <button
                            onClick={() => handleEliminar(ev.id)}
                            disabled={eliminandoId === ev.id}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:border hover:border-red-300 border border-transparent ${eliminandoId === ev.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Eliminar evaluación"
                            style={{ aspectRatio: '1 / 1' }}
                          >
                            <Trash2 size={16} className="text-red-600" />
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

      {/* Modales de confirmación y alerta */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
            <Dialog.Title className="text-lg font-bold mb-4">¿Eliminar evaluación?</Dialog.Title>
            <Dialog.Description className="mb-6 text-gray-600">Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta evaluación?</Dialog.Description>
            <div className="flex gap-4 justify-end">
              <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={confirmDeleteEvaluacion} disabled={eliminandoId !== null}>Eliminar</PrimaryButton>
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