import { redis } from './redis';

// ===== TIPOS Y INTERFACES =====

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  provider: string;
  createdAt: number;
  lastSeen: number;
}

export interface SessionInfo {
  jti: string;
  userId: string;
  userAgent?: string;
  ip?: string;
  createdAt: number;
  lastSeen: number;
}

export interface UserSessionInfo {
  jti: string;
  userId: string;
  provider: string;
  createdAt: number;
  lastSeen: number;
  ip?: string;
  userAgent?: string;
}

// ===== FUNCIONES PRINCIPALES DE SESIONES =====

/**
 * Guarda una nueva sesión en Redis
 */
export async function saveSession(
  jti: string,
  sessionData: SessionData
): Promise<void> {
  try {
    // Guardar datos de la sesión
    await redis.hset(`sess:${jti}`, {
      userId: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role,
      provider: sessionData.provider,
      createdAt: sessionData.createdAt.toString(),
      lastSeen: sessionData.lastSeen.toString(),
    });

    // Agregar jti a la lista de sesiones del usuario
    await redis.sadd(`user:${sessionData.userId}:sessions`, jti);

    // Establecer TTL para la sesión (7 días como especifica Auth.txt)
    await redis.expire(`sess:${jti}`, 7 * 24 * 60 * 60);
    await redis.expire(`user:${sessionData.userId}:sessions`, 7 * 24 * 60 * 60);

    console.log('✅ Sesión guardada en Redis:', jti);
  } catch (error) {
    console.error('❌ Error guardando sesión en Redis:', error);
    throw error;
  }
}

/**
 * Obtiene los datos de una sesión específica
 */
export async function getSession(jti: string): Promise<SessionData | null> {
  try {
    const sessionData = await redis.hgetall(`sess:${jti}`);

    if (!sessionData || Object.keys(sessionData).length === 0) {
      return null;
    }

    return {
      userId: String(sessionData.userId),
      email: String(sessionData.email),
      role: String(sessionData.role),
      provider: String(sessionData.provider),
      createdAt: Number(sessionData.createdAt),
      lastSeen: Number(sessionData.lastSeen),
    };
  } catch (error) {
    console.error('❌ Error obteniendo sesión de Redis:', error);
    return null;
  }
}

/**
 * Actualiza la última actividad de una sesión
 */
export async function updateSessionActivity(jti: string): Promise<void> {
  try {
    const timestamp = Date.now().toString();
    await redis.hset(`sess:${jti}`, { lastSeen: timestamp });
    console.log(`✅ Actividad de sesión actualizada: ${timestamp}`);
  } catch (error) {
    console.error('❌ Error actualizando actividad de sesión:', error);
  }
}

// ===== SISTEMA DE REVOCACIÓN DE TOKENS =====

/**
 * Revoca un token específico (lo agrega a la denylist)
 */
export async function revokeToken(
  jti: string,
  ttlSeconds: number = 7 * 24 * 60 * 60
): Promise<void> {
  try {
    // Agregar a la denylist con TTL
    await redis.setex(`revoked:${jti}`, ttlSeconds, '1');
    console.log('✅ Token revocado:', jti);
  } catch (error) {
    console.error('❌ Error revocando token:', error);
    throw error;
  }
}

/**
 * Verifica si un token está revocado
 */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  try {
    const revoked = await redis.get(`revoked:${jti}`);
    // Upstash Redis puede devolver '1' como string o 1 como number
    return revoked === '1' || revoked === 1;
  } catch (error) {
    console.error('❌ Error verificando revocación de token:', error);
    return false;
  }
}

// ===== GESTIÓN DE SESIONES DE USUARIO =====

/**
 * Obtiene todas las sesiones activas de un usuario
 */
