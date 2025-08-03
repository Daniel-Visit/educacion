# 🚀 Plan de Implementación - Sistema de Autenticación

## 📋 Estado Actual

### ✅ Ya implementado:

- NextAuth.js configurado en `src/lib/auth.ts`
- Proveedores: Google, GitHub, Credentials
- Configuración básica de callbacks y sesiones
- Rutas configuradas: `/auth/signin`, `/auth/signup`

### 🔄 Pendiente por implementar:

- Tablas de usuarios en Prisma
- Páginas de autenticación
- Componentes de UI
- Middleware de protección
- Integración con funcionalidades existentes

## 🗄️ Base de Datos - Prisma Schema

### Tablas necesarias (agregar a `prisma/schema.prisma`):

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("user") // "admin", "profesor", "user"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  planificaciones PlanificacionAnual[] // Relación con planificaciones existentes

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

### Modificaciones a tablas existentes:

```prisma
model PlanificacionAnual {
  // ... campos existentes ...
  userId    String? // Agregar este campo
  user      User?   @relation(fields: [userId], references: [id]) // Agregar esta relación
}
```

## 📱 Pantallas a Crear

### 1. Autenticación (`/src/app/auth/`)

```
/auth/
├── signin/
│   └── page.tsx          # Página de login
├── signup/
│   └── page.tsx          # Página de registro
├── forgot-password/
│   └── page.tsx          # Recuperación de contraseña
├── reset-password/
│   └── page.tsx          # Reset de contraseña
└── verify-email/
    └── page.tsx          # Verificación de email
```

### 2. Perfil de Usuario (`/src/app/profile/`)

```
/profile/
├── page.tsx              # Perfil principal
├── edit/
│   └── page.tsx          # Editar perfil
└── change-password/
    └── page.tsx          # Cambiar contraseña
```

### 3. Administración (`/src/app/admin/`)

```
/admin/
├── users/
│   └── page.tsx          # Gestión de usuarios
├── roles/
│   └── page.tsx          # Gestión de roles
└── analytics/
    └── page.tsx          # Analytics del sistema
```

## 🧩 Componentes a Crear

### 1. Componentes de Autenticación (`/src/components/auth/`)

```
auth/
├── LoginForm.tsx         # Formulario de login
├── RegisterForm.tsx      # Formulario de registro
├── ForgotPasswordForm.tsx # Formulario de recuperación
├── ResetPasswordForm.tsx # Formulario de reset
├── VerifyEmailForm.tsx   # Formulario de verificación
└── AuthGuard.tsx         # Componente para proteger rutas
```

### 2. Componentes de Usuario (`/src/components/user/`)

```
user/
├── UserMenu.tsx          # Menú desplegable del usuario
├── ProfileForm.tsx       # Formulario de perfil
├── ChangePasswordForm.tsx # Formulario de cambio de contraseña
└── UserAvatar.tsx        # Avatar del usuario
```

### 3. Componentes de Administración (`/src/components/admin/`)

```
admin/
├── UsersTable.tsx        # Tabla de usuarios
├── UserForm.tsx          # Formulario de usuario
├── RolesTable.tsx        # Tabla de roles
└── Analytics.tsx         # Componente de analytics
```

## 🔧 Configuración Técnica

### 1. Variables de Entorno (`.env`)

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret

# Email (para recuperación de contraseña)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### 2. Middleware (`/src/middleware.ts`)

```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Lógica de middleware
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/planificacion-anual/:path*',
    '/matrices/:path*',
    '/evaluaciones/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ],
};
```

### 3. Tipos TypeScript (`/src/types/auth.ts`)

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
```

## 📋 Checklist de Implementación

### Día 1: Base de Datos y Configuración

- [ ] Agregar tablas de usuarios al schema de Prisma
- [ ] Ejecutar `prisma db push`
- [ ] Configurar variables de entorno
- [ ] Crear middleware de protección
- [ ] Configurar tipos TypeScript

### Día 2: Páginas de Autenticación

- [ ] Crear página `/auth/signin`
- [ ] Crear página `/auth/signup`
- [ ] Crear página `/auth/forgot-password`
- [ ] Crear página `/auth/reset-password`
- [ ] Crear página `/auth/verify-email`

### Día 3: Componentes de UI

- [ ] Crear `LoginForm.tsx`
- [ ] Crear `RegisterForm.tsx`
- [ ] Crear `ForgotPasswordForm.tsx`
- [ ] Crear `UserMenu.tsx`
- [ ] Crear `AuthGuard.tsx`

### Día 4: Integración

- [ ] Integrar autenticación en dashboard
- [ ] Modificar sidebar para mostrar usuario
- [ ] Proteger rutas sensibles
- [ ] Asociar planificaciones con usuarios
- [ ] Testing básico

### Día 5: Funcionalidades Avanzadas

- [ ] Implementar recuperación de contraseña
- [ ] Implementar verificación de email
- [ ] Crear página de perfil
- [ ] Implementar cambio de contraseña
- [ ] Testing completo

### Día 6: Administración

- [ ] Crear panel de administración
- [ ] Implementar gestión de usuarios
- [ ] Implementar roles y permisos
- [ ] Crear analytics básicos
- [ ] Testing de administración

### Día 7: Pulido y Deploy

- [ ] Testing final completo
- [ ] Optimización de performance
- [ ] Documentación de uso
- [ ] Deploy a producción
- [ ] Configuración de monitoreo

## 🎯 Prioridades

### Alta Prioridad (Días 1-3)

1. Base de datos y configuración
2. Páginas básicas de autenticación
3. Componentes esenciales de UI

### Media Prioridad (Días 4-5)

1. Integración con funcionalidades existentes
2. Funcionalidades de recuperación de contraseña
3. Perfil de usuario

### Baja Prioridad (Días 6-7)

1. Panel de administración
2. Analytics
3. Optimizaciones avanzadas

## 🚨 Consideraciones Importantes

### Seguridad

- Usar HTTPS en producción
- Implementar rate limiting
- Validar todas las entradas de usuario
- Usar tokens seguros para reset de contraseña

### UX/UI

- Mantener consistencia con el diseño actual
- Implementar loading states
- Manejar errores de forma amigable
- Hacer responsive design

### Performance

- Lazy loading de componentes
- Optimizar queries de base de datos
- Implementar caching donde sea apropiado

## 📞 Recursos y Referencias

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Nota**: Este plan es flexible y puede ajustarse según las necesidades y prioridades del proyecto.
