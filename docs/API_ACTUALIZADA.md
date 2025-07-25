# 🔌 APIs Actualizadas - Plataforma Educativa

## 📊 **ESTADO ACTUAL - Julio 2025**

La plataforma cuenta con **13 APIs principales** que cubren todos los aspectos del sistema educativo, incluyendo las nuevas funcionalidades de gestión de profesores, horarios, planificación anual y resultados de evaluaciones.

## 🚨 **LEcciones Aprendidas - APIs**

### ⚠️ **PRINCIPIOS FUNDAMENTALES (NO VIOLAR)**

#### 1. **Estructura de Respuestas Consistente**
**Regla de Oro:** Los endpoints GET deben devolver SIEMPRE arrays directos, nunca objetos.

```typescript
// ✅ CORRECTO - GET devuelve array directo
export async function GET() {
  try {
    const data = await getData()
    return NextResponse.json(data) // Array directo
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json([]) // Array vacío en error
  }
}

// ❌ INCORRECTO - GET devuelve objeto
export async function GET() {
  try {
    const data = await getData()
    return NextResponse.json({ data: data }) // Objeto con data
  } catch (error) {
    return NextResponse.json({ error: 'Error' }) // Objeto de error
  }
}
```

#### 2. **Manejo de Errores Frontend-Friendly**
**Regla:** Los errores no deben romper el frontend, deben devolver arrays vacíos.

```typescript
// ✅ CORRECTO - Error handling que no rompe frontend
export async function GET() {
  try {
    const data = await getData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener datos:', error)
    return NextResponse.json([]) // Array vacío, no objeto de error
  }
}
```

#### 3. **Nombres de Relaciones Prisma**
**Regla:** Usar SIEMPRE los nombres exactos del schema, no los generados por el cliente.

```typescript
// ✅ CORRECTO - Nombres del schema
const evaluaciones = await prisma.evaluacion.findMany({
  include: {
    archivo: true,        // Del schema
    matriz: true,         // Del schema
    preguntas: true       // Del schema
  }
})

// ❌ INCORRECTO - Nombres del cliente generado
const evaluaciones = await prisma.evaluacion.findMany({
  include: {
    Archivo: true,        // Del cliente generado
    MatrizEspecificacion: true,  // Del cliente generado
    Pregunta: true        // Del cliente generado
  }
})
```

## 📁 **ESTRUCTURA COMPLETA DE APIS**

```
src/app/api/
├── archivos/                  # Gestión de archivos del editor
│   ├── route.ts              # CRUD de archivos
│   └── [id]/route.ts         # Operaciones por ID
├── imagenes/                  # Gestión de imágenes
│   ├── route.ts              # CRUD de imágenes
│   └── [id]/route.ts         # Servir imágenes
├── matrices/                  # Gestión de matrices
│   ├── route.ts              # CRUD de matrices
│   └── [id]/route.ts         # Operaciones por ID
├── evaluaciones/              # Sistema de evaluaciones
│   ├── route.ts              # CRUD de evaluaciones
│   ├── [id]/route.ts         # Operaciones por ID
│   ├── [id]/preguntas/       # Obtener preguntas ⭐ NUEVO
│   ├── [id]/resultados/      # Obtener resultados
│   └── cargar-resultados/    # Cargar CSV ⭐ NUEVO
├── profesores/                # Gestión de profesores ⭐ NUEVO
│   ├── route.ts              # CRUD de profesores
│   └── [id]/route.ts         # Operaciones por ID
├── horarios/                  # Gestión de horarios ⭐ NUEVO
│   ├── route.ts              # CRUD de horarios
│   └── [id]/route.ts         # Operaciones por ID
├── planificaciones/           # Planificación anual ⭐ NUEVO
│   ├── route.ts              # CRUD de planificaciones
│   └── [id]/route.ts         # Operaciones por ID
├── resultados-evaluaciones/   # Resultados generales ⭐ NUEVO
│   └── route.ts              # Listar todas las cargas
├── metodologias/              # Metodologías de enseñanza
│   └── route.ts              # Listar metodologías
├── oas/                       # Objetivos de Aprendizaje
│   └── route.ts              # Listar OAs
├── ejes/                      # OAs agrupados por eje ⭐ NUEVO
│   └── route.ts              # Listar ejes con OAs
├── niveles/                   # Gestión de niveles
│   └── route.ts              # CRUD de niveles
└── asignaturas/               # Gestión de asignaturas
    └── route.ts              # CRUD de asignaturas
```