export async function getUserSessions(
  userId: string
): Promise<UserSessionInfo[]> {
  try {
    const sessionJtis = await redis.smembers(`user:${userId}:sessions`);
    const sessions: UserSessionInfo[] = [];

    for (const jti of sessionJtis) {
      const sessionData = await redis.hgetall(`sess:${jti}`);
      if (sessionData && sessionData.userId) {
        sessions.push({
          jti,
          userId: String(sessionData.userId),
          provider: String(sessionData.provider || 'unknown'),
          createdAt: Number(sessionData.createdAt),
          lastSeen: Number(sessionData.lastSeen),
          ip: sessionData.ip ? String(sessionData.ip) : undefined,
          userAgent: sessionData.userAgent
            ? String(sessionData.userAgent)
            : undefined,
        });
      }
    }

    // Ordenar por última actividad (más reciente primero)
    return sessions.sort((a, b) => b.lastSeen - a.lastSeen);
  } catch (error) {
    console.error('❌ Error obteniendo sesiones del usuario:', error);
    return [];
  }
}

/**
 * Cierra una sesión específica del usuario
 */
export async function closeUserSession(
  userId: string,
  jti: string
): Promise<void> {
  try {
    // Revocar el token
    await revokeToken(jti);

    // Remover de la lista de sesiones del usuario
    await redis.srem(`user:${userId}:sessions`, jti);

    // Eliminar datos de la sesión
    await redis.del(`sess:${jti}`);

    console.log('✅ Sesión cerrada:', jti);
  } catch (error) {
    console.error('❌ Error cerrando sesión:', error);
    throw error;
  }
}

/**
 * Cierra todas las sesiones de un usuario (útil para logout global)
 */
export async function closeAllUserSessions(userId: string): Promise<void> {
  try {
    const sessions = await getUserSessions(userId);

    for (const session of sessions) {
      await closeUserSession(userId, session.jti);
    }

    console.log('✅ Todas las sesiones del usuario cerradas');
  } catch (error) {
    console.error('❌ Error cerrando todas las sesiones:', error);
    throw error;
  }
}

// ===== SISTEMA DE VERSIONADO DE USUARIOS =====

/**
 * Obtiene la versión actual de un usuario
 * Si no existe, la crea con valor 1
 */
export async function getUserVersion(userId: string): Promise<number> {
  try {
    const version = await redis.get(`user:${userId}:ver`);

    if (version !== null) {
      // La clave existe, retornar el valor
      return Number(version);
    } else {
      // La clave no existe, crearla con valor 1
      await redis.set(`user:${userId}:ver`, '1');
      await redis.expire(`user:${userId}:ver`, 7 * 24 * 60 * 60); // TTL de 7 días
      console.log('✅ Clave de versión creada para usuario:', userId);
      return 1;
    }
  } catch (error) {
    console.error('❌ Error obteniendo versión del usuario:', error);
    return 1;
  }
}

/**
 * Incrementa la versión de un usuario (invalida todos los tokens previos)
 */
export async function incrementUserVersion(userId: string): Promise<number> {
  try {
    const newVersion = await redis.incr(`user:${userId}:ver`);
    console.log('✅ Versión del usuario incrementada:', newVersion);
    return newVersion;
  } catch (error) {
    console.error('❌ Error incrementando versión del usuario:', error);
    throw error;
  }
}

/**
 * Verifica si la versión del token es válida
 */
export async function isTokenVersionValid(
  userId: string,
  tokenVersion: number
): Promise<boolean> {
  try {
    const currentVersion = await getUserVersion(userId);
    return tokenVersion >= currentVersion;
  } catch (error) {
    console.error('❌ Error verificando versión del token:', error);
    return false;
  }
}

// ===== SISTEMA DE TRACKING DE SESIONES ACTIVAS =====

/**
 * Guarda información detallada de una sesión
 */
export async function saveSessionInfo(sessionInfo: SessionInfo): Promise<void> {
  try {
    const { jti, userId } = sessionInfo;

    // Guardar información detallada de la sesión
    await redis.hset(`sess:${jti}`, {
      userId: sessionInfo.userId,
      userAgent: sessionInfo.userAgent || '',
      ip: sessionInfo.ip || '',
      createdAt: sessionInfo.createdAt.toString(),
      lastSeen: sessionInfo.lastSeen.toString(),
    });

    // Agregar a la lista de sesiones del usuario
    await redis.sadd(`user:${userId}:sessions`, jti);

    // Establecer TTL para la sesión (7 días)
    await redis.expire(`sess:${jti}`, 7 * 24 * 60 * 60);
    await redis.expire(`user:${userId}:sessions`, 7 * 24 * 60 * 60);

    console.log('✅ Información de sesión guardada:', jti);
  } catch (error) {
    console.error('❌ Error guardando información de sesión:', error);
  }
}

