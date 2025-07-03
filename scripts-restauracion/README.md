# Scripts de Restauración de Base de Datos

Esta carpeta contiene todos los archivos necesarios para restaurar la base de datos en caso de pérdida de datos.

## Archivos incluidos:

### Scripts de Restauración:
- `restore-all-data.js` - Restaura TODOS los datos (asignaturas, niveles, metodologías, OAs)
- `restore-oas.js` - Restaura SOLO los OAs (si las otras tablas ya están bien)
- `restore-archivos-ejemplo.js` - Restaura los archivos de ejemplo del editor

### Datos fuente:
- `Asignaturas.csv` - Lista de asignaturas
- `Niveles.csv` - Lista de niveles educativos
- `metodologias.csv` - Metodologías de enseñanza
- `OAS.csv` - Objetivos de Aprendizaje

## Instrucciones de uso:

### Restaurar todo desde cero:
```bash
node restore-all-data.js
```

### Restaurar solo OAs (si el resto ya está bien):
```bash
node restore-oas.js
```

### Restaurar archivos de ejemplo:
```bash
node restore-archivos-ejemplo.js
```

## Orden recomendado de restauración:

1. **Si la base está completamente vacía:** Usar `restore-all-data.js`
2. **Si solo faltan OAs:** Usar `restore-oas.js`
3. **Si faltan archivos de ejemplo:** Usar `restore-archivos-ejemplo.js`

## Notas importantes:

- Los scripts usan `csv-parse/sync` con delimitador `;` para archivos CSV
- Los scripts manejan errores de duplicados automáticamente
- Siempre hacer respaldo antes de restaurar: `cp prisma/dev.db prisma/dev_backup_$(date +%Y%m%d_%H%M%S).db`

## Verificación de datos:

Después de restaurar, verificar con:
```bash
sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM asignatura;'  # Debe ser 13
sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM nivel;'       # Debe ser 12
sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM metodologia;' # Debe ser 12
sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM oa;'          # Debe ser 37
sqlite3 prisma/dev.db 'SELECT COUNT(*) FROM archivo;'     # Debe ser 2 (ejemplos)
``` 