## 🔧 **CONFIGURACIÓN BASE**

### **Headers Comunes**
```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### **Respuestas de Error**
```typescript
{
  error: string,
  status: number,
  message?: string
}
```

### **Respuestas de Éxito**
```typescript
{
  data: any,
  message?: string,
  status: number
}
```

## 📁 **APIs de Archivos**

### **GET `/api/archivos`**
Obtiene todos los archivos, opcionalmente filtrados por tipo.

**Query Parameters:**
```typescript
{
  tipo?: 'planificacion' | 'material' | 'evaluacion'
}
```

**Response:**
```typescript
{
  id: number
  titulo: string
  tipo: 'planificacion' | 'material' | 'evaluacion'
  contenido: string // JSON de TipTap
  createdAt: string
  updatedAt: string ⭐ NUEVO
}[]
```

**Ejemplo:**
```bash
GET /api/archivos?tipo=planificacion
```

### **POST `/api/archivos`**
Crea un nuevo archivo.

**Request Body:**
```typescript
{
  titulo: string
  tipo: 'planificacion' | 'material' | 'evaluacion'
  contenido: string // JSON de TipTap
}
```

**Response:**
```typescript
{
  id: number
  titulo: string
  tipo: string
  contenido: string
  createdAt: string
  updatedAt: string
}
```

**Ejemplo:**
```bash
POST /api/archivos
Content-Type: application/json

{
  "titulo": "Planificación de Lenguaje",
  "tipo": "planificacion",
  "contenido": "{\"type\":\"doc\",\"content\":[...]}"
}
```

### **PUT `/api/archivos/[id]`**
Actualiza un archivo existente.

**Request Body:**
```typescript
{
  titulo?: string
  contenido?: string
}
```

**Response:**
```typescript
{
  id: number
  titulo: string
  tipo: string
  contenido: string
  createdAt: string
  updatedAt: string
}
```

### **DELETE `/api/archivos/[id]`**
Elimina un archivo y todas sus imágenes asociadas.

**Response:**
```typescript
{
  message: "Archivo eliminado correctamente"
}
```

## 🖼️ **APIs de Imágenes**

### **POST `/api/imagenes`**
Sube una nueva imagen en formato Base64.

**Request Body:**
```typescript
{
  nombre: string
  tipo: string // MIME type (image/jpeg, image/png, etc.)
  data: string // Base64 encoded image
  tamaño: number // Size in bytes
}
```

**Response:**
```typescript
{
  id: number
  nombre: string
  tipo: string
  tamaño: number
  createdAt: string
}
```

**Ejemplo:**
```bash
POST /api/imagenes
Content-Type: application/json

