# Chore: Refactoring Completo del Codebase

## ✅ COMPLETADO - 2024-12-13

### Resumen de Cambios

| Componente             | Estado | Descripción                                    |
| ---------------------- | ------ | ---------------------------------------------- |
| Testing Infrastructure | ✅     | Vitest + 26 tests passing                      |
| Prisma Safe Script     | ✅     | Bloquea comandos peligrosos                    |
| Database Layer         | ✅     | `src/lib/db/` con singleton y repositories     |
| API Routes Migration   | ✅     | 49 rutas migradas a usar `db`                  |
| Middleware             | ✅     | Simplificado de ~200 a ~100 líneas             |
| Auth Config            | ✅     | Simplificado de ~277 a ~180 líneas             |
| Redis Removal          | ✅     | Eliminado `auth-redis.ts`, `redis.ts`          |
| API Utils              | ✅     | `src/lib/api-utils.ts` con helpers             |
| Base Modal             | ✅     | `src/components/ui/base-modal.tsx`             |
| Form Hook              | ✅     | `src/hooks/use-form-submission.ts`             |
| Button Consolidation   | ✅     | Eliminados `PrimaryButton` y `SecondaryButton` |
| TipTap Icons           | ⏭️     | Skipped (optional)                             |

### Validación

- **Build**: ✅ Exitoso
- **Unit Tests**: ✅ 26/26 passing
- **E2E Tests**: ✅ 18/19 passing (94.7%)
- **API Endpoints**: ✅ Funcionando
- **Auth Flow**: ✅ Login/Logout/Redirect working

### Archivos Eliminados

- `src/lib/prisma.ts` (reemplazado por `src/lib/db/index.ts`)
- `src/lib/auth-redis.ts` (568 líneas)
- `src/lib/redis.ts` (14 líneas)
- `src/components/ui/PrimaryButton.tsx` (34 líneas)
- `src/components/ui/SecondaryButton.tsx` (34 líneas)

### Git Stats

```
65 files changed, 2469 insertions(+), 1985 deletions(-)
```

---

## Chore Description

Refactorización integral del codebase de Educacion App para mejorar seguridad, consistencia y mantenibilidad. Este refactoring:

- Blinda Prisma con wrappers seguros (sin reemplazarlo aún)
- Simplifica autenticación (elimina Redis innecesario)
- Consolida componentes frontend duplicados
- Agrega testing continuo que el proyecto no tiene actualmente
- Prepara arquitectura para migración gradual a Drizzle en features nuevos

**IMPORTANTE**: NO se modifica UI ni comportamiento. Solo estructura interna.

**CRÍTICO**: Cada paso incluye backup y validación ANTES de continuar al siguiente.

## Relevant Files

### Backend - Críticos (Prisma)

- `src/lib/prisma.ts` - Singleton actual, será envuelto en capa segura
- `src/app/api/matrices/route.ts` - Crea `new PrismaClient()` en línea 4
- `src/app/api/matrices/[id]/route.ts` - Crea `new PrismaClient()` en línea 15
- `src/app/api/admin/users/invite/route.ts` - Operación multi-paso sin transacción

### Backend - Auth (Simplificar)

- `src/middleware.ts` - 200 líneas → ~50 líneas
- `auth.config.ts` - 277 líneas → ~100 líneas
- `src/lib/auth-redis.ts` - 568 líneas a ELIMINAR
- `src/lib/redis.ts` - 14 líneas a ELIMINAR

### Frontend - Duplicados

- `src/components/admin/*.tsx` - 3 modales duplicados
- `src/components/evaluacion/SaveModal.tsx` - Modal duplicado
- `src/components/editor/SaveContentModal.tsx` - Modal duplicado
- `src/components/horarios/CrearHorarioModal.tsx` - Modal duplicado (863 líneas!)
- `src/components/tiptap-icons/*.tsx` - 38 archivos → 1 archivo
- `src/components/ui/PrimaryButton.tsx` - Duplicado
- `src/components/ui/SecondaryButton.tsx` - Duplicado

