# IMPLEMENTACIÓN DE TRACKING DE SESIONES EN AUTH.JS

## RESUMEN EJECUTIVO

Este documento detalla la implementación completa del tracking de sesiones de usuario en Auth.js para la plataforma educativa. El objetivo es registrar **TODAS** las conexiones de usuario, no solo la última, manteniendo un historial completo de actividad.

## ANÁLISIS DE LA SITUACIÓN ACTUAL

### Configuración Actual

- **Estrategia de sesión**: JWT (`session: { strategy: 'jwt' }`)
- **Adapter**: PrismaAdapter para PostgreSQL
- **Providers**: Google OAuth + Credentials
- **Tabla sessions**: Existe en Prisma pero está 100% vacía

### Problema Identificado

La tabla `sessions` no se está poblando automáticamente porque:

1. **JWT strategy** no usa la tabla `sessions` por defecto
2. **PrismaAdapter** se usa solo para `accounts` y `verificationToken`
3. **No hay lógica personalizada** para registrar logins

## DOCUMENTACIÓN REVISADA

### 1. Email Provider (Magic Links)

- **Fuente**: [https://authjs.dev/getting-started/authentication/email](https://authjs.dev/getting-started/authentication/email)
- **Hallazgo clave**: Magic Links funcionan con JWT Y database sessions
- **Base de datos es OBLIGATORIA** para verification tokens
- **Resend está soportado** como provider

### 2. Credentials Provider

- **Fuente**: [https://authjs.dev/getting-started/authentication/credentials](https://authjs.dev/getting-started/authentication/credentials)
- **Hallazgo clave**: Credentials NO persiste datos por defecto
- **Pero SÍ puedes crear/guardar datos** con tu propia lógica
- **El callback `authorize`** es donde implementas la lógica de BD

### 3. WebAuthn (Passkeys)

- **Fuente**: [https://authjs.dev/getting-started/authentication/webauthn](https://authjs.dev/getting-started/authentication/webauthn)
- **Hallazgo clave**: Es EXPERIMENTAL y no recomendado para producción
- **Requiere tabla adicional `Authenticator`**
- **No es lo que necesitamos** para tracking de logins

### 4. Prisma Adapter

- **Fuente**: [https://authjs.dev/getting-started/adapters/prisma](https://authjs.dev/getting-started/adapters/prisma)
- **Hallazgo clave**: El modelo `Session` SÍ existe en Prisma
- **Estructura correcta**: `id`, `sessionToken`, `userId`, `expires`
- **El problema NO es que falte el modelo**

### 5. Session Management

- **Fuente**: [https://authjs.dev/getting-started/session-management/login](https://authjs.dev/getting-started/session-management/login)
- **Hallazgo clave**: `signIn()` es solo una función que inicia el proceso
- **NO escribe automáticamente** en la tabla `sessions`
- **La lógica de BD debe implementarse** en los callbacks

### 6. Get Session

- **Fuente**: [https://authjs.dev/getting-started/session-management/get-session](https://authjs.dev/getting-started/session-management/get-session)
- **Hallazgo clave**: `auth()` obtiene sesión en tiempo real
- **NO hay persistencia automática** en BD
- **Se verifica en cada request**

### 7. Protecting Resources

- **Fuente**: [https://authjs.dev/getting-started/session-management/protecting](https://authjs.dev/getting-started/session-management/protecting)
- **Hallazgo clave**: `auth()` es la función principal para protección
- **Se verifica la sesión en cada request**
- **NO hay persistencia automática** en BD

### 8. Custom Pages

- **Fuente**: [https://authjs.dev/getting-started/session-management/custom-pages](https://authjs.dev/getting-started/session-management/custom-pages)
- **Hallazgo clave**: Las páginas personalizadas se configuran en `auth.ts`
- **Se debe tener la página física** en la ruta especificada
- **NO hay lógica automática** de BD

### 9. TypeScript

- **Fuente**: [https://authjs.dev/getting-started/typescript](https://authjs.dev/getting-started/typescript)
- **Hallazgo clave**: Se puede extender `Session` para propiedades personalizadas
- **Se implementa en el callback `session`** de `auth.ts`
- **Las propiedades personalizadas** están disponibles en toda la app

## SOLUCIONES POSIBLES

### Opción 1: Llenar la tabla `sessions` manualmente

**Ventajas:**

- Usa la estructura existente
- Compatible con PrismaAdapter
- Mantiene consistencia con NextAuth

**Desventajas:**

- Requiere lógica personalizada en callbacks
- Puede confundir con la funcionalidad de NextAuth
- Necesita manejo de expiración manual

### Opción 2: Crear nueva tabla `user_logins`

**Ventajas:**

- Más claro para tracking de logins
- Separado de la lógica de NextAuth
- Flexibilidad total en el diseño

**Desventajas:**

- Nueva tabla en el schema
- Requiere migración de BD
- Duplicación de funcionalidad

## IMPLEMENTACIÓN RECOMENDADA: Opción 1

### 1. Modificar el Schema de Prisma

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Campos adicionales para tracking
  loginAt      DateTime @default(now())  // Cuándo se logueó
  loginMethod  String   // "oauth" | "credentials"
  provider     String?  // "google" | null
  ipAddress    String?  // IP del usuario
  userAgent    String?  // User agent del navegador

  @@map("sessions")
}
```

### 2. Modificar el Callback `signIn` en `auth.config.ts`

```typescript
async signIn({ user, account, profile }) {
  // ... lógica existente ...

  try {
    // Verificar si el usuario existe en la base de datos
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      // REGISTRAR LOGIN EN LA TABLA SESSIONS
      const sessionToken = crypto.randomUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

      await prisma.session.create({
        data: {
          sessionToken,
          userId: existingUser.id,
          expires,
          loginAt: new Date(),
          loginMethod: account?.provider === 'google' ? 'oauth' : 'credentials',
          provider: account?.provider || null,
          ipAddress: 'IP_DEL_USUARIO', // Obtener del request
          userAgent: 'USER_AGENT', // Obtener del request
        },
      });

      console.log('✅ Login registrado en tabla sessions');

      // ... resto de la lógica existente ...
    }
  } catch (error) {
    console.error('❌ Error registrando login:', error);
  }
}
```

### 3. Modificar el Callback `session` para incluir información de sesión

```typescript
async session({ session, user, token }) {
  // ... lógica existente ...

  // Agregar información de la sesión actual
  if (token && session.user) {
    // Buscar la sesión más reciente del usuario
    const latestSession = await prisma.session.findFirst({
      where: { userId: token.sub },
      orderBy: { loginAt: 'desc' },
      select: {
        loginAt: true,
        loginMethod: true,
        provider: true,
      },
    });

    if (latestSession) {
      (session.user as any).lastLoginAt = latestSession.loginAt;
      (session.user as any).lastLoginMethod = latestSession.loginMethod;
      (session.user as any).lastLoginProvider = latestSession.provider;
    }
  }

  return session;
}
```

### 4. Crear API Endpoint para obtener historial de logins

```typescript
// src/app/api/admin/users/[id]/logins/route.ts
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logins = await prisma.session.findMany({
      where: { userId: params.id },
      orderBy: { loginAt: 'desc' },
      select: {
        id: true,
        loginAt: true,
        loginMethod: true,
        provider: true,
        ipAddress: true,
        userAgent: true,
        expires: true,
      },
    });

    return NextResponse.json({ logins });
  } catch (error) {
    console.error('Error obteniendo logins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 5. Modificar el Hook `useUsers` para incluir información de sesiones

```typescript
// src/hooks/use-users.ts
interface User {
  // ... campos existentes ...
  sessions: Array<{
    id: string;
    sessionToken: string;
    userId: string;
    expires: string;
    loginAt: string;
    loginMethod: string;
    provider: string | null;
    ipAddress: string | null;
    userAgent: string | null;
  }>;
}
```

### 6. Modificar `UsersManagement.tsx` para mostrar información de sesiones

```typescript
const getLastActive = (user: User) => {
  if (user.sessions?.length > 0) {
    const lastSession = user.sessions[0];
    return {
      date: new Date(lastSession.loginAt).toLocaleDateString('es-ES'),
      method: lastSession.loginMethod,
      provider: lastSession.provider,
    };
  }
  return null;
};

// En la tabla:
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {(() => {
    const lastActive = getLastActive(user);
    if (lastActive) {
      return (
        <div>
          <div>{lastActive.date}</div>
          <div className="text-xs text-gray-400">
            {lastActive.method} {lastActive.provider ? `(${lastActive.provider})` : ''}
          </div>
        </div>
      );
    }
    return 'Nunca';
  })()}
</td>
```

## PASOS DE IMPLEMENTACIÓN

### Fase 1: Preparación del Schema

1. Modificar `prisma/schema.prisma` para agregar campos de tracking
2. Ejecutar `npx prisma migrate dev --name add-session-tracking`
3. Ejecutar `npx prisma generate`

### Fase 2: Modificación de Callbacks

1. Actualizar callback `signIn` en `auth.config.ts`
2. Actualizar callback `session` en `auth.config.ts`
3. Agregar lógica para obtener IP y User Agent

### Fase 3: Creación de APIs

1. Crear endpoint para obtener historial de logins
2. Modificar endpoint existente de usuarios para incluir sesiones
3. Actualizar tipos TypeScript

### Fase 4: Actualización de Frontend

1. Modificar `UsersManagement.tsx` para mostrar información de sesiones
2. Actualizar hook `useUsers`
3. Agregar funcionalidad para ver historial completo

### Fase 5: Testing y Validación

1. Probar login con OAuth (Google)
2. Probar login con Credentials
3. Verificar que se registren en tabla `sessions`
4. Validar que se muestre en la interfaz

## CONSIDERACIONES TÉCNICAS

### Seguridad

- **IP Address**: Considerar privacidad del usuario
- **User Agent**: Puede contener información sensible
- **Rate Limiting**: Implementar para prevenir spam de logins

### Performance

- **Índices**: Agregar índices en `userId` y `loginAt`
- **Paginación**: Para usuarios con muchos logins
- **Cleanup**: Eliminar sesiones expiradas periódicamente

### Mantenimiento

- **Logs**: Registrar errores en la creación de sesiones
- **Monitoring**: Alertas si falla el registro de sesiones
- **Backup**: Incluir tabla `sessions` en backups

## ALTERNATIVAS AVANZADAS

### 1. Cambiar a Database Sessions

```typescript
// En auth.ts
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' }, // Cambiar de 'jwt' a 'database'
  // ... resto de configuración
});
```

**Ventajas:**

- NextAuth maneja automáticamente la tabla `sessions`
- Tracking automático de sesiones activas
- Mejor integración con PrismaAdapter

**Desventajas:**

- Requiere cambios significativos en la configuración
- Puede romper funcionalidad existente
- Necesita testing exhaustivo

### 2. Implementar Redis para Sessions

```typescript
// Usar Redis para almacenar sesiones
import { RedisAdapter } from '@auth/redis-adapter';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: RedisAdapter(redis),
  session: { strategy: 'database' },
  // ... resto de configuración
});
```

**Ventajas:**

- Mejor performance para sesiones
- Escalabilidad horizontal
- TTL automático para expiración

**Desventajas:**

- Dependencia adicional (Redis)
- Mayor complejidad de infraestructura
- Costos adicionales

## CONCLUSIÓN

La implementación recomendada (Opción 1) es la más segura y menos disruptiva para el sistema actual. Permite:

1. **Mantener la estrategia JWT** existente
2. **Usar la tabla `sessions`** ya definida
3. **Implementar tracking completo** de logins
4. **Mantener compatibilidad** con el resto del sistema

La implementación debe realizarse en fases para minimizar riesgos y permitir testing exhaustivo en cada etapa.

## RECURSOS ADICIONALES

- [Auth.js Documentation](https://authjs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
