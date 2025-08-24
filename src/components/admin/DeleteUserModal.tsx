'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { Loader2, AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    image?: string | null;
  } | null;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
  onError,
}: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      onError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col">
          {/* Header con gradiente rojo */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Eliminar Usuario
                  </h2>
                  <p className="text-red-100 text-sm">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-white hover:bg-white/20 p-2"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-6 space-y-6">
            {/* Información del usuario */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Avatar user={user} size="md" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.name || 'Sin nombre'}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Advertencia */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Esta acción no se puede deshacer.</p>
                <p className="mt-1">
                  Se eliminará permanentemente el usuario{' '}
                  <strong>{user.name || user.email}</strong>.
                </p>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Usuario'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