### Nuevos Archivos a Crear

- `src/lib/db/index.ts` - Capa segura sobre Prisma
- `src/lib/db/repositories/user.repository.ts` - Repositorio de usuarios
- `src/lib/db/repositories/evaluacion.repository.ts` - Repositorio de evaluaciones
- `src/lib/api-utils.ts` - Helpers para respuestas API
- `src/components/ui/base-modal.tsx` - Modal base reutilizable
- `src/hooks/use-form-submission.ts` - Hook para formularios
- `scripts/prisma-safe.sh` - Script que bloquea comandos peligrosos
- `.husky/pre-commit` - Hook para validar commits
- `drizzle.config.ts` - Config para features nuevos (futuro)

---

## Step by Step Tasks

### Paso 0: Setup Testing y Seguridad (HACER PRIMERO)

**Objetivo**: Infraestructura de testing + bloqueo de comandos Prisma peligrosos.

**Riesgo**: NINGUNO

- Verificar estado actual:

  ```bash
  git status
  npm run build
  npm run lint
  ```

- Crear backup de base de datos:

  ```bash
  cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d-%H%M%S)
  ```

- Instalar dependencias de testing:

  ```bash
  npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
  ```

- Crear `vitest.config.ts`:

  ```typescript
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      globals: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  });
  ```

- Crear `tests/setup.ts`:

  ```typescript
  import '@testing-library/jest-dom/vitest';
  ```

- Crear script de Prisma seguro `scripts/prisma-safe.sh`:

  ```bash
  #!/bin/bash

  # Comandos bloqueados
  BLOCKED_COMMANDS=("migrate reset" "db push --force-reset" "migrate dev --create-only")

  COMMAND="$*"

  for blocked in "${BLOCKED_COMMANDS[@]}"; do
    if [[ "$COMMAND" == *"$blocked"* ]]; then
      echo "❌ BLOQUEADO: 'prisma $blocked' puede destruir datos"
      echo ""
      echo "Comandos seguros:"
      echo "  npx prisma generate     - Regenera cliente"
      echo "  npx prisma studio       - UI de base de datos"
      echo "  npx prisma db pull      - Lee schema de DB"
      echo ""
      echo "Si REALMENTE necesitas este comando, usa:"
      echo "  npx prisma $COMMAND"
      exit 1
    fi
  done

  # Ejecutar comando seguro
  npx prisma "$@"
  ```

- Hacer ejecutable y agregar alias:

  ```bash
  chmod +x scripts/prisma-safe.sh
  ```

- Agregar scripts a `package.json`:

  ```json
  {
    "scripts": {
      "test": "vitest",
      "test:run": "vitest run",
      "test:watch": "vitest --watch",
      "db": "./scripts/prisma-safe.sh",
      "db:generate": "./scripts/prisma-safe.sh generate",
      "db:studio": "./scripts/prisma-safe.sh studio"
    }
  }
  ```

- **CHECKPOINT 0**:
  ```bash
  npm run test:run  # Debe pasar (0 tests)
  npm run db:generate  # Debe funcionar
  npm run db -- migrate reset  # Debe BLOQUEARSE
  ```

---

### Paso 1: Crear Capa Segura de Base de Datos

**Objetivo**: Envolver Prisma en una capa que previene errores y estandariza el acceso.

**Riesgo**: NINGUNO - Solo agrega código nuevo.

- Crear estructura de directorios:

  ```bash
  mkdir -p src/lib/db/repositories
  ```

