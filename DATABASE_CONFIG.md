# Configuración de Bases de Datos

## Base de Datos Principal (SQLite)
**Archivo:** `prisma/dev.db` (4MB)
**Ubicación:** `/Users/daniel/Downloads/Educacion/educacion-app/prisma/dev.db`
**Estado:** ✅ **ACTIVA** - Esta es la base de datos que usa Prisma Studio y la aplicación

### Tablas con datos:
- `asignatura` (13 registros)
- `nivel` (12 registros) 
- `metodologia` (12 registros)
- `oa` (74 registros)
- Y todas las demás tablas del proyecto

## Base de Datos de Migración (PostgreSQL)
**Proveedor:** Supabase
**Proyecto:** Daniel-Visit
**URL:** `postgresql://postgres.pchttmjsbxqaedszjaje:n2piyteoknP08FN6@aws-0-us-east-2.pooler.supabase.com:5432/postgres`
**Estado:** 🚧 **EN MIGRACIÓN** - Tabla por tabla desde SQLite

### Tablas migradas (✅ ESQUEMAS EXACTOS):
- ✅ `asignatura` (13 registros) - Schema verificado
- ✅ `nivel` (12 registros) - Schema verificado
- ✅ `metodologia` (12 registros) - Schema verificado
- ✅ `oa` (74 registros) - Schema verificado

### Próximas tablas a migrar:
- 🚧 `asignatura_nivel` (2 registros)
- 🚧 `MatrizEspecificacion`
- 🚧 `Evaluacion`
- 🚧 `Alumno`
- 🚧 `Profesor`

## Configuración Prisma

### Schema Principal (SQLite)
**Archivo:** `prisma/schema.prisma`
**Datasource:** `env("DATABASE_URL")` → `file:./dev.db` (pero Prisma Studio usa `prisma/dev.db`)

### Schema PostgreSQL (Migración)
**Archivo:** `prisma/schema-postgresql.prisma`
**Datasource:** `env("DATABASE_URL_POSTGRES")` → Supabase

## Variables de Entorno
```bash
# SQLite (base principal)
DATABASE_URL="file:./dev.db"

# PostgreSQL (migración)
DATABASE_URL_POSTGRES="postgresql://postgres.pchttmjsbxqaedszjaje:n2piyteoknP08FN6@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
```

## Comandos Importantes

### Verificar datos SQLite (base correcta)
```bash
sqlite3 prisma/dev.db "SELECT * FROM metodologia;"
```

### Verificar datos PostgreSQL
```bash
# Usar script con DATABASE_URL_POSTGRES
node verificar-postgresql.js
```

### Prisma Studio
```bash
npx prisma studio  # Usa prisma/dev.db automáticamente
```

### Verificar esquemas exactos
```bash
# SQLite
sqlite3 prisma/dev.db ".schema tabla"

# PostgreSQL
npx prisma db pull --schema=prisma/schema-postgresql.prisma
```

---
**Última actualización:** Julio 2025
**Estado:** 4 tablas migradas con esquemas exactos verificados 