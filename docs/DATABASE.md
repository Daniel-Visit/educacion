# 🗄️ Base de Datos - Plataforma Educativa

## Descripción General

La plataforma educativa utiliza SQLite como base de datos principal con Prisma ORM para la gestión de datos. La base de datos contiene información educativa completa del currículum chileno, contenido generado por usuarios y configuraciones del sistema.

## 🛠️ Tecnologías

- **Base de Datos:** SQLite 3
- **ORM:** Prisma 6.11.0
- **Migraciones:** Prisma Migrate
- **Cliente:** @prisma/client

## 📊 Estructura de la Base de Datos

### Esquema Principal

```sql
-- Tablas principales del sistema educativo
asignatura          -- Asignaturas del currículum
nivel              -- Niveles educativos
metodologia        -- Metodologías de enseñanza
oa                 -- Objetivos de Aprendizaje

-- Tablas de gestión de contenido
Archivo            -- Archivos del editor
Imagen             -- Imágenes subidas
ArchivoImagen      -- Relación muchos a muchos

-- Tablas de matrices de especificación
MatrizEspecificacion -- Matrices de evaluación
MatrizOA            -- Relación matriz-OA
Indicador           -- Indicadores por OA
```

## 🏗️ Tablas Detalladas

### 📚 Tablas Educativas

#### `asignatura`
```sql
CREATE TABLE asignatura (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL
);
```

**Datos incluidos:**
- 13 asignaturas del currículum chileno
- Artes Visuales, Ciencias Naturales, Educación Física, etc.

#### `nivel`
```sql
CREATE TABLE nivel (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL
);
```

**Datos incluidos:**
- 12 niveles educativos
- 1° Básico a 8° Básico
- 1° Medio a 4° Medio

#### `metodologia`
```sql
CREATE TABLE metodologia (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_metodologia TEXT UNIQUE NOT NULL,
  descripcion        TEXT NOT NULL,
  nivel_recomendado  TEXT NOT NULL,
  fuentes_literatura TEXT NOT NULL
);
```

**Datos incluidos:**
- 12 metodologías de enseñanza
- ABP, Aula Invertida, Gamificación, etc.
- Descripciones detalladas y fuentes bibliográficas

#### `oa` (Objetivos de Aprendizaje)
```sql
CREATE TABLE oa (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nivel_id        INTEGER NOT NULL,
  asignatura_id   INTEGER NOT NULL,
  eje_id          INTEGER NOT NULL,
  eje_descripcion TEXT NOT NULL,
  oas_id          TEXT NOT NULL,
  descripcion_oas TEXT NOT NULL,
  basal           BOOLEAN NOT NULL,
  minimo_clases   INTEGER NOT NULL,
  FOREIGN KEY (nivel_id) REFERENCES nivel(id),
  FOREIGN KEY (asignatura_id) REFERENCES asignatura(id)
);
```

**Datos incluidos:**
- 37 Objetivos de Aprendizaje
- Organizados por nivel y asignatura
- Incluyen ejes temáticos y descripciones detalladas

### 📁 Tablas de Contenido

