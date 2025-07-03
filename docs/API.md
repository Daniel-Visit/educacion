# 🔌 APIs de la Plataforma Educativa

## Descripción General

La plataforma educativa cuenta con un conjunto completo de APIs REST para gestionar todos los aspectos del sistema, desde contenido educativo hasta gestión de archivos e imágenes.

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