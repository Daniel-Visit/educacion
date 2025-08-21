import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
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

interface UserActivity {
  userId: string;
  lastSeen: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener usuarios
      const usersResponse = await fetch('/api/admin/users');
      if (!usersResponse.ok) {
        throw new Error('Error al obtener usuarios');
      }

      const usersData = await usersResponse.json();

      // Obtener actividad desde Redis
      const activityResponse = await fetch('/api/admin/users/activity');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();

        // Combinar usuarios con su actividad
        const usersWithActivity = usersData.users.map((user: User) => {
          const userActivity = activityData.userActivity.find(
            (activity: UserActivity) => activity.userId === user.id
          );
          return {
            ...user,
            lastSeen: userActivity?.lastSeen || null,
          };
        });

        setUsers(usersWithActivity);
      } else {
        // Si no se puede obtener actividad, usar solo usuarios
        setUsers(usersData.users);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refetch = () => {
    fetchUsers();
  };

  return {
    users,
    isLoading,
    error,
    refetch,
  };
}
