# 🗄️ Base de Datos Actualizada - Plataforma Educativa

## 📊 **ESTADO ACTUAL - Julio 2025**

La base de datos ha experimentado una **expansión significativa** con la adición de sistemas completos para gestión de profesores, horarios, planificación anual y resultados de evaluaciones.

## 🏗️ **ESQUEMA COMPLETO ACTUALIZADO**

### **Tablas Educativas Básicas**

```sql
-- Asignaturas del currículum chileno
asignatura (13 registros)
├── id: INTEGER PRIMARY KEY
├── nombre: TEXT UNIQUE
└── relaciones: matrices, horarios, oas, profesores

-- Niveles educativos
nivel (12 registros)
├── id: INTEGER PRIMARY KEY
├── nombre: TEXT UNIQUE
└── relaciones: matrices, alumnos, horarios, oas, profesores

-- Metodologías de enseñanza
metodologia (12 registros)
├── id: INTEGER PRIMARY KEY
├── nombre_metodologia: TEXT UNIQUE
├── descripcion: TEXT
├── nivel_recomendado: TEXT
└── fuentes_literatura: TEXT

-- Objetivos de Aprendizaje
oa (37 registros)
├── id: INTEGER PRIMARY KEY
├── nivel_id: INTEGER FK
├── asignatura_id: INTEGER FK
├── eje_id: INTEGER
├── eje_descripcion: TEXT
├── oas_id: TEXT
├── descripcion_oas: TEXT
├── basal: BOOLEAN
├── minimo_clases: INTEGER
└── relaciones: asignatura, nivel, asignaciones
```

### **Sistema de Matrices de Especificación**

```sql
-- Matrices de especificación
MatrizEspecificacion
├── id: INTEGER PRIMARY KEY
├── nombre: TEXT
├── total_preguntas: INTEGER
├── asignatura_id: INTEGER FK ⭐ NUEVO
├── nivel_id: INTEGER FK ⭐ NUEVO
├── createdAt: DATETIME
└── relaciones: asignatura, nivel, evaluaciones, oas

-- Relación matriz-OA
MatrizOA
├── id: INTEGER PRIMARY KEY
├── matrizId: INTEGER FK
├── oaId: INTEGER FK
└── relaciones: matriz, indicadores

-- Indicadores por OA
Indicador
├── id: INTEGER PRIMARY KEY
├── matrizOAId: INTEGER FK
├── descripcion: TEXT
├── preguntas: INTEGER
└── relaciones: matrizOA
```

### **Sistema de Contenido (Editor)**

```sql
-- Archivos del editor
Archivo
├── id: INTEGER PRIMARY KEY
├── titulo: TEXT
├── tipo: TEXT ('planificacion' | 'material' | 'evaluacion')
├── contenido: TEXT (JSON TipTap)
├── createdAt: DATETIME
├── updatedAt: DATETIME ⭐ NUEVO
└── relaciones: imagenes, evaluaciones

-- Imágenes subidas
Imagen
├── id: INTEGER PRIMARY KEY
├── nombre: TEXT
├── tipo: TEXT (MIME type)
├── data: TEXT (Base64)
├── tamaño: INTEGER
├── createdAt: DATETIME
└── relaciones: archivos

-- Relación archivo-imagen
ArchivoImagen
├── id: INTEGER PRIMARY KEY
├── archivoId: INTEGER FK
├── imagenId: INTEGER FK
├── createdAt: DATETIME
└── relaciones: archivo, imagen (CASCADE DELETE)
```

### **Sistema de Profesores ⭐ NUEVO**

```sql
-- Profesores
Profesor
├── id: INTEGER PRIMARY KEY
├── rut: TEXT UNIQUE
├── nombre: TEXT
├── email: TEXT
├── telefono: TEXT
├── fechaNacimiento: DATETIME
├── createdAt: DATETIME
├── updatedAt: DATETIME
└── relaciones: horarios, modulos, asignaturas, niveles

-- Relación profesor-asignatura
ProfesorAsignatura
├── id: INTEGER PRIMARY KEY
├── profesorId: INTEGER FK
├── asignaturaId: INTEGER FK
└── relaciones: profesor, asignatura (CASCADE DELETE)

-- Relación profesor-nivel
ProfesorNivel
├── id: INTEGER PRIMARY KEY
├── profesorId: INTEGER FK
├── nivelId: INTEGER FK
└── relaciones: profesor, nivel (CASCADE DELETE)
```