/**
 * Obtiene sesiones activas de un usuario con información detallada
 */
export async function getUserActiveSessions(
  userId: string
): Promise<SessionInfo[]> {
  try {
    const sessionJtis = await redis.smembers(`user:${userId}:sessions`);
    const sessions: SessionInfo[] = [];

    for (const jti of sessionJtis) {
      const sessionData = await redis.hgetall(`sess:${jti}`);
      if (sessionData && sessionData.userId) {
        sessions.push({
          jti,
          userId: String(sessionData.userId),
          userAgent: sessionData.userAgent
            ? String(sessionData.userAgent)
            : undefined,
          ip: sessionData.ip ? String(sessionData.ip) : undefined,
          createdAt: Number(sessionData.createdAt),
          lastSeen: Number(sessionData.lastSeen),
        });
      }
    }

    // Ordenar por última actividad (más reciente primero)
    return sessions.sort((a, b) => b.lastSeen - a.lastSeen);
  } catch (error) {
    console.error('❌ Error obteniendo sesiones activas:', error);
    return [];
  }
}

// ===== FUNCIONES DE LIMPIEZA Y MANTENIMIENTO =====

/**
 * Limpia sesiones expiradas y datos obsoletos
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    console.log('🧹 Iniciando limpieza de sesiones expiradas...');
    let cleanedCount = 0;

    // Limpiar sesiones sin TTL o expiradas
    const sessionKeys = await redis.keys('sess:*');
    for (const sessionKey of sessionKeys) {
      try {
        // Verificar si la sesión existe y tiene TTL
        const ttl = await redis.ttl(sessionKey);

        if (ttl === -1) {
          // Sesión sin TTL, eliminarla
          await redis.del(sessionKey);
          cleanedCount++;
          console.log(`🧹 Sesión sin TTL eliminada: ${sessionKey}`);
        } else if (ttl === -2) {
          // Sesión expirada, eliminarla
          await redis.del(sessionKey);
          cleanedCount++;
          console.log(`🧹 Sesión expirada eliminada: ${sessionKey}`);
        }
      } catch (error) {
        console.error(`❌ Error procesando sesión ${sessionKey}:`, error);
      }
    }

    // Limpiar también las listas de usuario que puedan estar vacías
    const userKeys = await redis.keys('user:*:sessions');
    for (const userKey of userKeys) {
      try {
        const sessionCount = await redis.scard(userKey);
        if (sessionCount === 0) {
          await redis.del(userKey);
          console.log(`🧹 Lista de sesiones vacía eliminada: ${userKey}`);
        }
      } catch (error) {
        console.error(
          `❌ Error procesando lista de usuario ${userKey}:`,
          error
        );
      }
    }

    console.log(`✅ Limpieza completada. ${cleanedCount} sesiones eliminadas`);
    return cleanedCount;
  } catch (error) {
    console.error('❌ Error en limpieza de sesiones:', error);
    return 0;
  }
}

/**
 * Obtiene estadísticas de sesiones (útil para monitoreo)
 */
export async function getSessionStats(): Promise<{
  totalSessions: number;
  totalUsers: number;
  totalRevoked: number;
  activeSessions: number;
}> {
  try {
    console.log('📊 Obteniendo estadísticas de sesiones...');

    const sessionKeys = await redis.keys('sess:*');
    const totalSessions = sessionKeys.length;

    const userKeys = await redis.keys('user:*:sessions');
    const totalUsers = userKeys.length;

    const revokedKeys = await redis.keys('revoked:*');
    const totalRevoked = revokedKeys.length;

    // Contar sesiones activas (no revocadas)
    let activeSessions = 0;
    for (const jti of sessionKeys) {
      const jtiId = jti.replace('sess:', '');
      const isRevoked = await redis.get(`revoked:${jtiId}`);
      if (!isRevoked) {
        activeSessions++;
      }
    }

    console.log(
      `📊 Estadísticas: ${totalSessions} sesiones, ${totalUsers} usuarios, ${totalRevoked} revocados, ${activeSessions} activas`
    );

    return { totalSessions, totalUsers, totalRevoked, activeSessions };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return {
      totalSessions: 0,
      totalUsers: 0,
      totalRevoked: 0,
      activeSessions: 0,
    };
  }
}