{
  "nombre": "diagrama.png",
  "tipo": "image/png",
  "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "tamaño": 24576
}
```

### **GET `/api/imagenes/[id]`**
Sirve la imagen como respuesta de imagen.

**Response Headers:**
```typescript
{
  'Content-Type': string, // MIME type
  'Cache-Control': 'public, max-age=31536000'
}
```

**Response Body:** Binary image data

### **DELETE `/api/imagenes/[id]`**
Elimina una imagen.

**Response:**
```typescript
{
  message: "Imagen eliminada correctamente"
}
```

## 🎯 **APIs de Matrices**

### **GET `/api/matrices`**
Obtiene todas las matrices con sus OAs asociados.

**Response:**
```typescript
{
  id: number
  nombre: string
  total_preguntas: number
  asignatura_id: number ⭐ NUEVO
  nivel_id: number ⭐ NUEVO
  createdAt: string
  asignatura: {
    id: number
    nombre: string
  }
  nivel: {
    id: number
    nombre: string
  }
  oas: {
    id: number
    oaId: number
    indicadores: {
      id: number
      descripcion: string
      preguntas: number
    }[]
  }[]
}[]
```

### **POST `/api/matrices`**
Crea una nueva matriz con sus OAs e indicadores.

**Request Body:**
```typescript
{
  nombre: string
  total_preguntas: number
  asignatura_id: number ⭐ NUEVO
  nivel_id: number ⭐ NUEVO
  oas: {
    oaId: number
    indicadores: {
      descripcion: string
      preguntas: number
    }[]
  }[]
}
```

**Response:**
```typescript
{
  id: number
  nombre: string
  total_preguntas: number
  asignatura_id: number
  nivel_id: number
  createdAt: string
  oas: MatrizOA[]
}
```

### **PUT `/api/matrices/[id]`**
Actualiza una matriz existente.

**Request Body:**
```typescript
{
  nombre?: string
  total_preguntas?: number
  asignatura_id?: number
  nivel_id?: number
  oas?: MatrizOA[]
}
```

### **DELETE `/api/matrices/[id]`**
Elimina una matriz y todos sus datos asociados.

## 📝 **APIs de Evaluaciones**

### **GET `/api/evaluaciones`**
Obtiene todas las evaluaciones con información básica.

**Response:**
```typescript
{
  id: number
  titulo: string
  matrizNombre: string
  preguntasCount: number
  createdAt: string
}[]
```

### **POST `/api/evaluaciones`**
Crea una nueva evaluación.

**Request Body:**
```typescript
{
  archivoId: number
  matrizId: number
  preguntas: {
    numero: number
    texto: string
    alternativas: {
      letra: string
      texto: string
    }[]
  }[]
  respuestasCorrectas: {
    [preguntaNumero: number]: string
  }
}
```

**Response:**
```typescript
{
  id: number
  archivoId: number
  matrizId: number
  createdAt: string
  preguntas: Pregunta[]
}
```

### **GET `/api/evaluaciones/[id]`**
Obtiene una evaluación específica con todos sus datos.

**Response:**
```typescript
{
  id: number
  archivoId: number
  matrizId: number
  createdAt: string
  updatedAt: string
  archivo: Archivo
  matriz: MatrizEspecificacion
  preguntas: {
    id: number
    numero: number
    texto: string
    alternativas: {
      id: number
      letra: string
      texto: string
      esCorrecta: boolean
    }[]
  }[]
}
```

### **PUT `/api/evaluaciones/[id]`**
Actualiza una evaluación existente.

**Request Body:**
```typescript
{
  contenido?: string // JSON del contenido TipTap
  preguntas?: Pregunta[]
  respuestasCorrectas?: { [preguntaNumero: number]: string }
  matrizId?: number
}
```

**Características:**
- ✅ **Comparación inteligente:** Solo actualiza si las preguntas han cambiado
- ✅ **Transacciones:** Asegura consistencia en eliminación/creación
- ✅ **Eliminación en orden:** RespuestaAlumno → Alternativa → Pregunta
- ✅ **Logging detallado:** Para debugging y monitoreo

### **DELETE `/api/evaluaciones/[id]`**
Elimina una evaluación y sus relaciones.

**Response:**
```typescript
{
  success: true
}
```

### **GET `/api/evaluaciones/[id]/preguntas` ⭐ NUEVO**
Obtiene las preguntas de una evaluación específica.

**Parámetros:**
- `id` (path): ID de la evaluación

**Response:**
```typescript
{
  id: number
  numero: number
  texto: string
}[]
```

**Características:**
- ✅ **Ordenado por:** Número de pregunta
- ✅ **Error handling:** Array vacío en caso de error
- ✅ **Formato consistente:** Array directo (no objeto)
- ✅ **Uso:** Tooltips en página de gráficos de resultados

**Ejemplo de uso:**
```typescript
const response = await fetch(`/api/evaluaciones/${evaluacionId}/preguntas`);
const preguntas = await response.json();
// preguntas es un array de { id, numero, texto }
```

### **GET `/api/evaluaciones/[id]/resultados`**
Obtiene los resultados de una evaluación específica.

**Response:**
```typescript
{
  id: number
  alumno: {
    rut: string
    nombre: string
    apellido: string
  }
  puntajeTotal: number
  puntajeMaximo: number
  porcentaje: number
  nota: number
  respuestas: {
    id: number
    preguntaId: number
    alternativaDada: string
    esCorrecta: boolean
    puntajeObtenido: number
  }[]
}[]
```

### **POST `/api/evaluaciones/cargar-resultados` ⭐ NUEVO**
Carga resultados desde archivo CSV.

**Request Body:** FormData
```typescript
{
  file: File // Archivo CSV
  evaluacionId: string
}
```

**Formato CSV esperado:**
```csv
rut,nombre,apellido,preguntaId,alternativaDada
12345678-9,Juan,Pérez,1,A
12345678-9,Juan,Pérez,2,B
87654321-0,María,González,1,A
87654321-0,María,González,2,C
```

**Response:**
```typescript
{
  success: true
  totalAlumnos: number
  resultadoEvaluacionId: number
}
```

**Características:**
- ✅ **Procesamiento automático:** Cálculo de puntajes y notas
- ✅ **Creación de alumnos:** Alumnos nuevos se crean automáticamente
- ✅ **Validación de datos:** Verifica que las preguntas existan
- ✅ **Transacciones:** Asegura consistencia en la carga
- ✅ **Escala configurable:** Nota base 7.0 (configurable)

## 👨‍🏫 **APIs de Profesores ⭐ NUEVO**

### **GET `/api/profesores`**
Obtiene todos los profesores.

**Query Parameters:**
```typescript
{
  include?: 'true' // Incluir relaciones (asignaturas, niveles, horarios)
}
```

**Response:**
```typescript
{
  data: {
    id: number
    rut: string
    nombre: string
    email: string
    telefono: string
    fechaNacimiento: string
    createdAt: string
    updatedAt: string
    asignaturas?: {
      asignatura: {
        id: number
        nombre: string
      }
    }[]
    niveles?: {
      nivel: {
        id: number
        nombre: string
      }
    }[]
    horario?: {
      id: number
      nombre: string
      asignatura: {
        id: number
        nombre: string
      }
      nivel: {
        id: number
        nombre: string
      }
    }[]
  }[]
  message: string
}
```

### **POST `/api/profesores`**
Crea un nuevo profesor.

**Request Body:**
```typescript
{
  rut: string
  nombre: string
  email?: string
  telefono?: string
  asignaturas?: number[] // IDs de asignaturas
  niveles?: number[] // IDs de niveles
}
```

**Response:**
```typescript
{
  data: Profesor
  message: string
}
```

### **GET `/api/profesores/[id]`**
Obtiene un profesor específico.

**Response:**
```typescript
{
  data: Profesor
  message: string
}
```

### **PUT `/api/profesores/[id]`**
Actualiza un profesor existente.

**Request Body:**
```typescript
{
  nombre?: string
  email?: string
  telefono?: string
  asignaturas?: number[]
  niveles?: number[]
}
```

### **DELETE `/api/profesores/[id]`**
Elimina un profesor.

**Response:**
```typescript
{
  message: string
}
```

## 🕐 **APIs de Horarios ⭐ NUEVO**

### **GET `/api/horarios`**
Obtiene todos los horarios.

**Response:**
```typescript
{
  data: {
    id: number
    nombre: string
    docenteId: number
    asignaturaId: number
    nivelId: number
    fechaPrimeraClase: string
    createdAt: string
    updatedAt: string
    asignatura: {
      id: number
      nombre: string
    }
    nivel: {
      id: number
      nombre: string
    }
    profesor: {
      id: number
      nombre: string
      rut: string
    }
    modulos: {
      id: number
      dia: string
      horaInicio: string
      duracion: number
      orden: number
      profesores: {
        profesor: {
          id: number
          nombre: string
        }
        rol: string
      }[]
    }[]
  }[]
  message: string
}
```

### **POST `/api/horarios`**
Crea un nuevo horario.

**Request Body:**
```typescript
{
  nombre: string
  docenteId: number
  asignaturaId: number
  nivelId: number
  fechaPrimeraClase: string
  modulos: {
    dia: string // 'Lunes', 'Martes', etc.
    horaInicio: string // '08:00', '09:00', etc.
    duracion: number // minutos (30-240)
  }[]
}
```

**Validaciones:**
- ✅ **Duración:** Entre 30 y 240 minutos
- ✅ **Existencia:** Verifica que docente, asignatura y nivel existan
- ✅ **Transacciones:** Crea horario y módulos en una transacción
- ✅ **Profesor titular:** Se asigna automáticamente a todos los módulos

**Response:**
```typescript
{
  data: Horario
  message: string
}
```

### **GET `/api/horarios/[id]`**
Obtiene un horario específico.

**Response:**
```typescript
{
  data: Horario
  message: string
}
```

### **PUT `/api/horarios/[id]`**
Actualiza un horario existente.

**Request Body:**
```typescript
{
  nombre?: string
  docenteId?: number
  asignaturaId?: number
  nivelId?: number
  fechaPrimeraClase?: string
  modulos?: {
    dia: string
    horaInicio: string
    duracion: number
  }[]
}
```

**Características:**
- ✅ **Eliminación completa:** Borra módulos existentes y crea nuevos
- ✅ **Validaciones:** Mismas que POST
- ✅ **Transacciones:** Asegura consistencia

### **DELETE `/api/horarios/[id]`**
Elimina un horario y sus módulos.

**Response:**
```typescript
{
  message: string
}
```

## 📅 **APIs de Planificación Anual ⭐ NUEVO**

### **GET `/api/planificaciones`**
Obtiene todas las planificaciones anuales.

**Response:**
```typescript
{
  id: number
  nombre: string
  horarioId: number
  ano: number
  createdAt: string
  updatedAt: string
  horario: {
    id: number
    nombre: string
    asignatura: {
      id: number
      nombre: string
    }
    nivel: {
      id: number
      nombre: string
    }
    profesor: {
      id: number
      nombre: string
    }
  }
  asignaciones: {
    id: number
    oaId: number
    cantidadClases: number
    oa: {
      id: number
      descripcion_oas: string
      asignatura: {
        id: number
        nombre: string
      }
      nivel: {
        id: number
        nombre: string
      }
    }
  }[]
}[]
```

### **POST `/api/planificaciones`**
Crea una nueva planificación anual.

**Request Body:**
```typescript
{
  nombre: string
  horarioId: number
  ano: number
  asignaciones?: {
    oaId: number
    cantidadClases: number
  }[]
}
```

**Response:**
```typescript
{
  id: number
  nombre: string
  horarioId: number
  ano: number
  createdAt: string
  updatedAt: string
  horario: Horario
  asignaciones: AsignacionOA[]
}
```

### **GET `/api/planificaciones/[id]`**
Obtiene una planificación específica.

**Response:**
```typescript
{
  id: number
  nombre: string
  horarioId: number
  ano: number
  createdAt: string
  updatedAt: string
  horario: Horario
  asignaciones: AsignacionOA[]
}
```

### **PUT `/api/planificaciones/[id]`**
Actualiza una planificación existente.

**Request Body:**
```typescript
{
  nombre?: string
  ano?: number
  asignaciones?: {
    oaId: number
    cantidadClases: number
  }[]
}
```

### **DELETE `/api/planificaciones/[id]`**
Elimina una planificación.

**Response:**
```typescript
{
  message: string
}
```

## 📊 **APIs de Resultados de Evaluaciones ⭐ NUEVO**

### **GET `/api/resultados-evaluaciones`**
Obtiene todas las cargas de resultados de evaluaciones.

**Response:**
```typescript
{
  id: number
  evaluacionId: number
  fechaCarga: string
  totalAlumnos: number
  escalaNota: number
  evaluacion: {
    id: number
    titulo: string
    matrizNombre: string
    preguntasCount: number
  }
  resultados: {
    id: number
    puntajeTotal: number
    puntajeMaximo: number
    porcentaje: number
    alumno: {
      id: number
      nombre: string
      apellido: string
    }
  }[]
}[]
```

## 📚 **APIs de Metodologías**

### **GET `/api/metodologias`**
Obtiene todas las metodologías de enseñanza disponibles.

**Response:**
```typescript
{
  id: number
  nombre_metodologia: string
  descripcion: string
  nivel_recomendado: string
  fuentes_literatura: string
}[]
```

**Ejemplo de respuesta:**
```json
[
  {
    "id": 1,
    "nombre_metodologia": "Aprendizaje Basado en Proyectos (ABP)",
    "descripcion": "Los estudiantes adquieren conocimientos y habilidades mediante la elaboración de proyectos que responden a problemas reales...",
    "nivel_recomendado": "Educación Básica y Media",
    "fuentes_literatura": "- Elige Educar: 6 metodologías de enseñanza que todo profesor innovador debería conocer"
  }
]
```

## 🎓 **APIs de OAs**

### **GET `/api/oas`**
Obtiene todos los Objetivos de Aprendizaje.

**Query Parameters:**
```typescript
{
  nivel_id?: number
  asignatura_id?: number
}
```

**Response:**
```typescript
{
  id: number
  nivel_id: number
  asignatura_id: number
  eje_id: number
  eje_descripcion: string
  oas_id: string
  descripcion_oas: string
  basal: boolean
  minimo_clases: number
  asignatura: {
    id: number
    nombre: string
  }
  nivel: {
    id: number
    nombre: string
  }
}[]
```

## 🎯 **APIs de Ejes ⭐ NUEVO**

### **GET `/api/ejes`**
Obtiene todos los OAs agrupados por eje.

**Response:**
```typescript
{
  id: number
  descripcion: string
  oas: {
    id: number
    nivel_id: number
    asignatura_id: number
    eje_id: number
    eje_descripcion: string
    oas_id: string
    descripcion_oas: string
    basal: boolean
    minimo_clases: number
  }[]
}[]
```

**Características:**
- ✅ **Agrupación automática:** OAs organizados por eje_id y eje_descripcion
- ✅ **Ordenamiento:** Por eje_id y oas_id
- ✅ **Uso:** Planificación anual con filtros por eje

## 📋 **APIs de Niveles**

### **GET `/api/niveles`**
Obtiene todos los niveles educativos.

**Response:**
```typescript
{
  id: number
  nombre: string
}[]
```

### **POST `/api/niveles`**
Crea un nuevo nivel.

**Request Body:**
```typescript
{
  nombre: string
}
```

**Validaciones:**
- ✅ **Nombre requerido:** No puede estar vacío
- ✅ **Longitud máxima:** 100 caracteres
- ✅ **Unicidad:** No puede duplicar nombres existentes

**Response:**
```typescript
{
  id: number
  nombre: string
}
```

## 📖 **APIs de Asignaturas**

### **GET `/api/asignaturas`**
Obtiene todas las asignaturas.

**Response:**
```typescript
{
  data: {
    id: number
    nombre: string
  }[]
  message: string
}
```

### **POST `/api/asignaturas`**
Crea una nueva asignatura.

**Request Body:**
```typescript
{
  nombre: string
}
```

**Validaciones:**
- ✅ **Nombre requerido:** No puede estar vacío
- ✅ **Unicidad:** No puede duplicar nombres existentes

**Response:**
```typescript
{
  data: {
    id: number
    nombre: string
  }
  message: string
}
```

## 🔐 **Autenticación y Seguridad**

### **Validación de Datos**
Todas las APIs incluyen validación de datos de entrada:

```typescript
// Ejemplo de validación
if (!titulo || titulo.trim().length === 0) {
  return NextResponse.json(
    { error: 'El título es requerido' },
    { status: 400 }
  )
}
```

### **Manejo de Errores**
```typescript
try {
  // Operación de base de datos
} catch (error) {
  console.error('Error en la operación:', error)
  return NextResponse.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  )
}
```

### **Límites de Tamaño**
- **Imágenes:** Máximo 5MB
- **Archivos:** Máximo 10MB
- **Contenido JSON:** Máximo 1MB

## 📊 **Códigos de Estado HTTP**

### **Éxito**
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado
- `204 No Content` - Eliminación exitosa

### **Error del Cliente**
- `400 Bad Request` - Datos inválidos
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto de datos

### **Error del Servidor**
- `500 Internal Server Error` - Error interno
- `503 Service Unavailable` - Servicio no disponible

## 🧪 **Testing de APIs**

### **Ejemplos con curl**

**Crear profesor:**
```bash
curl -X POST http://localhost:3000/api/profesores \
  -H "Content-Type: application/json" \
  -d '{
    "rut": "12345678-9",
    "nombre": "Juan Pérez",
    "email": "juan.perez@escuela.cl",
    "asignaturas": [1, 2],
    "niveles": [1, 2]
  }'