### **Sistema de Horarios ⭐ NUEVO**

```sql
-- Horarios docentes
Horario
├── id: INTEGER PRIMARY KEY
├── nombre: TEXT
├── docenteId: INTEGER FK
├── asignaturaId: INTEGER FK
├── nivelId: INTEGER FK
├── fechaPrimeraClase: DATETIME
├── createdAt: DATETIME
├── updatedAt: DATETIME
└── relaciones: profesor, asignatura, nivel, modulos, planificaciones

-- Módulos horarios
ModuloHorario
├── id: INTEGER PRIMARY KEY
├── horarioId: INTEGER FK
├── dia: TEXT ('Lunes', 'Martes', etc.)
├── horaInicio: TEXT ('08:00', '09:00', etc.)
├── duracion: INTEGER (minutos)
├── orden: INTEGER
└── relaciones: horario, asignaciones, profesores

-- Profesores por módulo
ModuloHorarioProfesor
├── id: INTEGER PRIMARY KEY
├── moduloHorarioId: INTEGER FK
├── profesorId: INTEGER FK
├── rol: TEXT ('titular' | 'ayudante')
└── relaciones: moduloHorario, profesor (CASCADE DELETE)
```

### **Sistema de Planificación Anual ⭐ NUEVO**

```sql
-- Planificaciones anuales
PlanificacionAnual
├── id: INTEGER PRIMARY KEY
├── nombre: TEXT
├── horarioId: INTEGER FK
├── ano: INTEGER
├── createdAt: DATETIME
├── updatedAt: DATETIME
└── relaciones: horario, asignaciones

-- Asignaciones de OAs
AsignacionOA
├── id: INTEGER PRIMARY KEY
├── planificacionId: INTEGER FK (opcional)
├── moduloHorarioId: INTEGER FK (opcional)
├── oaId: INTEGER FK
├── cantidadClases: INTEGER DEFAULT 1
├── createdAt: DATETIME
├── updatedAt: DATETIME
└── relaciones: planificacion, moduloHorario, oa (CASCADE DELETE)
```

### **Sistema de Evaluaciones**

```sql
-- Evaluaciones
Evaluacion
├── id: INTEGER PRIMARY KEY
├── archivoId: INTEGER FK
├── matrizId: INTEGER FK
├── createdAt: DATETIME
├── updatedAt: DATETIME ⭐ NUEVO
└── relaciones: archivo, matriz, preguntas, resultados

-- Preguntas de evaluación
Pregunta
├── id: INTEGER PRIMARY KEY
├── evaluacionId: INTEGER FK
├── numero: INTEGER
├── texto: TEXT
└── relaciones: evaluacion, alternativas, respuestas

-- Alternativas de preguntas
Alternativa
├── id: INTEGER PRIMARY KEY
├── preguntaId: INTEGER FK
├── letra: TEXT ('A', 'B', 'C', 'D')
├── texto: TEXT
├── esCorrecta: BOOLEAN DEFAULT false
└── relaciones: pregunta
```

### **Sistema de Resultados de Evaluaciones ⭐ NUEVO**

```sql
-- Cargas de resultados
ResultadoEvaluacion
├── id: INTEGER PRIMARY KEY
├── nombre: TEXT
├── evaluacionId: INTEGER FK
├── fechaCarga: DATETIME
├── totalAlumnos: INTEGER
├── escalaNota: REAL DEFAULT 7.0
└── relaciones: evaluacion, resultados

-- Alumnos
Alumno
├── id: INTEGER PRIMARY KEY
├── rut: TEXT UNIQUE
├── nombre: TEXT
├── apellido: TEXT
├── curso: TEXT
├── nivelId: INTEGER FK
├── createdAt: DATETIME
├── updatedAt: DATETIME
└── relaciones: nivel, resultados

-- Resultados individuales
ResultadoAlumno
├── id: INTEGER PRIMARY KEY
├── resultadoEvaluacionId: INTEGER FK
├── alumnoId: INTEGER FK
├── puntajeTotal: REAL
├── puntajeMaximo: REAL
├── porcentaje: REAL
├── nota: REAL
└── relaciones: resultadoEvaluacion, alumno, respuestas (CASCADE DELETE)

-- Respuestas detalladas
RespuestaAlumno
├── id: INTEGER PRIMARY KEY
├── resultadoAlumnoId: INTEGER FK
├── preguntaId: INTEGER FK
├── alternativaDada: TEXT
├── esCorrecta: BOOLEAN
├── puntajeObtenido: REAL
└── relaciones: resultadoAlumno, pregunta (CASCADE DELETE)
```