/**
 * Obtiene la actividad de todos los usuarios activos
 */
export async function getAllUsersActivity(): Promise<
  Array<{
    userId: string;
    lastSeen: number;
    activeSessions: number;
    lastSessionInfo?: SessionInfo;
  }>
> {
  try {
    const userKeys = await redis.keys('user:*:sessions');
    const userActivity: Array<{
      userId: string;
      lastSeen: number;
      activeSessions: number;
      lastSessionInfo?: SessionInfo;
    }> = [];

    for (const userKey of userKeys) {
      const userId = userKey.replace('user:', '').replace(':sessions', '');
      const sessions = await redis.smembers(userKey);

      if (sessions.length > 0) {
        let latestLastSeen = 0;
        let lastSessionInfo: SessionInfo | undefined;

        for (const jti of sessions) {
          const sessionData = await redis.hgetall(`sess:${jti}`);
          if (sessionData && sessionData.lastSeen) {
            const currentLastSeen = Number(sessionData.lastSeen);
            if (currentLastSeen > latestLastSeen) {
              latestLastSeen = currentLastSeen;
              lastSessionInfo = {
                jti,
                userId: String(sessionData.userId),
                userAgent: sessionData.userAgent
                  ? String(sessionData.userAgent)
                  : undefined,
                ip: sessionData.ip ? String(sessionData.ip) : undefined,
                createdAt: Number(sessionData.createdAt),
                lastSeen: currentLastSeen,
              };
            }
          }
        }

        if (latestLastSeen > 0) {
          userActivity.push({
            userId,
            lastSeen: latestLastSeen,
            activeSessions: sessions.length,
            lastSessionInfo,
          });
        }
      }
    }

    // Ordenar por última actividad (más reciente primero)
    return userActivity.sort((a, b) => b.lastSeen - a.lastSeen);
  } catch (error) {
    console.error('❌ Error obteniendo actividad de usuarios:', error);
    return [];
  }
}

// ===== SISTEMA DE LÍMITES DE SESIONES =====

/**
 * Verifica si un usuario puede crear una nueva sesión
 */
export async function checkSessionLimit(
  userId: string,
  maxSessions: number = 5
): Promise<{
  canCreate: boolean;
  currentSessions: number;
  oldestSession?: string;
}> {
  try {
    const currentSessions = await redis.scard(`user:${userId}:sessions`);

    if (currentSessions < maxSessions) {
      return { canCreate: true, currentSessions };
    }

    // Si excede el límite, obtener la sesión más antigua
    const sessions = await getUserActiveSessions(userId);
    const oldestSession = sessions[sessions.length - 1]; // Ya está ordenado por lastSeen

    return {
      canCreate: false,
      currentSessions,
      oldestSession: oldestSession?.jti,
    };
  } catch (error) {
    console.error('❌ Error verificando límite de sesiones:', error);
    return { canCreate: true, currentSessions: 0 };
  }
}

/**
 * Aplica el límite de sesiones, cerrando la más antigua si es necesario
 */
export async function enforceSessionLimit(
  userId: string,
  maxSessions: number = 5
): Promise<void> {
  try {
    const { canCreate, oldestSession } = await checkSessionLimit(
      userId,
      maxSessions
    );

    if (!canCreate && oldestSession) {
      console.log(
        `🔄 Usuario ${userId} excede límite de sesiones, cerrando la más antigua`
      );
      await closeUserSession(userId, oldestSession);
    }
  } catch (error) {
    console.error('❌ Error aplicando límite de sesiones:', error);
  }
}