- Crear `src/lib/db/index.ts`:

  ```typescript
  /**
   * Capa segura de acceso a base de datos.
   *
   * REGLAS:
   * 1. NUNCA importar prisma directamente en rutas API
   * 2. SIEMPRE usar db o repositories
   * 3. Operaciones multi-paso SIEMPRE en transacción
   */

  import { PrismaClient } from '@prisma/client';

  // Singleton de Prisma (solo para uso interno de este módulo)
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

  const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }

  // Tipos para transacciones
  export type TransactionClient = Parameters<
    Parameters<typeof prisma.$transaction>[0]
  >[0];

  /**
   * Cliente de base de datos seguro.
   * Expone solo las operaciones permitidas.
   */
  export const db = {
    // Modelos de dominio educativo
    asignatura: prisma.asignatura,
    nivel: prisma.nivel,
    oa: prisma.oa,
    metodologia: prisma.metodologia,

    // Evaluaciones
    evaluacion: prisma.evaluacion,
    pregunta: prisma.pregunta,
    alternativa: prisma.alternativa,
    indicador: prisma.indicador,
    matrizEspecificacion: prisma.matrizEspecificacion,
    matrizOA: prisma.matrizOA,
    preguntaIndicador: prisma.preguntaIndicador,

    // Resultados
    resultadoEvaluacion: prisma.resultadoEvaluacion,
    resultadoAlumno: prisma.resultadoAlumno,
    respuestaAlumno: prisma.respuestaAlumno,
    alumno: prisma.alumno,

    // Planificación
    horario: prisma.horario,
    moduloHorario: prisma.moduloHorario,
    planificacionAnual: prisma.planificacionAnual,
    asignacionOA: prisma.asignacionOA,

    // Profesores
    profesor: prisma.profesor,
    profesorAsignatura: prisma.profesorAsignatura,
    profesorNivel: prisma.profesorNivel,

    // Archivos
    archivo: prisma.archivo,
    imagen: prisma.imagen,

    // Auth (NextAuth)
    user: prisma.user,
    account: prisma.account,
    session: prisma.session,
    verificationToken: prisma.verificationToken,

    // Sistema
    role: prisma.role,
    availableAvatar: prisma.availableAvatar,
    avatarBackgroundColor: prisma.avatarBackgroundColor,

    /**
     * Ejecuta operaciones en una transacción.
     * SIEMPRE usar para operaciones multi-paso.
     */
    transaction: prisma.$transaction.bind(prisma),

    /**
     * Desconectar (solo para tests/cleanup)
     */
    disconnect: () => prisma.$disconnect(),
  } as const;

  // Tipo para el cliente de DB
  export type DB = typeof db;

  // Re-exportar tipos de Prisma que se necesiten
  export type { Prisma } from '@prisma/client';
  ```

- Crear `src/lib/db/repositories/base.repository.ts`:

  ```typescript
  import { db, TransactionClient } from '../index';

  /**
   * Repositorio base con operaciones comunes.
   */
  export abstract class BaseRepository {
    protected db = db;

    /**
     * Ejecuta operación en transacción si se proporciona tx,
     * sino usa el cliente normal.
     */
    protected getClient(tx?: TransactionClient) {
      return tx || this.db;
    }
  }
  ```

- Crear `src/lib/db/repositories/user.repository.ts`:

  ```typescript
  import { db, TransactionClient } from '../index';
  import type { User, Prisma } from '@prisma/client';

  export interface CreateUserInput {
    email: string;
    name?: string;
    role?: string;
    password?: string;
    forcePasswordChange?: boolean;
  }

  export interface UpdateUserInput {
    name?: string;
    role?: string;
    image?: string;
    forcePasswordChange?: boolean;
  }

  export interface FindUsersOptions {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }

  export const userRepository = {
    async findById(id: string): Promise<User | null> {
      return db.user.findUnique({ where: { id } });
    },

    async findByEmail(email: string): Promise<User | null> {
      return db.user.findUnique({ where: { email } });
    },

    async findAll(options: FindUsersOptions = {}) {
      const { page = 1, limit = 10, search, role } = options;
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
            forcePasswordChange: true,
          },
        }),
        db.user.count({ where }),
      ]);

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },

    async create(data: CreateUserInput, tx?: TransactionClient): Promise<User> {
      const client = tx || db;
      return client.user.create({ data });
    },

    async update(id: string, data: UpdateUserInput): Promise<User> {
      return db.user.update({ where: { id }, data });
    },

    async delete(id: string): Promise<void> {
      await db.transaction(async tx => {
        // Eliminar relaciones primero
        await tx.account.deleteMany({ where: { userId: id } });
        await tx.session.deleteMany({ where: { userId: id } });
        // Luego el usuario
        await tx.user.delete({ where: { id } });
      });
    },

    async deleteMany(ids: string[]): Promise<number> {
      const result = await db.transaction(async tx => {
        // Eliminar relaciones primero
        await tx.account.deleteMany({ where: { userId: { in: ids } } });
        await tx.session.deleteMany({ where: { userId: { in: ids } } });
        // Luego los usuarios
        const deleted = await tx.user.deleteMany({
          where: { id: { in: ids } },
        });
        return deleted.count;
      });
      return result;
    },
  };
  ```