## 🔗 **RELACIONES COMPLETAS**

### **Diagrama de Relaciones Principales**

```
asignatura (1) ←→ (N) oa ←→ (1) nivel
     ↑                                    ↑
     └────────── MatrizOA ←───────────────┘
                        ↓
                 MatrizEspecificacion
                        ↓
                    Indicador

Profesor (1) ←→ (N) Horario ←→ (1) asignatura
     ↑              ↑              ↑
     └──────────────┴──────────────┘
                        ↓
                 ModuloHorario
                        ↓
              ModuloHorarioProfesor

Horario (1) ←→ (N) PlanificacionAnual
                        ↓
                   AsignacionOA
                        ↓
                        oa

Evaluacion (1) ←→ (N) Pregunta ←→ (N) Alternativa
     ↓
ResultadoEvaluacion (1) ←→ (N) ResultadoAlumno
                                    ↓
                              RespuestaAlumno

Archivo (N) ←→ (N) Imagen
     ↑              ↑
     └── ArchivoImagen
```

### **Claves Foráneas y Constraints**

- **CASCADE DELETE:** ArchivoImagen, ProfesorAsignatura, ProfesorNivel, ModuloHorarioProfesor, AsignacionOA, ResultadoAlumno, RespuestaAlumno
- **RESTRICT DELETE:** Evaluacion → Archivo, Evaluacion → MatrizEspecificacion
- **UNIQUE Constraints:**
  - `profesor.rut`
  - `alumno.rut`
  - `profesor_asignatura(profesorId, asignaturaId)`
  - `profesor_nivel(profesorId, nivelId)`
  - `modulo_horario_profesor(moduloHorarioId, profesorId, rol)`
  - `archivo_imagen(archivoId, imagenId)`

## 📈 **ESTADÍSTICAS DE LA BASE DE DATOS**

### **Conteo de Registros**

```sql
-- Verificar datos cargados
SELECT 'asignatura' as tabla, COUNT(*) as total FROM asignatura
UNION ALL
SELECT 'nivel', COUNT(*) FROM nivel
UNION ALL
SELECT 'metodologia', COUNT(*) FROM metodologia
UNION ALL
SELECT 'oa', COUNT(*) FROM oa
UNION ALL
SELECT 'profesor', COUNT(*) FROM profesor
UNION ALL
SELECT 'alumno', COUNT(*) FROM alumno;
```

**Resultado esperado:**

- asignatura: 13 registros
- nivel: 12 registros
- metodologia: 12 registros
- oa: 37 registros
- profesor: Variable (depende de uso)
- alumno: Variable (depende de cargas de resultados)

### **Índices de Rendimiento**

```sql
-- Índices automáticos creados por Prisma
CREATE INDEX "alumno_nivelId_idx" ON "alumno"("nivelId");
CREATE INDEX "ResultadoAlumno_alumnoId_idx" ON "ResultadoAlumno"("alumnoId");
CREATE INDEX "ResultadoAlumno_resultadoEvaluacionId_idx" ON "ResultadoAlumno"("resultadoEvaluacionId");
CREATE INDEX "RespuestaAlumno_resultadoAlumnoId_idx" ON "RespuestaAlumno"("resultadoAlumnoId");
CREATE INDEX "RespuestaAlumno_preguntaId_idx" ON "RespuestaAlumno"("preguntaId");
CREATE INDEX "ResultadoEvaluacion_evaluacionId_idx" ON "ResultadoEvaluacion"("evaluacionId");
```

## 🔧 **CONFIGURACIÓN DE PRISMA**

### **Cliente Prisma Configurado**

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### **Variables de Entorno**

```env
# .env
DATABASE_URL="file:./dev.db"
```

## 🚀 **COMANDOS DE BASE DE DATOS**

### **Desarrollo**

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

### **Producción**

```bash
# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar cliente para producción
npx prisma generate
```

## 📊 **CONSULTAS ÚTILES**

### **Consultas de Verificación**

