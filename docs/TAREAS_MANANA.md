# 📅 Tareas para Mañana - Sistema de Autenticación

## 🎯 Objetivo del Día

Implementar la base del sistema de autenticación: base de datos, configuración y páginas básicas.

## ⏰ Estimación de Tiempo

**6-8 horas** (día completo)

## 📋 Checklist Detallado

### 1. 🗄️ Base de Datos (2-3 horas)

#### 1.1 Agregar tablas de usuarios al schema

- [ ] Abrir `prisma/schema.prisma`
- [ ] Agregar modelo `User` con campos:
  - `id` (String, @id, @default(cuid()))
  - `name` (String?)
  - `email` (String, @unique)
  - `emailVerified` (DateTime?)
  - `image` (String?)
  - `role` (String, @default("user"))
  - `createdAt` (DateTime, @default(now()))
  - `updatedAt` (DateTime, @updatedAt)
  - Relaciones: `accounts`, `sessions`, `planificaciones`

- [ ] Agregar modelo `Account` para OAuth
- [ ] Agregar modelo `Session` para sesiones
- [ ] Agregar modelo `VerificationToken` para verificación

#### 1.2 Modificar tabla PlanificacionAnual existente

- [ ] Agregar campo `userId` (String?)
- [ ] Agregar relación `user` con modelo `User`

#### 1.3 Aplicar cambios a la base de datos

- [ ] Ejecutar `npx prisma db push`
- [ ] Verificar que no hay errores
- [ ] Ejecutar `npx prisma generate`

### 2. 🔧 Configuración Técnica (1-2 horas)

#### 2.1 Variables de entorno

- [ ] Crear/actualizar `.env.local` con:
  ```
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=tu-secret-key-aqui
  GOOGLE_CLIENT_ID=tu-google-client-id
  GOOGLE_CLIENT_SECRET=tu-google-client-secret
  GITHUB_ID=tu-github-id
  GITHUB_SECRET=tu-github-secret
  ```

#### 2.2 Configurar NextAuth

- [ ] Verificar `src/lib/auth.ts` está correcto
- [ ] Agregar `@auth/prisma-adapter` si no está
- [ ] Configurar callbacks para roles

#### 2.3 Crear tipos TypeScript

- [ ] Crear `src/types/auth.ts`
- [ ] Extender tipos de NextAuth para incluir roles
- [ ] Verificar que no hay errores de TypeScript

### 3. 🛡️ Middleware de Protección (1 hora)

#### 3.1 Crear middleware

- [ ] Crear `src/middleware.ts`
- [ ] Configurar protección de rutas:
  - `/planificacion-anual/*`
  - `/matrices/*`
  - `/evaluaciones/*`
  - `/admin/*`
  - `/profile/*`

#### 3.2 Testing del middleware

- [ ] Verificar que rutas protegidas redirigen a login
- [ ] Verificar que rutas públicas siguen funcionando

### 4. 📱 Páginas de Autenticación (2-3 horas)

#### 4.1 Crear estructura de carpetas

```
src/app/auth/
├── signin/
│   └── page.tsx
├── signup/
│   └── page.tsx
├── forgot-password/
│   └── page.tsx
└── reset-password/
    └── page.tsx
```

#### 4.2 Página de Login (`/auth/signin`)

- [ ] Crear página con diseño consistente
- [ ] Implementar formulario de login
- [ ] Agregar botones de OAuth (Google, GitHub)
- [ ] Manejar errores de autenticación
- [ ] Redirección después del login

#### 4.3 Página de Registro (`/auth/signup`)

- [ ] Crear formulario de registro
- [ ] Validación de campos
- [ ] Integración con NextAuth
- [ ] Verificación de email (opcional)

#### 4.4 Páginas de recuperación

- [ ] Página de "olvidé contraseña"
- [ ] Página de reset de contraseña
- [ ] Formularios básicos (funcionalidad después)

### 5. 🧩 Componentes Básicos (1-2 horas)

#### 5.1 Crear estructura de componentes

```
src/components/auth/
├── LoginForm.tsx
├── RegisterForm.tsx
└── AuthGuard.tsx

src/components/user/
├── UserMenu.tsx
└── UserAvatar.tsx
```

#### 5.2 LoginForm.tsx

- [ ] Formulario con email/password
- [ ] Validación de campos
- [ ] Manejo de errores
- [ ] Loading states

#### 5.3 UserMenu.tsx

- [ ] Menú desplegable del usuario
- [ ] Mostrar nombre y avatar
- [ ] Opciones: Perfil, Logout
- [ ] Integración con NextAuth

### 6. 🧪 Testing Básico (1 hora)

#### 6.1 Testing de autenticación

- [ ] Probar login con Google
- [ ] Probar login con GitHub
- [ ] Probar login con email/password
- [ ] Verificar logout funciona

#### 6.2 Testing de protección

- [ ] Verificar rutas protegidas
- [ ] Verificar redirecciones
- [ ] Verificar sesiones persisten

#### 6.3 Testing de UI

- [ ] Verificar responsive design
- [ ] Verificar loading states
- [ ] Verificar manejo de errores

## 🚨 Problemas Potenciales y Soluciones

### Problema: Error en Prisma schema

**Solución:** Verificar sintaxis, usar `prisma format` y `prisma validate`

### Problema: NextAuth no funciona

**Solución:** Verificar variables de entorno y configuración de proveedores

### Problema: Middleware no protege rutas

**Solución:** Verificar matcher patterns y configuración de NextAuth

### Problema: Errores de TypeScript

**Solución:** Verificar tipos en `src/types/auth.ts` y configuración de NextAuth

## 📞 Recursos de Referencia

- [NextAuth.js Setup](https://next-auth.js.org/configuration/initial-setup)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## 🎯 Criterios de Éxito

Al final del día deberíamos tener:

- ✅ Base de datos con tablas de usuarios
- ✅ NextAuth configurado y funcionando
- ✅ Páginas de login/registro funcionando
- ✅ Middleware protegiendo rutas
- ✅ Usuario puede autenticarse y acceder a rutas protegidas
- ✅ Usuario puede hacer logout

## 📝 Notas Importantes

1. **Mantener consistencia** con el diseño actual de la aplicación
2. **Documentar** cualquier cambio importante
3. **Hacer commits** frecuentes para no perder trabajo
4. **Testing** cada funcionalidad antes de continuar
5. **Backup** de la base de datos antes de cambios

---

**¡Listo para mañana! 🚀**