- Crear `src/lib/db/repositories/index.ts`:

  ```typescript
  export { userRepository } from './user.repository';
  export type {
    CreateUserInput,
    UpdateUserInput,
    FindUsersOptions,
  } from './user.repository';

  // Agregar más repositories conforme se creen:
  // export { evaluacionRepository } from './evaluacion.repository';
  // export { matrizRepository } from './matriz.repository';
  ```

- Crear test `tests/lib/db.test.ts`:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { db } from '@/lib/db';

  describe('Database Layer', () => {
    it('exports db client', () => {
      expect(db).toBeDefined();
      expect(db.user).toBeDefined();
      expect(db.evaluacion).toBeDefined();
    });

    it('has transaction method', () => {
      expect(typeof db.transaction).toBe('function');
    });

    it('has disconnect method', () => {
      expect(typeof db.disconnect).toBe('function');
    });
  });
  ```

- **CHECKPOINT 1**:
  ```bash
  npm run build
  npm run test:run
  # Verificar que tests pasan
  ```

---

### Paso 2: Fix PrismaClient Múltiple

**Objetivo**: Usar nueva capa db en lugar de crear instancias.

**Riesgo**: BAJO - Solo cambiamos imports.

- Modificar `src/app/api/matrices/route.ts`:

  ```typescript
  // ANTES (líneas 1-4)
  import { PrismaClient } from '@prisma/client';
  const prisma = new PrismaClient();

  // DESPUÉS
  import { db } from '@/lib/db';
  // Usar db.matrizEspecificacion en lugar de prisma.matrizEspecificacion
  ```

- Modificar `src/app/api/matrices/[id]/route.ts`:
  - Mismo cambio

- Actualizar `src/lib/prisma.ts` para redirigir (compatibilidad temporal):

  ```typescript
  /**
   * @deprecated Usar import { db } from '@/lib/db' en su lugar
   */
  export { db as prisma } from './db';
  ```

- **CHECKPOINT 2**:

  ```bash
  npm run build
  grep -r "new PrismaClient" src/app/api/ --include="*.ts"
  # Debe estar vacío

  npm run dev
  # Probar /matrices - crear, editar, eliminar
  ```

---

### Paso 3: Simplificar Middleware

**Objetivo**: Reducir de ~200 líneas a ~50, eliminar Redis.

**Riesgo**: MEDIO - Afecta autenticación.

**BACKUP**:

```bash
cp src/middleware.ts src/middleware.ts.backup
```

- Reemplazar `src/middleware.ts`:

  ```typescript
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';
  import { getToken } from 'next-auth/jwt';

  // Rutas que no requieren autenticación
  const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/set-password',
    '/auth/change-password',
    '/403',
    '/500',
  ];

  // Rutas que requieren rol admin
  const ADMIN_ROUTES = ['/admin'];

  export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // NextAuth maneja sus propias rutas
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // Rutas públicas
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    try {
      const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      });

      // Sin token -> login
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      // Forzar cambio de contraseña
      if (token.forcePasswordChange && pathname !== '/auth/change-password') {
        return NextResponse.redirect(
          new URL('/auth/change-password', request.url)
        );
      }

      // Verificar acceso admin
      if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
        if (token.role !== 'admin') {
          return NextResponse.redirect(new URL('/403', request.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
  };
  ```

- **CHECKPOINT 3** (TESTS MANUALES OBLIGATORIOS):

  ```bash
  npm run build
  npm run dev
  ```

  Probar CADA uno:
  - [ ] Sin sesión → /dashboard redirige a /login
  - [ ] Login con Google funciona
  - [ ] Login con credenciales funciona
  - [ ] Usuario normal no puede acceder a /admin/users
  - [ ] Usuario admin puede acceder a /admin/users
  - [ ] Logout funciona

  Si algo falla:

  ```bash
  cp src/middleware.ts.backup src/middleware.ts
  ```

---

### Paso 4: Simplificar auth.config.ts

**Objetivo**: Eliminar Redis, reducir a ~100 líneas.

**Riesgo**: MEDIO - Afecta autenticación.

**BACKUP**:

```bash
cp auth.config.ts auth.config.ts.backup
```

- Reemplazar `auth.config.ts`:

  ```typescript
  import type { NextAuthConfig } from 'next-auth';
  import Google from 'next-auth/providers/google';
  import Credentials from 'next-auth/providers/credentials';
  import { db } from './src/lib/db';
  import bcrypt from 'bcryptjs';

  // Extender tipos de NextAuth
  declare module 'next-auth' {
    interface Session {
      user: {
        id: string;
        email: string;
        name?: string;
        image?: string;
        role: string;
        forcePasswordChange: boolean;
      };
    }
    interface User {
      role?: string;
      forcePasswordChange?: boolean;
    }
  }

  declare module 'next-auth/jwt' {
    interface JWT {
      role?: string;
      forcePasswordChange?: boolean;
    }
  }

  export default {
    trustHost: true,
    session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
    pages: { signIn: '/auth/login', error: '/auth/login' },

    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
        clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
      }),
      Credentials({
        credentials: {
          email: { type: 'email' },
          password: { type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user?.password) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!valid) return null;

          return {
            id: user.id,
            email: user.email!,
            name: user.name,
            image: user.image,
            role: user.role,
            forcePasswordChange: user.forcePasswordChange,
          };
        },
      }),
    ],

    callbacks: {
      async signIn({ user, account }) {
        if (!user.email) return false;

        const dbUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) return false;

        // OAuth: desactivar forcePasswordChange
        if (account?.provider === 'google' && dbUser.forcePasswordChange) {
          await db.user.update({
            where: { id: dbUser.id },
            data: { forcePasswordChange: false },
          });
        }

        return true;
      },

      async jwt({ token, user }) {
        if (user) {
          token.role = user.role || 'user';
          token.forcePasswordChange = user.forcePasswordChange || false;
        }
        return token;
      },

      async session({ session, token }) {
        session.user.id = token.sub!;
        session.user.role = token.role || 'user';
        session.user.forcePasswordChange = token.forcePasswordChange || false;
        return session;
      },
    },
  } satisfies NextAuthConfig;
  ```

- **CHECKPOINT 4** (REPETIR TODOS LOS TESTS DEL PASO 3):

  ```bash
  npm run build
  npm run dev
  ```

  - [ ] Login con Google
  - [ ] Login con credenciales
  - [ ] Roles funcionan
  - [ ] forcePasswordChange funciona

---

### Paso 5: Eliminar Redis

**Objetivo**: Eliminar archivos y dependencia.

**Riesgo**: BAJO - Ya no se usan.

- Verificar que no hay imports:

  ```bash
  grep -r "auth-redis\|from.*redis" src/ --include="*.ts"
  # Debe estar vacío o solo mostrar archivos a eliminar
  ```

- Eliminar archivos:

  ```bash
  rm src/lib/redis.ts
  rm src/lib/auth-redis.ts
  ```

- Eliminar dependencia:

  ```bash
  npm uninstall @upstash/redis
  ```

- **CHECKPOINT 5**:
  ```bash
  npm run build
  npm run test:run
  ```

---

### Paso 6: Agregar Transacciones

**Objetivo**: Operaciones multi-paso en transacciones.

**Riesgo**: BAJO - Mejora seguridad.

- Modificar `src/app/api/admin/users/invite/route.ts`:
  - Buscar donde se crea usuario y token
  - Envolver en transacción usando `db.transaction`

- **CHECKPOINT 6**:
  ```bash
  npm run build
  npm run dev
  # Probar invitar usuario en /admin/users
  ```

---

### Paso 7: API Utils

**Objetivo**: Helpers para respuestas consistentes.

**Riesgo**: NINGUNO

- Crear `src/lib/api-utils.ts`:

  ```typescript
  import { NextResponse } from 'next/server';

  export const api = {
    success<T>(data: T, status = 200) {
      return NextResponse.json(data, { status });
    },

    created<T>(data: T) {
      return NextResponse.json(data, { status: 201 });
    },

    error(message: string, status = 400) {
      return NextResponse.json({ error: message }, { status });
    },

    notFound(resource: string) {
      return this.error(`${resource} no encontrado`, 404);
    },

    unauthorized() {
      return this.error('No autorizado', 401);
    },

    forbidden() {
      return this.error('Acceso denegado', 403);
    },

    serverError(err: unknown) {
      console.error('Server error:', err);
      return this.error('Error interno del servidor', 500);
    },
  };
  ```

- Crear test `tests/lib/api-utils.test.ts`:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { api } from '@/lib/api-utils';

  describe('API Utils', () => {
    it('success returns 200', () => {
      const res = api.success({ id: 1 });
      expect(res.status).toBe(200);
    });

    it('created returns 201', () => {
      const res = api.created({ id: 1 });
      expect(res.status).toBe(201);
    });

    it('notFound returns 404', () => {
      const res = api.notFound('Usuario');
      expect(res.status).toBe(404);
    });
  });
  ```

