# 🔐 Plan de Implementación de Autenticación

## 📋 **Resumen Ejecutivo**

Implementar sistema de autenticación usando **NextAuth.js** con proveedores **Google OAuth** y **Email/Password** para la aplicación educativa.

**Tiempo estimado:** 2-3 días
**Prioridad:** Alta (seguridad en producción)

## 🎯 **Objetivos**

1. **Proteger todas las rutas** de la aplicación
2. **Implementar login/registro** con Google y Email/Password
3. **Sistema de roles** (Admin, Profesor, Estudiante)
4. **Asociar datos existentes** con usuarios
5. **UI intuitiva** para autenticación

## 🏗️ **Arquitectura**

### **Proveedores de Autenticación**
- ✅ **Google OAuth** - Para usuarios con cuenta Google
- ✅ **Email/Password** - Para usuarios tradicionales
- 🔄 **Futuro:** GitHub, Microsoft, Magic Links

### **Sistema de Roles**
- **Admin** - Acceso total, gestión de usuarios
- **Profesor** - Crear/editar planificaciones, matrices, evaluaciones
- **Estudiante** - Solo lectura de contenido asignado

### **Base de Datos**
- **Tabla `users`** - Información de usuarios
- **Tabla `accounts`** - Cuentas OAuth
- **Tabla `sessions`** - Sesiones activas
- **Relaciones** - Asociar datos existentes con usuarios

## 📅 **Cronograma Detallado**

### **Día 1: Configuración Base**
- [ ] Instalar NextAuth.js y dependencias
- [ ] Configurar proveedores (Google + Email/Password)
- [ ] Crear API routes para autenticación
- [ ] Configurar variables de entorno
- [ ] Crear páginas básicas de login/registro

### **Día 2: UI y Protección**
- [ ] Diseñar componentes de autenticación
- [ ] Implementar middleware de protección
- [ ] Crear contexto de usuario
- [ ] Proteger todas las rutas existentes
- [ ] Implementar logout y navegación

### **Día 3: Integración y Roles**
- [ ] Crear sistema de roles en base de datos
- [ ] Asociar datos existentes con usuarios
- [ ] Implementar permisos por página
- [ ] Crear dashboard personalizado
- [ ] Testing y ajustes finales

## 🔧 **Implementación Técnica**

### **Dependencias a Instalar**
```bash
npm install next-auth@beta @auth/prisma-adapter
```

### **Archivos a Crear/Modificar**
- `src/lib/auth.ts` - Configuración NextAuth
- `src/app/api/auth/[...nextauth]/route.ts` - API routes
- `src/app/auth/signin/page.tsx` - Página de login
- `src/app/auth/signup/page.tsx` - Página de registro
- `src/middleware.ts` - Protección de rutas
- `src/contexts/AuthContext.tsx` - Contexto de usuario

### **Variables de Entorno**
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (opcional para verificación)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

## 🎨 **Diseño de UI**

### **Páginas de Autenticación**
- **Login** - Formulario con Google + Email/Password
- **Registro** - Formulario de registro con verificación
- **Recuperar Contraseña** - Formulario de reset
- **Verificar Email** - Página de confirmación

### **Componentes**
- **AuthButton** - Botón de login/logout
- **UserMenu** - Menú desplegable de usuario
- **ProtectedRoute** - Wrapper para rutas protegidas
- **RoleGuard** - Verificación de permisos

## 🔒 **Seguridad**

### **Protección de Rutas**
- Middleware para verificar autenticación
- Redirección automática a login
- Protección de API routes

### **Manejo de Sesiones**
- JWT tokens seguros
- Expiración de sesiones
- Logout automático

### **Validación de Datos**
- Sanitización de inputs
- Validación de roles
- Prevención de CSRF

## 📊 **Migración de Datos**

### **Estrategia**
1. **Crear tabla de usuarios** con NextAuth
2. **Asociar datos existentes** con usuario admin
3. **Migrar gradualmente** a usuarios específicos
4. **Mantener compatibilidad** durante transición

### **Tablas a Modificar**
- `planificaciones` - Agregar `user_id`
- `matrices` - Agregar `user_id`
- `evaluaciones` - Agregar `user_id`
- `horarios` - Agregar `user_id`

## 🧪 **Testing**

### **Casos de Prueba**
- [ ] Login con Google
- [ ] Login con Email/Password
- [ ] Registro de nuevos usuarios
- [ ] Protección de rutas
- [ ] Verificación de roles
- [ ] Logout y limpieza de sesión

### **Escenarios de Error**
- [ ] Credenciales inválidas
- [ ] Email no verificado
- [ ] Acceso sin autenticación
- [ ] Acceso sin permisos

## 🚀 **Despliegue**

### **Vercel**
- Configurar variables de entorno
- Verificar build con autenticación
- Testing en producción

### **Base de Datos**
- Ejecutar migraciones de usuarios
- Configurar RLS si es necesario
- Backup antes de cambios

## 📈 **Futuras Mejoras**

### **Fase 2 (Opcional)**
- [ ] Invitaciones por email
- [ ] Gestión de usuarios (admin)
- [ ] Perfiles de usuario
- [ ] Notificaciones

### **Fase 3 (Avanzado)**
- [ ] SSO con sistemas institucionales
- [ ] Auditoría de accesos
- [ ] Autenticación de dos factores
- [ ] Integración con LMS

## ✅ **Criterios de Éxito**

- [ ] Todos los usuarios pueden autenticarse
- [ ] Las rutas están protegidas
- [ ] Los roles funcionan correctamente
- [ ] La UI es intuitiva
- [ ] No hay regresiones en funcionalidad existente
- [ ] La aplicación funciona en producción

## 🆘 **Riesgos y Mitigación**

### **Riesgos**
- **Pérdida de datos** durante migración
- **Interrupción del servicio** durante implementación
- **Problemas de compatibilidad** con datos existentes

### **Mitigación**
- **Backup completo** antes de cambios
- **Implementación gradual** por módulos
- **Testing exhaustivo** en staging
- **Rollback plan** en caso de problemas

---

**Última actualización:** $(date)
**Responsable:** Equipo de desarrollo
**Estado:** Planificado 