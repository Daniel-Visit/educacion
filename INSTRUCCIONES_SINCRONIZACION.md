# 🔄 Instrucciones de Sincronización - Educacion App

## 📋 Requisitos Previos
- Git instalado
- Node.js instalado
- Acceso al repositorio: `https://github.com/Daniel-Visit/educacion.git`

## 🚀 Sincronización Completa del Proyecto

### Opción 1: Si ya tienes el proyecto clonado

```bash
# 1. Navegar al directorio del proyecto
cd /ruta/a/tu/proyecto/educacion-app

# 2. Verificar que estás en la rama correcta
git branch

# 3. Obtener los últimos cambios
git pull origin main

# 4. Instalar/actualizar dependencias
npm install

# 5. Restaurar la base de datos completa
node restore-database.js

# 6. Regenerar el cliente de Prisma
npx prisma generate

# 7. Iniciar el servidor
npm run dev
```

### Opción 2: Si es la primera vez (clonar desde cero)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Daniel-Visit/educacion.git educacion-app

# 2. Navegar al directorio
cd educacion-app

# 3. Instalar dependencias
npm install

# 4. Restaurar la base de datos completa
node restore-database.js

# 5. Regenerar el cliente de Prisma
npx prisma generate

# 6. Iniciar el servidor
npm run dev
```

## 🔧 Comandos Útiles

### Verificar el estado del repositorio
```bash
git status
git log --oneline -5
```

### Si hay conflictos
```bash
# Ver conflictos
git status

# Resolver conflictos manualmente, luego:
git add .
git commit -m "Resuelto conflicto"
```

### Backup manual de la base de datos actual
```bash
# Crear backup antes de restaurar
cp prisma/dev.db prisma/dev_backup_manual_$(date +%Y%m%d_%H%M%S).db
```

## 📁 Archivos Importantes

- `prisma/database_complete_backup_*.db` - Backup completo de la base de datos
- `restore-database.js` - Script de restauración automática
- `prisma/schema.prisma` - Esquema de la base de datos
- `package.json` - Dependencias del proyecto

## ⚠️ Notas Importantes

1. **El script `restore-database.js` es seguro**: Siempre crea un backup antes de restaurar
2. **No ejecutes migraciones**: La base de datos ya está completa y actualizada
3. **Archivos locales**: `application.properties` debe permanecer local (no se sube a Git)
4. **Puerto por defecto**: El servidor se ejecuta en `http://localhost:3000`

## 🆘 Solución de Problemas

### Error: "No se encontraron archivos de backup"
```bash
# Verificar que el pull se ejecutó correctamente
git status
git pull origin main
```

### Error: "Permission denied"
```bash
# Dar permisos de ejecución al script
chmod +x restore-database.js
```

### Error: "Database is locked"
```bash
# Detener el servidor si está corriendo
# Luego ejecutar el script de restauración
```

## 📞 Contacto
Si tienes problemas, verifica:
1. Que tienes acceso al repositorio
2. Que Node.js está instalado correctamente
3. Que todas las dependencias están instaladas

---
**Última actualización**: $(date +%Y-%m-%d)
**Versión del backup**: database_complete_backup_20250715_105227.db 