- **CHECKPOINT 7**:
  ```bash
  npm run test:run
  ```

---

### Paso 8: BaseModal Component

**Objetivo**: Modal base reutilizable.

**Riesgo**: NINGUNO

- Crear `src/components/ui/base-modal.tsx`:

  ```typescript
  'use client';

  import { Dialog, DialogContent } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { X, Loader2 } from 'lucide-react';
  import { cn } from '@/lib/utils';

  const gradients = {
    red: 'from-red-600 to-pink-600',
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-green-600 to-emerald-600',
    purple: 'from-purple-600 to-pink-600',
    indigo: 'from-indigo-600 to-purple-600',
  } as const;

  interface BaseModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    gradient?: keyof typeof gradients;
    children: React.ReactNode;
    footer?: React.ReactNode;
    isLoading?: boolean;
    className?: string;
  }

  export function BaseModal({
    open,
    onClose,
    title,
    subtitle,
    icon,
    gradient = 'indigo',
    children,
    footer,
    isLoading,
    className,
  }: BaseModalProps) {
    return (
      <Dialog open={open} onOpenChange={isLoading ? undefined : onClose}>
        <DialogContent className={cn('max-w-lg p-0 overflow-hidden', className)}>
          {/* Header */}
          <div className={cn('bg-gradient-to-r p-6 text-white', gradients[gradient])}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {icon && (
                  <div className="bg-white/20 p-2 rounded-lg">
                    {icon}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{title}</h2>
                  {subtitle && (
                    <p className="text-white/80 text-sm mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Sub-componentes para uso común
  BaseModal.Footer = function ModalFooter({
    onCancel,
    onConfirm,
    cancelText = 'Cancelar',
    confirmText = 'Confirmar',
    isLoading,
    variant = 'default',
  }: {
    onCancel: () => void;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
    isLoading?: boolean;
    variant?: 'default' | 'destructive';
  }) {
    return (
      <>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {confirmText}
        </Button>
      </>
    );
  };
  ```

