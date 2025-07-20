# 🔌 APIs de la Plataforma Educativa

## Descripción General

La plataforma educativa cuenta con un conjunto completo de APIs REST para gestionar todos los aspectos del sistema, desde contenido educativo hasta gestión de archivos e imágenes.

## 🚨 Lecciones Aprendidas - APIs

### ⚠️ **PRINCIPIOS FUNDAMENTALES DE APIS**

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

### 🔧 **LINEAMIENTOS DE DESARROLLO DE APIS**

#### 1. **Patrón Estándar para GET Endpoints**
```typescript
export async function GET() {
  try {
    // 1. Obtener datos
    const data = await prisma.model.findMany({
      include: {
        // relaciones en minúscula según schema
      }
    })
    
    // 2. Mapear a formato esperado por frontend
    const mappedData = data.map(item => ({
      id: item.id,
      // otros campos...
    }))
    
    // 3. Devolver array directo
    return NextResponse.json(mappedData)
  } catch (error) {
    // 4. Log error para debugging
    console.error('Error al obtener datos:', error)
    
    // 5. Devolver array vacío (no objeto de error)
    return NextResponse.json([])
  }
}
```

#### 2. **Patrón Estándar para POST Endpoints**
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Validar request
    const body = await request.json()
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Campo requerido' }, 
        { status: 400 }
      )
    }
    
    // 2. Crear en base de datos
    const created = await prisma.model.create({
      data: body,
      include: {
        // relaciones necesarias
      }
    })
    
    // 3. Devolver objeto creado
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error al crear:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
```

#### 3. **Validación de Tipos en Frontend**
```typescript
// ✅ CORRECTO - Validación robusta
const response = await fetch('/api/endpoint')
const data = await response.json()

// Validar que sea array
const arrayData = Array.isArray(data) ? data : []