#### `Archivo`
```sql
CREATE TABLE Archivo (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo    TEXT NOT NULL,
  tipo      TEXT NOT NULL, -- 'planificacion' | 'material'
  contenido TEXT NOT NULL, -- JSON de TipTap
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:**
- Almacenar planificaciones y materiales del editor
- Contenido en formato JSON de TipTap
- Metadatos de creación y actualización

#### `Imagen`
```sql
CREATE TABLE Imagen (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre    TEXT NOT NULL,
  tipo      TEXT NOT NULL, -- MIME type
  data      TEXT NOT NULL, -- Base64 encoded
  tamaño    INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:**
- Almacenar imágenes subidas por usuarios
- Formato Base64 para fácil acceso
- Metadatos de tamaño y tipo

#### `ArchivoImagen`
```sql
CREATE TABLE ArchivoImagen (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  archivoId INTEGER NOT NULL,
  imagenId  INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (archivoId) REFERENCES Archivo(id) ON DELETE CASCADE,
  FOREIGN KEY (imagenId) REFERENCES Imagen(id) ON DELETE CASCADE,
  UNIQUE(archivoId, imagenId)
);
```

**Propósito:**
- Relación muchos a muchos entre archivos e imágenes
- Permite múltiples imágenes por archivo
- Eliminación en cascada

### 🎯 Tablas de Matrices

#### `MatrizEspecificacion`
```sql
CREATE TABLE MatrizEspecificacion (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre          TEXT NOT NULL,
  total_preguntas INTEGER NOT NULL,
  createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:**
- Definir matrices de especificación para evaluaciones
- Estructura jerárquica de OAs e indicadores

#### `MatrizOA`
```sql
CREATE TABLE MatrizOA (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  matrizId INTEGER NOT NULL,
  oaId     INTEGER NOT NULL,
  FOREIGN KEY (matrizId) REFERENCES MatrizEspecificacion(id) ON DELETE CASCADE,
  FOREIGN KEY (oaId) REFERENCES oa(id) ON DELETE CASCADE
);
```

**Propósito:**
- Asociar OAs específicos a cada matriz
- Relación muchos a muchos

#### `Indicador`
```sql
CREATE TABLE Indicador (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  matrizOAId  INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  preguntas   INTEGER NOT NULL,
  FOREIGN KEY (matrizOAId) REFERENCES MatrizOA(id) ON DELETE CASCADE
);
```

**Propósito:**
- Definir indicadores específicos para cada OA en una matriz
- Asignar número de preguntas por indicador

## 🔗 Relaciones entre Tablas

### Diagrama de Relaciones
```
asignatura (1) ←→ (N) oa ←→ (1) nivel
     ↑                                    ↑
     └────────── MatrizOA ←───────────────┘
                        ↓
                 MatrizEspecificacion
                        ↓
                    Indicador

Archivo (N) ←→ (N) Imagen
     ↑              ↑
     └── ArchivoImagen
```

### Claves Foráneas
- `oa.nivel_id` → `nivel.id`
- `oa.asignatura_id` → `asignatura.id`
- `MatrizOA.matrizId` → `MatrizEspecificacion.id`
- `MatrizOA.oaId` → `oa.id`
- `Indicador.matrizOAId` → `MatrizOA.id`
- `ArchivoImagen.archivoId` → `Archivo.id`
- `ArchivoImagen.imagenId` → `Imagen.id`

## 📈 Datos Iniciales

### Conteo de Registros
```sql
-- Verificar datos cargados
SELECT 'asignatura' as tabla, COUNT(*) as total FROM asignatura
UNION ALL
SELECT 'nivel', COUNT(*) FROM nivel
UNION ALL
SELECT 'metodologia', COUNT(*) FROM metodologia
UNION ALL
SELECT 'oa', COUNT(*) FROM oa;
```

**Resultado esperado:**
- asignatura: 13 registros
- nivel: 12 registros
- metodologia: 12 registros
- oa: 37 registros

### Scripts de Restauración
```bash
# Restaurar todos los datos
node scripts-restauracion/restore-all-data.js

# Restaurar solo OAs
node scripts-restauracion/restore-oas.js

# Restaurar archivos de ejemplo
node scripts-restauracion/restore-archivos-ejemplo.js
```

## 🔧 Configuración de Prisma

### `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Modelos de la base de datos...
```

### Variables de Entorno
```env
# .env
DATABASE_URL="file:./dev.db"
```

## 🚀 Comandos de Base de Datos

### Desarrollo
```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma db push

# Ver interfaz visual
npx prisma studio

# Crear migración
npx prisma migrate dev --name nombre_migracion
```

### Producción
```bash
# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar cliente para producción
npx prisma generate
```

## 📊 Consultas Útiles

### Consultas de Verificación
```sql
-- Verificar integridad de datos
SELECT 
  a.nombre as asignatura,
  n.nombre as nivel,
  COUNT(o.id) as total_oas
FROM asignatura a
JOIN oa o ON a.id = o.asignatura_id
JOIN nivel n ON o.nivel_id = n.id
GROUP BY a.id, n.id
ORDER BY a.nombre, n.nombre;

-- Ver archivos por tipo
SELECT 
  tipo,
  COUNT(*) as total,
  AVG(LENGTH(contenido)) as avg_size
FROM Archivo
GROUP BY tipo;

-- Ver imágenes por tipo
SELECT 
  tipo,
  COUNT(*) as total,
  AVG(tamaño) as avg_size_bytes
FROM Imagen
GROUP BY tipo;
```

### Consultas de Mantenimiento
```sql
-- Limpiar imágenes huérfanas
DELETE FROM Imagen 
WHERE id NOT IN (SELECT imagenId FROM ArchivoImagen);

-- Verificar archivos sin imágenes
SELECT * FROM Archivo 
WHERE id NOT IN (SELECT archivoId FROM ArchivoImagen);

-- Estadísticas de uso
SELECT 
  DATE(createdAt) as fecha,
  COUNT(*) as archivos_creados
FROM Archivo
GROUP BY DATE(createdAt)
ORDER BY fecha DESC;
```

## 🔒 Seguridad y Respaldo

### Respaldo Automático
```bash
# Crear respaldo con timestamp
cp prisma/dev.db prisma/dev_backup_$(date +%Y%m%d_%H%M%S).db

# Listar respaldos
ls -la prisma/*.db
```

### Validaciones de Integridad
```sql
-- Verificar claves foráneas
PRAGMA foreign_key_check;

-- Verificar integridad de la base
PRAGMA integrity_check;
```

### Límites de Tamaño
- **Archivos:** Máximo 10MB por archivo
- **Imágenes:** Máximo 5MB por imagen
- **Base de datos:** Sin límite práctico (SQLite)

## 📈 Optimización

### Índices Recomendados
```sql
-- Índices para mejorar rendimiento
CREATE INDEX idx_oa_nivel_asignatura ON oa(nivel_id, asignatura_id);
CREATE INDEX idx_archivo_tipo ON Archivo(tipo);
CREATE INDEX idx_archivo_created ON Archivo(createdAt);
CREATE INDEX idx_imagen_tipo ON Imagen(tipo);
```

### Configuración de SQLite
```sql
-- Optimizaciones de rendimiento
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de migración:**
```bash
# Resetear base de datos
npx prisma migrate reset
npx prisma db push
```

2. **Cliente Prisma desactualizado:**
```bash
# Regenerar cliente
npx prisma generate
```

3. **Datos corruptos:**
```bash
# Restaurar desde respaldo
cp prisma/dev_backup_YYYYMMDD_HHMMSS.db prisma/dev.db
```

### Logs de Debug
```bash
# Ver logs de Prisma
DEBUG=prisma:* npm run dev

# Verificar conexión
npx prisma studio
```

## 🔮 Mejoras Futuras

- [ ] Migración a PostgreSQL para producción
- [ ] Replicación de datos
- [ ] Backup automático en la nube
- [ ] Compresión de datos históricos
- [ ] Particionamiento de tablas grandes
- [ ] Auditoría de cambios
- [ ] Encriptación de datos sensibles
- [ ] Cache distribuido
- [ ] Monitoreo de rendimiento
- [ ] Optimización automática de consultas 