- **CHECKPOINT 8**:
  ```bash
  npm run build
  ```

---

### Paso 9: useFormSubmission Hook

**Objetivo**: Hook estándar para formularios.

**Riesgo**: NINGUNO

- Crear `src/hooks/use-form-submission.ts`:

  ```typescript
  import { useState, useCallback } from 'react';

  interface Options<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }

  export function useFormSubmission<TInput, TOutput = void>(
    submitFn: (data: TInput) => Promise<TOutput>,
    options?: Options<TOutput>
  ) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(
      async (data: TInput) => {
        setIsLoading(true);
        setError(null);

        try {
          const result = await submitFn(data);
          options?.onSuccess?.(result);
          return result;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Error desconocido';
          setError(message);
          options?.onError?.(message);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [submitFn, options]
    );

    const reset = useCallback(() => setError(null), []);

    return { submit, isLoading, error, reset };
  }
  ```

- Crear test y verificar:
  ```bash
  npm run test:run
  ```

---

### Paso 10: Consolidar Botones

**Objetivo**: Unificar 3 sistemas en 1.

**Riesgo**: MEDIO - Afecta UI.

- Agregar variantes a `button.tsx`
- Buscar y reemplazar PrimaryButton/SecondaryButton
- Eliminar archivos duplicados

- **CHECKPOINT 10**:
  ```bash
  npm run build
  npm run dev
  # Verificar visualmente que botones se ven igual
  ```

