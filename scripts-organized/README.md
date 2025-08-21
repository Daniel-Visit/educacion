# Scripts Organizados

Esta carpeta contiene todos los scripts del proyecto organizados por categorías.

## 📁 Estructura

### 🔐 `auth/` - Scripts de Autenticación

- `test-auth-redis.js` - Test de funciones de Redis para auth
- `test-jwt-generation.js` - Test de generación de JWT
- `test-redis-functions.js` - Test completo de funciones Redis
- `debug-redis-issues.js` - Debug de problemas de Redis

### 🗄️ `database/` - Scripts de Base de Datos

- `seed-roles.js` - Poblar roles de usuario
- `seed.ts` - Seed principal de la base de datos

### 🧪 `testing/` - Scripts de Testing

- Tests de API (horarios, matrices, niveles, etc.)
- Tests de integración
- Tests de modelos

### 💾 `backup/` - Scripts de Backup y Restauración

- Scripts de backup de tablas
- Scripts de restauración de datos
- Scripts de verificación de backups

### 🛠️ `utils/` - Scripts Utilitarios

- Verificación de datos
- Fixes de secuencias
- Herramientas de desarrollo
- Scripts de configuración

### 🔄 `migration/` - Scripts de Migración

- Migración de SQLite a PostgreSQL
- Scripts de verificación de datos
- Correcciones de estructura

## 🚀 Uso

Para ejecutar un script:

```bash
# Scripts de autenticación
node scripts-organized/auth/test-redis-functions.js

# Scripts de base de datos
node scripts-organized/database/seed-roles.js

# Scripts de testing
node scripts-organized/testing/horarios.test.js
```

## 📝 Notas

- Todos los scripts están organizados por funcionalidad
- Los scripts de la plataforma principal están en `src/`
- Esta carpeta solo contiene herramientas de desarrollo/testing
