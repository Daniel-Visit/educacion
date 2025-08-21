'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Search,
  Users,
  Clock,
  Activity,
  Settings,
  Trash2,
  GitCompare,
} from 'lucide-react';
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import InviteUsersModal from './InviteUsersModal';
import ChangeRoleModal from './ChangeRoleModal';
import DeleteUserModal from './DeleteUserModal';
import { useUsers } from '@/hooks/use-users';
import LoadingState from '@/components/ui/LoadingState';
import { Avatar } from '@/components/ui/Avatar';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  role: string;
  password: string | null;
  forcePasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeen?: string; // Último acceso desde Redis
  accounts: Array<{
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
  }>;
  sessions: Array<{
    id: string;
    sessionToken: string;
    userId: string;
    expires: string;
  }>;
}

export default function UsersManagement() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const { users, isLoading, refetch } = useUsers();

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setIsChangeRoleModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    refetch();
    setAlert({
      type: 'success',
      message: 'El usuario ha sido eliminado correctamente',
    });
  };

  const handleDeleteError = (error: string) => {
    setIsDeleteModalOpen(false);
    setAlert({
      type: 'error',
      message: error,
    });
  };

  const handleInviteSuccess = () => {
    setIsInviteModalOpen(false);
    refetch();
    setAlert({
      type: 'success',
      message: 'Invitaciones enviadas correctamente',
    });
  };

  const filteredUsers =
    users.filter(
      (user: User) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getStatusBadge = (user: User) => {
    if (user.forcePasswordChange) {
      return (
        <Badge className="bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-100 hover:text-pink-800">
          Pendiente
        </Badge>
      );
    }
    if (user.password) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800">
          Activo
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800">
        Inactivo
      </Badge>
    );
  };

  const getLastActive = (user: User) => {
    // Usar lastSeen de Redis si está disponible
    if (user.lastSeen) {
      const formatted = new Date(user.lastSeen).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      // Limpiar el formato para que quede: "19 de agosto de 2025, 18:54"
      return formatted.replace(
        /(\d+) de (\w+) de (\d+), (\d+):(\d+)/,
        '$1 de $2 de $3, $4:$5'
      );
    }

    // Fallback a sessions de PostgreSQL si no hay datos de Redis
    if (user.sessions?.length > 0) {
      const lastSession = user.sessions[0];
      const formatted = new Date(lastSession.expires).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      // Limpiar el formato para que quede: "19 de agosto de 2025, 18:54"
      return formatted.replace(
        /(\d+) de (\w+) de (\d+), (\d+):(\d+)/,
        '$1 de $2 de $3, $4:$5'
      );
    }

    return 'Nunca';
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header con estilo de la plataforma */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Administración de Usuarios
              </h1>
              <p className="text-indigo-100 text-sm">
                Gestiona usuarios, roles y permisos de la plataforma
              </p>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-200 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/90 border-white/50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-white focus:text-gray-900 shadow-lg"
            />
          </div>

          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 shadow-lg"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Usuarios
          </Button>
        </div>
      </div>

      {/* Tabla de usuarios con estilo mejorado */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  Usuario
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-indigo-600" />
                  Rol
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  Estado
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  Último acceso
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <tr
                key={user.id}
                className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Avatar user={user} size="sm" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {user.name || 'Sin nombre'}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Badge
                    variant="outline"
                    className={`${
                      user.role === 'admin'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : user.role === 'profesor'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {getLastActive(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleChangeRole(user)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                      title="Cambiar rol"
                    >
                      <GitCompare size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <InviteUsersModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />

      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        user={selectedUser}
        onSuccess={() => {
          setIsChangeRoleModalOpen(false);
          refetch();
        }}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={selectedUser}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
      />

      {/* Alertas inline */}
      {alert && (
        <div
          className={`rounded-md p-3 ${
            alert.type === 'error'
              ? 'bg-red-50 dark:bg-red-500/15 dark:outline dark:outline-red-500/25'
              : 'bg-green-50 dark:bg-green-500/10 dark:outline dark:outline-green-500/20'
          }`}
        >
          <div className="flex items-center">
            <div className="shrink-0">
              {alert.type === 'error' ? (
                <XCircleIcon
                  aria-hidden="true"
                  className="size-5 text-red-400"
                />
              ) : (
                <CheckCircleIcon
                  aria-hidden="true"
                  className="size-5 text-green-400"
                />
              )}
            </div>
            <div className="ml-3 flex-1">
              <span
                className={`text-sm ${
                  alert.type === 'error'
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-green-800 dark:text-green-300'
                }`}
              >
                {alert.message}
              </span>
            </div>
            <div className="ml-auto">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setAlert(null)}
                  className={`inline-flex rounded-md p-1.5 hover:bg-opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden ${
                    alert.type === 'error'
                      ? 'bg-red-50 text-red-500 hover:bg-red-100 focus-visible:ring-red-600 focus-visible:ring-offset-red-50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10 dark:focus-visible:ring-red-500 dark:focus-visible:ring-offset-1 dark:focus-visible:ring-offset-red-900'
                      : 'bg-green-50 text-green-500 hover:bg-green-100 focus-visible:ring-green-600 focus-visible:ring-offset-green-50 dark:bg-transparent dark:text-green-400 dark:hover:bg-green-500/10 dark:focus-visible:ring-green-500 dark:focus-visible:ring-offset-1 dark:focus-visible:ring-offset-green-900'
                  }`}
                >
                  <span className="sr-only">Cerrar</span>
                  <XMarkIcon aria-hidden="true" className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
