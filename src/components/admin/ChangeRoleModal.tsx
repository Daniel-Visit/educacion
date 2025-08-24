'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToastContext } from '@/components/providers/ToastProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Loader2, Shield, User, GraduationCap, X } from 'lucide-react';

interface ChangeRoleModalProps {
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
}

interface Role {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  profesor: GraduationCap,
  user: User,
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  profesor: 'bg-blue-100 text-blue-800 border-blue-200',
  user: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ChangeRoleModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: ChangeRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const { toast } = useToastContext();

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && roles.length > 0) {
      // Encontrar el rol actual del usuario
      const currentRole = roles.find(role => role.slug === user.role);
      if (currentRole) {
        setSelectedRoleId(currentRole.id);
      }
    }
  }, [user, roles]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoleId) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un rol',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user?.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: selectedRoleId,
        }),
      });

      if (response.ok) {
        toast({
          title: '¡Éxito!',
          description: 'Rol actualizado correctamente',
        });
        onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el rol');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
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

  const CurrentRoleIcon = roleIcons[user.role] || User;
  const currentRoleColor = roleColors[user.role] || roleColors.user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cambiar Rol</h2>
                <p className="text-indigo-100 text-sm">
                  Modifica el rol del usuario seleccionado
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

            {/* Rol actual */}
            <div className="mt-3 flex items-center gap-2">
              <CurrentRoleIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Rol actual:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${currentRoleColor}`}
              >
                {user.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Selecciona un nuevo rol
              </label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Selecciona un nuevo rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => {
                    const RoleIcon = roleIcons[role.slug] || User;
                    return (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-4 w-4" />
                          {role.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Rol'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
