# 🚨 Lecciones Aprendidas - Plataforma Educativa

Este documento compila todas las lecciones aprendidas durante el desarrollo de la plataforma educativa, con el objetivo de evitar errores futuros y establecer lineamientos claros para el desarrollo.

## 📋 Índice

- [Principios Fundamentales](#principios-fundamentales)
- [Errores Críticos Resueltos](#errores-críticos-resueltos)
- [Lineamientos de Desarrollo](#lineamientos-de-desarrollo)
- [Checklists de Verificación](#checklists-de-verificación)
- [Patrones de Código](#patrones-de-código)
- [Troubleshooting](#troubleshooting)

## ⚠️ Principios Fundamentales

### 1. **Preservación de Funcionalidad Existente**
- **NUNCA** modificar APIs que funcionan sin testing exhaustivo
- **SIEMPRE** verificar que el frontend reciba el formato esperado
- **ANTES** de cambiar nombres de relaciones Prisma, verificar impacto en APIs
- **MANTENER** compatibilidad hacia atrás en cambios de API

### 2. **Gestión de Errores Frontend**
- **SIEMPRE** validar que `data` sea un array antes de usar `.map()`
- **PROTEGER** contra errores de tipo: `Array.isArray(data) && data.map()`
- **MANEJAR** casos edge: arrays vacíos, objetos de error, null/undefined
- **LOGGING** para debugging: `console.log('Datos recibidos:', data)`

### 3. **Sincronización Prisma-API**
- **REGENERAR** cliente Prisma después de cambios en schema: `npx prisma generate`
- **VERIFICAR** nombres de relaciones: schema vs cliente generado
- **TESTEAR** APIs inmediatamente después de cambios
- **DOCUMENTAR** cambios en relaciones para futuras referencias

### 4. **Estructura de Respuestas API**
- **GET endpoints** deben devolver SIEMPRE arrays (no objetos `{ data: [...] }`)
- **Error handling** debe devolver arrays vacíos `[]` en lugar de objetos de error
- **Consistencia** en formato de respuesta entre todos los endpoints
- **Validación** de tipos en frontend para cada respuesta

## 🚨 Errores Críticos Resueltos

### 1. **Error: `evaluaciones.map is not a function`**

**Problema:** El frontend fallaba al intentar hacer `.map()` sobre datos que no eran arrays.

**Causa Raíz:** 
- APIs devolviendo objetos `{ data: [...] }` en lugar de arrays directos
- Cambios en nombres de relaciones Prisma sin actualizar APIs
- Falta de validación en el frontend

**Solución Implementada:**
```typescript
// En el frontend
useEffect(() => {
  fetch('/api/evaluaciones')
    .then(res => res.json())
    .then(data => {
      console.log('Datos recibidos de la API:', data);
      // Asegurar que data sea siempre un array
      const evaluacionesArray = Array.isArray(data) ? data : [];
      setEvaluaciones(evaluacionesArray);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Error al cargar evaluaciones:', error);
      setAlert({ type: 'error', message: 'Error al cargar las evaluaciones' });
      setLoading(false);
    });
}, []);

// En el render
{Array.isArray(evaluaciones) && evaluaciones.map((ev) => (
  <tr key={ev.id}>
    {/* contenido */}
  </tr>
))}
```

### 2. **Inconsistencia en Nombres de Relaciones Prisma**

**Problema:** Las APIs usaban nombres de relaciones que no coincidían con el schema.

**Causa Raíz:**
- Cliente Prisma generado con nombres diferentes al schema
- Cambios en relaciones sin regenerar cliente
- Falta de sincronización entre schema y código

**Solución Implementada:**
```typescript
// API corregida
const evaluaciones = await prisma.evaluacion.findMany({
  include: {
    archivo: true,        // ✅ Nombres del schema
    matriz: true,         // ✅ Nombres del schema
    preguntas: true       // ✅ Nombres del schema
  }
})

// Mapeo correcto
const data = evaluaciones.map(ev => ({
  id: ev.id,
  titulo: ev.archivo?.titulo || '',
  matrizId: ev.matrizId,
  matrizNombre: ev.matriz?.nombre || '',
  preguntasCount: ev.preguntas?.length || 0,
  createdAt: ev.createdAt
}))
```

### 3. **Estructura de Respuestas API Inconsistente**

**Problema:** Algunas APIs devolvían objetos, otras arrays.

**Solución Implementada:**
```typescript
// GET endpoints SIEMPRE devuelven arrays
export async function GET() {
  try {
    // ... lógica de obtención
    return NextResponse.json(data) // ✅ Array directo
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error)
    return NextResponse.json([]) // ✅ Array vacío en caso de error
  }
}
```

### 4. **Error: `Route used params.id without awaiting`**

**Problema:** Next.js 15 requiere await en params.

**Solución:**
```typescript
export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // resto del código
}
```

## 🔧 Lineamientos de Desarrollo

### 1. **Antes de Hacer Cambios**
```bash
# 1. Verificar estado actual
git status
git diff

# 2. Crear backup si es necesario
mkdir backup_feature_name
cp -r src/app/api/feature backup_feature_name/

# 3. Probar funcionalidad actual
curl http://localhost:3000/api/endpoint
```

### 2. **Durante el Desarrollo**
```bash
# 1. Cambios incrementales
# 2. Testing después de cada cambio
# 3. Verificar que no se rompe nada existente
# 4. Logs para debugging
```

### 3. **Después de Cambios**
```bash
# 1. Regenerar Prisma si es necesario
npx prisma generate

# 2. Reiniciar servidor
npm run dev

# 3. Probar todas las funcionalidades afectadas
# 4. Verificar en navegador
```

## 📋 Checklists de Verificación

### Antes de Commit
- [ ] Todas las APIs devuelven el formato esperado
- [ ] Frontend maneja casos edge (arrays vacíos, errores)
- [ ] No hay errores de console en navegador
- [ ] Funcionalidades existentes siguen funcionando
- [ ] Cliente Prisma regenerado si hubo cambios en schema
- [ ] Servidor reiniciado y probado

### Antes de Push
- [ ] Tests pasan (si existen)
- [ ] Documentación actualizada
- [ ] Commit message descriptivo
- [ ] Backup de cambios importantes

### Para Nuevas APIs
- [ ] Verificar nombres de relaciones en schema.prisma
- [ ] Regenerar cliente Prisma: `npx prisma generate`
- [ ] Planificar estructura de respuesta (array vs objeto)
- [ ] Definir validaciones necesarias
- [ ] Seguir patrón estándar GET/POST
- [ ] Usar nombres correctos de relaciones
- [ ] Implementar error handling robusto
- [ ] Agregar logs para debugging
- [ ] Probar con curl: `curl /api/endpoint`
- [ ] Verificar formato de respuesta
- [ ] Probar en frontend
- [ ] Verificar que no rompe funcionalidades existentes

## 🎯 Patrones de Código

### 1. **Patrón Estándar para GET Endpoints**
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

### 2. **Patrón Estándar para POST Endpoints**
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

### 3. **Validación de Tipos en Frontend**
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

## 🚫 Errores Comunes a Evitar

### 1. **Cambios en Relaciones Prisma**
❌ **INCORRECTO:**
```typescript
// Cambiar nombres sin verificar impacto
const evaluaciones = await prisma.evaluacion.findMany({
  include: {
    Archivo: true,  // Cambió de 'archivo' a 'Archivo'
    MatrizEspecificacion: true  // Cambió de 'matriz' a 'MatrizEspecificacion'
  }
})
```

✅ **CORRECTO:**
```typescript
// Mantener nombres del schema
const evaluaciones = await prisma.evaluacion.findMany({
  include: {
    archivo: true,
    matriz: true,
    preguntas: true
  }
})
```

### 2. **Manejo de Respuestas API**
❌ **INCORRECTO:**
```typescript
// Frontend sin validación
const data = await res.json()
setEvaluaciones(data)  // Puede fallar si data no es array
```

✅ **CORRECTO:**
```typescript
// Frontend con validación robusta
const data = await res.json()
const evaluacionesArray = Array.isArray(data) ? data : []
setEvaluaciones(evaluacionesArray)
```

### 3. **Renderizado sin Validación**
❌ **INCORRECTO:**
```jsx
{evaluaciones.map((ev) => (
  <div key={ev.id}>{ev.titulo}</div>
))}
```

✅ **CORRECTO:**
```jsx
{Array.isArray(evaluaciones) && evaluaciones.map((ev) => (
  <div key={ev.id}>{ev.titulo}</div>
))}
```

### 4. **Inconsistencia en Formato de Respuesta**
❌ **INCORRECTO:**
```typescript
// Inconsistente
GET /api/evaluaciones → [{ id: 1, name: "test" }]
GET /api/matrices → { data: [{ id: 1, name: "test" }] }
```

✅ **CORRECTO:**
```typescript
// Consistente
GET /api/evaluaciones → [{ id: 1, name: "test" }]
GET /api/matrices → [{ id: 1, name: "test" }]
```

## 🔍 Troubleshooting

### Logs Útiles
```typescript
// En el frontend
console.log('Datos recibidos de la API:', data)
console.log('Tipo de datos:', typeof data)
console.log('Es array:', Array.isArray(data))

// En la API
console.error('Error al obtener evaluaciones:', error)
```

### Verificación de Schema
```bash
# Verificar schema actual
cat prisma/schema.prisma | grep -A 10 "model Evaluacion"

# Verificar cliente generado
npx prisma generate
```

### Testing de Endpoints
```bash
# Probar GET
curl http://localhost:3000/api/evaluaciones

# Probar POST
curl -X POST http://localhost:3000/api/evaluaciones \
  -H "Content-Type: application/json" \
  -d '{"archivoId": 1, "matrizId": 1, "preguntas": []}'

# Verificar formato
curl http://localhost:3000/api/evaluaciones | jq .
```

### Errores Críticos y Soluciones

#### Error: `evaluaciones.map is not a function`
**Causa:** API devuelve objeto en lugar de array
**Solución:** 
```typescript
// En el frontend
const data = await res.json()
const evaluacionesArray = Array.isArray(data) ? data : []
setEvaluaciones(evaluacionesArray)
```

#### Error: `Property 'archivo' does not exist`
**Causa:** Nombres de relaciones Prisma incorrectos
**Solución:**
```bash
npx prisma generate
# Verificar nombres en schema.prisma
```

#### Error: `Route used params.id without awaiting`
**Causa:** Next.js 15 requiere await en params
**Solución:**
```typescript
export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // resto del código
}
```

## 📊 Estándares de Documentación

### Para Cada API
- **Endpoint:** URL completa
- **Método:** GET, POST, PUT, DELETE
- **Parámetros:** Query params, body params
- **Respuesta:** Formato exacto (array u objeto)
- **Ejemplo:** Comando curl completo
- **Errores:** Posibles códigos de error

### Para Cada Módulo
- **Lecciones aprendidas** específicas del módulo
- **Patrones de código** utilizados
- **Checklists** de verificación
- **Troubleshooting** específico

## 🎯 Próximos Pasos

### Mejoras Planificadas
1. **Testing automatizado** para todas las APIs
2. **Validación de tipos** con TypeScript estricto
3. **Documentación automática** de APIs
4. **Monitoreo de errores** en producción

### Mantenimiento
1. **Revisión periódica** de lecciones aprendidas
2. **Actualización** de documentación
3. **Refactoring** de código según patrones establecidos
4. **Optimización** de performance

---

**Última actualización:** Julio 2025  
**Versión:** 1.0  
**Mantenido por:** Equipo de Desarrollo  
**Estado:** Documentación completa de lecciones aprendidas 