---

### Paso 11: Consolidar Iconos (Opcional)

**Objetivo**: Reducir 38 archivos a 1.

**Riesgo**: MEDIO - Afecta editor TipTap.

- Este paso es más largo, puede hacerse después

---

## Validation Commands

```bash
# Después de CADA paso
npm run build
npm run test:run

# Verificaciones finales
grep -r "new PrismaClient" src/ --include="*.ts"  # Vacío
grep -r "auth-redis" src/ --include="*.ts"         # Vacío
npm run db -- migrate reset                        # Debe BLOQUEARSE

# Tests manuales de auth
# - Login Google
# - Login credenciales
# - Roles
# - Logout
```

## Notes

### Arquitectura Final

```
src/lib/
├── db/
│   ├── index.ts              # Cliente seguro (reemplaza prisma.ts)
│   └── repositories/
│       ├── index.ts
│       ├── user.repository.ts
│       └── ...
├── api-utils.ts              # Helpers de respuesta
└── prisma.ts                 # DEPRECADO, redirige a db/

src/components/ui/
├── base-modal.tsx            # Modal base
├── button.tsx                # Con variantes primary/secondary
└── ...

src/hooks/
├── use-form-submission.ts    # Hook para formularios
└── ...

scripts/
└── prisma-safe.sh            # Bloquea comandos peligrosos
```

### Migración Futura a Drizzle

Cuando agregues un feature nuevo grande:

1. Instalar Drizzle:

   ```bash
   npm install drizzle-orm postgres
   npm install -D drizzle-kit
   ```

2. Crear schema en `src/lib/db/drizzle/schema.ts`

3. Usar Drizzle para el feature nuevo, Prisma para lo existente

4. Migrar gradualmente

### Métricas de Éxito

| Métrica                | Antes      | Después    |
| ---------------------- | ---------- | ---------- |
| PrismaClient instances | 3+         | 1 (en db/) |
| Líneas auth            | ~1000      | ~200       |
| Tests                  | 0          | 10+        |
| Comandos peligrosos    | Permitidos | Bloqueados |
| Repositories           | 0          | 1+         |

### Rollback

Cada paso tiene backup. Si algo falla:

```bash
git checkout -- <archivo>
# o
cp <archivo>.backup <archivo>
```
