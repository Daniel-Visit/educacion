# Migración de SQLite a PostgreSQL

Este directorio contiene todos los scripts utilizados para migrar la base de datos de SQLite a PostgreSQL (Supabase).

## Archivos de Migración

### Scripts de Migración Principal
- `migrar-asignatura-postgres.js` - Migración de asignaturas
- `migrar-asignatura-nivel-postgresql.js` - Migración de asignatura_nivel
- `migrar-oa-postgresql.js` - Migración de OAs
- `migrar-metodologia-postgresql.js` - Migración de metodologías
- `migrar-matriz-especificacion-postgresql.js` - Migración de matrices de especificación
- `migrar-horario-postgresql.js` - Migración de horarios
- `migrar-profesor-postgresql.js` - Migración de profesores
- `migrar-archivo-postgresql.js` - Migración de archivos
- `migrar-evaluacion-postgresql.js` - Migración de evaluaciones
- `migrar-alumno-postgresql.js` - Migración de alumnos
- `migrar-resultado-evaluacion-postgresql.js` - Migración de resultados de evaluaciones
- `migrar-pregunta-indicador-postgresql.js` - Migración de pregunta_indicador

### Scripts de Corrección
- `corregir-metodologia-postgresql.js` - Corrección de datos de metodología

### Scripts de Verificación
- `verificar-tablas-postgresql.js` - Verificación de tablas en PostgreSQL
- `verificar-*.js` - Otros scripts de verificación de datos

## Proceso de Migración

1. **Preparación**: Crear tablas en PostgreSQL usando `prisma db push`
2. **Migración de Datos**: Ejecutar scripts de migración en orden
3. **Verificación**: Usar scripts de verificación para confirmar datos
4. **Relaciones**: Agregar foreign keys y relaciones
5. **Configuración Final**: Configurar Prisma para usar PostgreSQL

## Configuración de Conexión

### Variables de Entorno Requeridas
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres?connect_timeout=30"
```

### Notas Importantes
- **Timeout**: Agregar `connect_timeout=30` es crucial para la conexión
- **Pooler**: Usar puerto 6543 para conexión principal, 5432 para migraciones
- **Data API**: Desactivar la Data API de Supabase cuando se usa solo Prisma

## Estado Final
✅ **Migración Completada**: Todos los datos migrados exitosamente
✅ **Relaciones Configuradas**: Foreign keys y relaciones agregadas
✅ **Aplicación Funcionando**: App conectada a PostgreSQL 