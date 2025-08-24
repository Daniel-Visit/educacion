'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus, X } from 'lucide-react';
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import EmailInputWithBadges from './EmailInputWithBadges';

interface InviteUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Role {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

interface ExistingUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function InviteUsersModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteUsersModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [alert, setAlert] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  // Cargar roles al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);

        if (data.roles.length > 0) {
          setSelectedRoleId(data.roles[0].id);
        }
      } else {
        console.error('Error cargando roles:', response.status);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que haya emails
    if (emails.length === 0) {
      setAlert({
        type: 'error',
        message: 'Por favor ingresa al menos un email',
      });
      return;
    }

    // Validar que los emails no estén vacíos
    const validEmails = emails.filter(email => email.trim() !== '');
    if (validEmails.length === 0) {
      setAlert({
        type: 'error',
        message: 'Por favor ingresa emails válidos',
      });
      return;
    }

    // Verificar emails duplicados
    const uniqueEmails = [...new Set(validEmails)];
    if (uniqueEmails.length !== validEmails.length) {
      setAlert({
        type: 'error',
        message:
          'Hay emails duplicados. Por favor elimina los duplicados antes de continuar.',
      });
      return;
    }

    // Verificar usuarios existentes antes de enviar
    try {
      const checkResponse = await fetch('/api/admin/users/check-existing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: validEmails,
        }),
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        const existingUsers = checkData.existingUsers || [];

        if (existingUsers.length > 0) {
          const existingEmails = existingUsers
            .map((user: ExistingUser) => user.email)
            .join(', ');
          setAlert({
            type: 'error',
            message: `Los siguientes usuarios ya existen en la plataforma: ${existingEmails}.`,
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error verificando usuarios existentes:', error);
      // Si falla la verificación, continuar con el proceso normal
    }

    // Validar que haya un rol seleccionado
    if (!selectedRoleId || selectedRoleId.trim() === '') {
      setAlert({
        type: 'error',
        message: 'Por favor selecciona un rol',
      });
      return;
    }

    // Validar que se hayan cargado los roles
    if (roles.length === 0) {
      setAlert({
        type: 'error',
        message:
          'No se pudieron cargar los roles. Por favor recarga la página.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emails,
          roleId: selectedRoleId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Invitaciones enviadas:', data);

        // Mostrar alerta de éxito
        setAlert({
          type: 'success',
          message: `Se procesaron ${data.invitedCount || emails.length} invitaciones exitosamente`,
        });

        // Cerrar el modal y notificar éxito
        onSuccess();
        setEmails([]);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar invitaciones');
      }
    } catch (error) {
      console.error('Error al enviar invitaciones:', error);

      // Mostrar alerta de error
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });

      // El error se manejará en el componente padre
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmails([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Invitar Usuarios
                  </h2>
                  <p className="text-indigo-100 text-sm">
                    Envía invitaciones a nuevos usuarios
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Alertas */}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="emails"
                  className="text-sm font-semibold text-gray-700"
                >
                  Emails
                </Label>
                <EmailInputWithBadges
                  value={emails}
                  onChange={setEmails}
                  placeholder="Ingresa emails separados por coma..."
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="role"
                  className="text-sm font-semibold text-gray-700"
                >
                  Rol
                </Label>
                <Select
                  value={selectedRoleId}
                  onValueChange={setSelectedRoleId}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Footer con botones */}
              <div className="flex justify-end gap-3 pt-6">
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
                      Enviando...
                    </>
                  ) : (
                    'Enviar Invitaciones'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
