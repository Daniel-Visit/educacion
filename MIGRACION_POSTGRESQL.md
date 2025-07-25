# Migración a PostgreSQL - Estado Actual

## Estado Actual (19 de Julio 2024)

### ✅ Completado:
1. **Proyecto restaurado desde Git** - Todo el código está limpio y funcionando con SQLite
2. **Base de datos SQLite funcionando** - La aplicación está corriendo en http://localhost:3001
3. **Schema de Prisma configurado para SQLite** - `prisma/schema.prisma` tiene `provider = "sqlite"`
4. **Cliente de Prisma regenerado** - `npx prisma generate` ejecutado correctamente

### 🔧 Errores de Linting Identificados:
1. **API Route con params no await** - `/api/evaluaciones/[id]/preguntas/route.ts` línea 9
   - Error: `params.id` debe ser await antes de usar
   - Solución: Cambiar `const evaluacionId = parseInt(params.id);` por `const evaluacionId = parseInt(await params.id);`

### 🔑 Credenciales y Configuración PostgreSQL:

#### Supabase Database URL:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

#### Variables de Entorno Necesarias:
```bash
# SQLite (actual)
DATABASE_URL="file:./dev.db"

# PostgreSQL (para migración)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

#### Configuración de Archivos:
- **Schema actual:** `prisma/schema.prisma` (provider = "sqlite")
- **Backup SQLite:** `prisma/dev.db`
- **Variables actuales:** `.env` (SQLite)
- **Variables PostgreSQL:** Crear `.env.postgresql`

### 📋 Próximos Pasos para Migración a PostgreSQL:

#### Fase 1: Preparación
1. **Crear backup del schema actual**
   ```bash
   cp prisma/schema.prisma prisma/schema.sqlite.backup
   ```

2. **Configurar variables de entorno para PostgreSQL**
   - Crear `.env.postgresql` con la URL de Supabase
   - Mantener `.env` con SQLite para rollback

#### Fase 2: Migración del Schema
1. **Cambiar provider en schema.prisma**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Regenerar cliente de Prisma**
   ```bash
   npx prisma generate
   ```

#### Fase 3: Migración de Datos
1. **Crear script de migración de datos**
   - Migrar todas las tablas de SQLite a PostgreSQL
   - Mantener integridad referencial
   - Verificar que todos los datos se migren correctamente

#### Fase 4: Verificación
1. **Probar todas las APIs**
2. **Verificar que no hay errores de relaciones**
3. **Confirmar que la aplicación funciona perfectamente**

### 🚨 Restricciones Importantes:
- **NO tocar código de APIs** - Solo modificar el modelo de datos
- **Mantener nombres de relaciones exactos** - `modulos`, `profesores`, etc.
- **No cambiar estructura de datos** - Solo cambiar provider de base de datos

### 📁 Archivos Clave:
- `prisma/schema.prisma` - Schema principal (actualmente SQLite)
- `.env` - Variables de entorno (actualmente SQLite)
- `prisma/dev.db` - Base de datos SQLite actual

### 🎯 Objetivo Final:
Migrar de SQLite a PostgreSQL en Supabase sin cambiar ninguna API ni funcionalidad, manteniendo el modelo de datos exacto.

### 🔄 Comandos de Rollback:
```bash
# Si algo sale mal, volver a SQLite:
cp prisma/schema.sqlite.backup prisma/schema.prisma
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma generate
```

---
**Última actualización:** 19 de Julio 2024
**Estado:** Listo para continuar migración
**Próximo paso:** Arreglar error de linting y comenzar Fase 1 