```sql
-- Verificar integridad de datos educativos
SELECT
  a.nombre as asignatura,
  n.nombre as nivel,
  COUNT(o.id) as total_oas
FROM asignatura a
JOIN oa o ON a.id = o.asignatura_id
JOIN nivel n ON o.nivel_id = n.id
GROUP BY a.id, n.id
ORDER BY a.nombre, n.nombre;

-- Ver horarios por profesor
SELECT
  p.nombre as profesor,
  h.nombre as horario,
  a.nombre as asignatura,
  n.nombre as nivel,
  COUNT(mh.id) as total_modulos
FROM profesor p
JOIN horario h ON p.id = h.docenteId
JOIN asignatura a ON h.asignaturaId = a.id
JOIN nivel n ON h.nivelId = n.id
LEFT JOIN modulo_horario mh ON h.id = mh.horarioId
GROUP BY p.id, h.id
ORDER BY p.nombre, h.nombre;

-- Ver resultados de evaluaciones
SELECT
  re.nombre as carga_resultados,
  e.archivoId,
  re.totalAlumnos,
  re.fechaCarga,
  AVG(ra.puntajeTotal) as promedio_puntaje
FROM ResultadoEvaluacion re
JOIN evaluacion e ON re.evaluacionId = e.id
JOIN ResultadoAlumno ra ON re.id = ra.resultadoEvaluacionId
GROUP BY re.id
ORDER BY re.fechaCarga DESC;
```

### **Consultas de Mantenimiento**

```sql
-- Limpiar imágenes huérfanas
DELETE FROM Imagen
WHERE id NOT IN (SELECT imagenId FROM ArchivoImagen);

-- Verificar archivos sin imágenes
SELECT * FROM Archivo
WHERE id NOT IN (SELECT archivoId FROM ArchivoImagen);

-- Estadísticas de uso por módulo
SELECT
  DATE(createdAt) as fecha,
  COUNT(*) as archivos_creados
FROM Archivo
GROUP BY DATE(createdAt)
ORDER BY fecha DESC;

-- Verificar integridad de horarios
SELECT
  h.nombre as horario,
  COUNT(mh.id) as modulos,
  COUNT(DISTINCT mhp.profesorId) as profesores_asignados
FROM horario h
LEFT JOIN modulo_horario mh ON h.id = mh.horarioId
LEFT JOIN modulo_horario_profesor mhp ON mh.id = mhp.moduloHorarioId
GROUP BY h.id
HAVING modulos = 0 OR profesores_asignados = 0;
```

## 🔒 **SEGURIDAD Y RESPALDO**

### **Respaldo Automático**

```bash
# Crear respaldo con timestamp
cp prisma/dev.db prisma/dev_backup_$(date +%Y%m%d_%H%M%S).db

# Listar respaldos
ls -la prisma/*.db
```

### **Validaciones de Integridad**

```sql
-- Verificar claves foráneas
PRAGMA foreign_key_check;

-- Verificar integridad de la base
PRAGMA integrity_check;
```

### **Límites de Tamaño**

- **Archivos:** Máximo 10MB por archivo
- **Imágenes:** Máximo 5MB por imagen
- **Base de datos:** Sin límite práctico (SQLite)

## 📈 **OPTIMIZACIÓN**

### **Índices Recomendados**

```sql
-- Índices para mejorar rendimiento
CREATE INDEX idx_oa_nivel_asignatura ON oa(nivel_id, asignatura_id);
CREATE INDEX idx_archivo_tipo ON Archivo(tipo);
CREATE INDEX idx_archivo_created ON Archivo(createdAt);
CREATE INDEX idx_imagen_tipo ON Imagen(tipo);
CREATE INDEX idx_horario_docente ON horario(docenteId);
CREATE INDEX idx_modulo_horario_dia ON modulo_horario(dia);
CREATE INDEX idx_resultado_evaluacion_fecha ON ResultadoEvaluacion(fechaCarga);
```

### **Configuración de SQLite**

```sql
-- Optimizaciones de rendimiento
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

## 🐛 **TROUBLESHOOTING**

### **Problemas Comunes**

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

### **Logs de Debug**

```bash
# Ver logs de Prisma
DEBUG=prisma:* npm run dev

# Verificar conexión
npx prisma studio
```

## 🔮 **MEJORAS FUTURAS**

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

---

**Última actualización:** Julio 2025  
**Versión de base de datos:** 3.0 (Sistema completo)  
**Mantenido por:** Equipo de Desarrollo