// Usar en componente
{Array.isArray(arrayData) && arrayData.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

### 📋 **CHECKLIST PARA NUEVAS APIS**

#### Antes de Implementar
- [ ] Verificar nombres de relaciones en schema.prisma
- [ ] Regenerar cliente Prisma: `npx prisma generate`
- [ ] Planificar estructura de respuesta (array vs objeto)
- [ ] Definir validaciones necesarias

#### Durante Implementación
- [ ] Seguir patrón estándar GET/POST
- [ ] Usar nombres correctos de relaciones
- [ ] Implementar error handling robusto
- [ ] Agregar logs para debugging

#### Después de Implementación
- [ ] Probar con curl: `curl /api/endpoint`
- [ ] Verificar formato de respuesta
- [ ] Probar en frontend
- [ ] Verificar que no rompe funcionalidades existentes

### 🚫 **ERRORES COMUNES A EVITAR**

#### 1. **Inconsistencia en Formato de Respuesta**
```typescript
// ❌ NO HACER - Inconsistente
GET /api/evaluaciones → [{ id: 1, name: "test" }]
GET /api/matrices → { data: [{ id: 1, name: "test" }] }
```

#### 2. **Cambiar Nombres de Relaciones Sin Verificar**
```typescript
// ❌ NO HACER
const data = await prisma.evaluacion.findMany({
  include: {
    Archivo: true,  // Cambió sin verificar schema
    MatrizEspecificacion: true  // Cambió sin verificar schema
  }
})
```

#### 3. **Error Handling que Rompe Frontend**
```typescript
// ❌ NO HACER
catch (error) {
  return NextResponse.json({ error: 'Error' }) // Rompe frontend
}
```

### 🔍 **DEBUGGING DE APIS**

#### Logs Útiles
```typescript
// En API
console.log('Datos obtenidos:', data)
console.error('Error en API:', error)

// En frontend
console.log('Respuesta de API:', data)
console.log('Tipo de respuesta:', typeof data)
console.log('Es array:', Array.isArray(data))
```

#### Testing con curl
```bash
# Probar GET
curl http://localhost:3000/api/endpoint

# Probar POST
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# Verificar formato
curl http://localhost:3000/api/endpoint | jq .
```

#### Verificación de Schema
```bash
# Verificar relaciones en schema
cat prisma/schema.prisma | grep -A 10 "model ModelName"

# Regenerar cliente
npx prisma generate
```

### 📊 **ESTÁNDARES DE DOCUMENTACIÓN**

#### Para Cada API
- **Endpoint:** URL completa
- **Método:** GET, POST, PUT, DELETE
- **Parámetros:** Query params, body params
- **Respuesta:** Formato exacto (array u objeto)
- **Ejemplo:** Comando curl completo
- **Errores:** Posibles códigos de error

#### Ejemplo de Documentación
```markdown
### GET `/api/evaluaciones`
Obtiene todas las evaluaciones.

**Response:** `Array<Evaluacion>`
```typescript
{
  id: number
  titulo: string
  matrizId: number
  matrizNombre: string
  preguntasCount: number
  createdAt: string
}[]
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/evaluaciones
```
```

## Estructura de APIs

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
├── metodologias/              # Metodologías de enseñanza
│   └── route.ts              # Listar metodologías
└── oas/                       # Objetivos de Aprendizaje
    └── route.ts              # Listar OAs
```

## 🔧 Configuración Base

### Headers Comunes
```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### Respuestas de Error
```typescript
{
  error: string,
  status: number,
  message?: string
}
```

### Respuestas de Éxito
```typescript
{
  data: any,
  message?: string,
  status: number
}
```

## 📁 APIs de Archivos

### GET `/api/archivos`
Obtiene todos los archivos, opcionalmente filtrados por tipo.

**Query Parameters:**
```typescript
{
  tipo?: 'planificacion' | 'material'
}
```

**Response:**
```typescript
{
  id: number
  titulo: string
  tipo: 'planificacion' | 'material'
  contenido: string // JSON de TipTap
  createdAt: string
  updatedAt: string
}[]
```

**Ejemplo:**
```bash
GET /api/archivos?tipo=planificacion
```

### POST `/api/archivos`
Crea un nuevo archivo.

**Request Body:**
```typescript
{
  titulo: string
  tipo: 'planificacion' | 'material'
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

### PUT `/api/archivos/[id]`
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

### DELETE `/api/archivos/[id]`
Elimina un archivo y todas sus imágenes asociadas.

**Response:**
```typescript
{
  message: "Archivo eliminado correctamente"
}
```

## 🖼️ APIs de Imágenes

### POST `/api/imagenes`
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

### GET `/api/imagenes/[id]`
Sirve la imagen como respuesta de imagen.

**Response Headers:**
```typescript
{
  'Content-Type': string, // MIME type
  'Cache-Control': 'public, max-age=31536000'
}
```

**Response Body:** Binary image data

### DELETE `/api/imagenes/[id]`
Elimina una imagen.

**Response:**
```typescript
{
  message: "Imagen eliminada correctamente"
}
```

## 🎯 APIs de Matrices

### GET `/api/matrices`
Obtiene todas las matrices con sus OAs asociados.

**Response:**
```typescript
{
  id: number
  nombre: string
  total_preguntas: number
  createdAt: string
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

### POST `/api/matrices`
Crea una nueva matriz con sus OAs e indicadores.

**Request Body:**
```typescript
{
  nombre: string
  total_preguntas: number
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
  createdAt: string
  oas: MatrizOA[]
}
```

### PUT `/api/matrices/[id]`
Actualiza una matriz existente.

**Request Body:**
```typescript
{
  nombre?: string
  total_preguntas?: number
  oas?: MatrizOA[]
}
```

### DELETE `/api/matrices/[id]`
Elimina una matriz y todos sus datos asociados.

## 📚 APIs de Metodologías

### GET `/api/metodologias`
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

## 🎓 APIs de OAs

### GET `/api/oas`
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

## 🔐 Autenticación y Seguridad

### Validación de Datos
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

### Manejo de Errores
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

### Límites de Tamaño
- **Imágenes:** Máximo 5MB
- **Archivos:** Máximo 10MB
- **Contenido JSON:** Máximo 1MB

## 📊 Códigos de Estado HTTP

### Éxito
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado
- `204 No Content` - Eliminación exitosa

### Error del Cliente
- `400 Bad Request` - Datos inválidos
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto de datos

### Error del Servidor
- `500 Internal Server Error` - Error interno
- `503 Service Unavailable` - Servicio no disponible

## 🧪 Testing de APIs

### Ejemplos con curl

**Crear archivo:**
```bash
curl -X POST http://localhost:3000/api/archivos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Test Planificación",
    "tipo": "planificacion",
    "contenido": "{\"type\":\"doc\",\"content\":[]}"
  }'
```

**Obtener archivos:**
```bash
curl http://localhost:3000/api/archivos?tipo=planificacion
```

**Subir imagen:**
```bash
curl -X POST http://localhost:3000/api/imagenes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "test.png",
    "tipo": "image/png",
    "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "tamaño": 95
  }'
```

### Testing con Postman

1. **Collection:** Importar colección de Postman
2. **Environment:** Configurar variables de entorno
3. **Tests:** Ejecutar tests automatizados

## 📈 Monitoreo y Logs

### Logs de API
```typescript
// Logging de operaciones
console.log(`[API] ${method} ${path} - ${status}`)
console.error(`[API Error] ${method} ${path}:`, error)
```

### Métricas
- **Tiempo de respuesta** promedio
- **Tasa de error** por endpoint
- **Uso de recursos** (CPU, memoria)
- **Traffic** por API

## 🔄 Rate Limiting

### Límites por Endpoint
- **GET requests:** 1000/minuto
- **POST requests:** 100/minuto
- **PUT/DELETE requests:** 50/minuto

### Headers de Rate Limiting
```typescript
{
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '999',
  'X-RateLimit-Reset': '1640995200'
}
```

## 🚀 Optimizaciones

### Caching
- **Imágenes:** Cache por 1 año
- **Metodologías:** Cache por 1 hora
- **OAs:** Cache por 1 día

### Compresión
- **Gzip** para todas las respuestas JSON
- **Optimización** de imágenes automática

### Paginación
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

## 🔮 Mejoras Futuras

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

## 📋 **APIs de Evaluaciones**

### **GET /api/evaluaciones**
Obtiene todas las evaluaciones con información básica.

**Respuesta:**
```json
[
  {
    "id": 8,
    "titulo": "Prueba 3",
    "matrizNombre": "Matriz de Prueba desde Script",
    "preguntasCount": 20,
    "createdAt": "2025-07-05T05:33:42.091Z"
  }
]
```

### **GET /api/evaluaciones/:id/resultados**
Obtiene los resultados de una evaluación específica.

**Respuesta:**
```json
[
  {
    "id": 153,
    "alumno": {
      "rut": "1-1752891726239",
      "nombre": "Ashley",
      "apellido": "Amira Sepulveda Morales"
    },
    "puntajeTotal": 20,
    "puntajeMaximo": 20,
    "porcentaje": 100,
    "nota": 7,
    "respuestas": [
      {
        "id": 2973,
        "preguntaId": 1,
        "alternativaDada": "A",
        "esCorrecta": true,
        "puntajeObtenido": 1
      }
    ]
  }
]
```

### **GET /api/evaluaciones/:id/preguntas** ⭐ **NUEVO**
Obtiene las preguntas de una evaluación específica.

**Parámetros:**
- `id` (path): ID de la evaluación

**Respuesta:**
```json
[
  {
    "id": 144,
    "numero": 1,
    "texto": "¿A qué se dirigía la lechera al mercado?"
  },
  {
    "id": 145,
    "numero": 2,
    "texto": "¿Qué iba haciendo la lechera mientras se dirigía al mercado?"
  }
]
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