```

**Crear horario:**
```bash
curl -X POST http://localhost:3000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Horario Matemáticas 2° Básico",
    "docenteId": 1,
    "asignaturaId": 1,
    "nivelId": 2,
    "fechaPrimeraClase": "2025-03-01",
    "modulos": [
      {
        "dia": "Lunes",
        "horaInicio": "08:00",
        "duracion": 90
      },
      {
        "dia": "Miércoles",
        "horaInicio": "10:00",
        "duracion": 90
      }
    ]
  }'
```

**Cargar resultados CSV:**
```bash
curl -X POST http://localhost:3000/api/evaluaciones/cargar-resultados \
  -F "file=@resultados.csv" \
  -F "evaluacionId=1"
```

**Obtener preguntas para tooltips:**
```bash
curl http://localhost:3000/api/evaluaciones/1/preguntas
```

### **Testing con Postman**

1. **Collection:** Importar colección de Postman
2. **Environment:** Configurar variables de entorno
3. **Tests:** Ejecutar tests automatizados

## 📈 **Monitoreo y Logs**

### **Logs de API**
```typescript
// Logging de operaciones
console.log(`[API] ${method} ${path} - ${status}`)
console.error(`[API Error] ${method} ${path}:`, error)
```

### **Métricas**
- **Tiempo de respuesta** promedio
- **Tasa de error** por endpoint
- **Uso de recursos** (CPU, memoria)
- **Traffic** por API

## 🔄 **Rate Limiting**

### **Límites por Endpoint**
- **GET requests:** 1000/minuto
- **POST requests:** 100/minuto
- **PUT/DELETE requests:** 50/minuto

### **Headers de Rate Limiting**
```typescript
{
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '999',
  'X-RateLimit-Reset': '1640995200'
}
```

## 🚀 **Optimizaciones**

### **Caching**
- **Imágenes:** Cache por 1 año
- **Metodologías:** Cache por 1 hora
- **OAs:** Cache por 1 día

### **Compresión**
- **Gzip** para todas las respuestas JSON
- **Optimización** de imágenes automática

### **Paginación**
```typescript
// Para endpoints que lo requieran
{
  data: any[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

## 🔮 **Mejoras Futuras**

- [ ] Autenticación JWT
- [ ] Rate limiting avanzado
- [ ] Webhooks para eventos
- [ ] API versioning
- [ ] GraphQL endpoint
- [ ] Documentación OpenAPI/Swagger
- [ ] Tests automatizados
- [ ] Métricas en tiempo real
- [ ] Backup automático de datos
- [ ] API para exportación masiva

---

**Última actualización:** Julio 2025  
**Versión de APIs:** 3.0 (Sistema completo)  
**Mantenido por:** Equipo de Desarrollo 