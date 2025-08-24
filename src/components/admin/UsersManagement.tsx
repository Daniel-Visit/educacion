'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  UserPlus,
  Search,
  Users,
  Clock,
  Activity,
  Settings,
  Trash2,
  GitCompare,
  ChevronLeft,
  ChevronRight,
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
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const { users, isLoading, refetch, totalPages, hasNextPage, hasPrevPage } =
    useUsers(currentPage, 10);

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

  // Funciones para selección múltiple
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleDeleteMultiple = () => {
    if (selectedUsers.size === 0) return;

    // Abrir modal de confirmación para eliminación múltiple
    setIsDeleteModalOpen(true);
    setSelectedUser(null); // Indicar que es eliminación múltiple
  };

  const handleDeleteMultipleSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedUsers(new Set()); // Limpiar selección
    refetch();
    setAlert({
      type: 'success',
      message: `${selectedUsers.size} usuarios han sido eliminados correctamente`,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedUsers(new Set()); // Limpiar selección al cambiar página
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

          <div className="flex gap-2 items-center min-h-[52px]">
            {selectedUsers.size > 0 && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {selectedUsers.size} seleccionados
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleDeleteMultiple}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-100 bg-red-500/20 hover:bg-red-500/30 rounded-md border border-red-400/30 hover:border-red-400/50 transition-all duration-200"
                    title="Eliminar seleccionados"
                  >
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                  </button>
                  <button
                    onClick={() => setSelectedUsers(new Set())}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-200 bg-white/10 hover:bg-white/20 rounded-md border border-white/20 hover:border-white/30 transition-all duration-200"
                    title="Cancelar selección"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 shadow-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar Usuarios
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios con estilo mejorado */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <table className="w-full">
          <colgroup>
            <col className="w-12" />
            <col className="w-auto" />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-32" />
            <col className="w-28" />
          </colgroup>
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-4 text-center">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <Checkbox
                      checked={
                        selectedUsers.size === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    {selectedUsers.size > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">
                          {selectedUsers.size}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  Usuario
                </div>
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <GitCompare className="h-4 w-4 text-indigo-600" />
                  Rol
                </div>
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  Estado
                </div>
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  Último acceso
                </div>
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <tr
                key={user.id}
                className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
              >
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-2 max-w-full">
                    <div className="flex-shrink-0">
                      <Avatar user={user} size="sm" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div
                        className="font-semibold text-gray-900 text-sm truncate max-w-full"
                        title={user.name || 'Sin nombre'}
                      >
                        {user.name || 'Sin nombre'}
                      </div>
                      <div
                        className="text-xs text-gray-500 truncate max-w-full"
                        title={user.email || ''}
                      >
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
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
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {getStatusBadge(user)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-500">
                  <div className="truncate">{getLastActive(user)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
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

      {/* Paginación */}
      {totalPages > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    if (hasPrevPage) handlePageChange(currentPage - 1);
                  }}
                  className={
                    !hasPrevPage ? 'pointer-events-none opacity-50' : ''
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Anterior</span>
                </PaginationPrevious>
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    if (hasNextPage) handlePageChange(currentPage + 1);
                  }}
                  className={
                    !hasNextPage ? 'pointer-events-none opacity-50' : ''
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Siguiente</span>
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
        selectedUsers={selectedUsers}
        isMultipleDelete={selectedUsers.size > 0}
        onSuccess={
          selectedUsers.size > 0
            ? handleDeleteMultipleSuccess
            : handleDeleteSuccess
        }
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
