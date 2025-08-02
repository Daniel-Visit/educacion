# 📚 Documentación de la Plataforma Educativa

Bienvenido a la documentación completa de la Plataforma Educativa. Esta documentación está organizada por módulos para facilitar la navegación y comprensión del sistema.

## 🎯 Contexto del Proyecto

### Propósito

Plataforma educativa inteligente diseñada para docentes, que integra:

- **Editor avanzado TipTap** para crear planificaciones y materiales
- **Sistema de evaluaciones** basado en matrices de especificación
- **Entrevista pedagógica interactiva** con IA conversacional
- **Planificación anual** con distribución de objetivos de aprendizaje
- **Gestión de horarios** para docentes y asignaturas

### Usuario Objetivo

**Docentes de educación básica y media** que necesitan:

- Crear planificaciones de clase de alta calidad
- Generar evaluaciones alineadas con el currículum
- Gestionar su tiempo y horarios de manera eficiente
- Recibir asistencia pedagógica personalizada

## 🚨 Lecciones Aprendidas y Lineamientos Críticos

### ⚠️ **PRINCIPIOS FUNDAMENTALES (NO VIOLAR)**

#### 1. **Preservación de Funcionalidad Existente**

- **NUNCA** modificar APIs que funcionan sin testing exhaustivo
- **SIEMPRE** verificar que el frontend reciba el formato esperado
- **ANTES** de cambiar nombres de relaciones Prisma, verificar impacto en APIs
- **MANTENER** compatibilidad hacia atrás en cambios de API

#### 2. **Gestión de Errores Frontend**

- **SIEMPRE** validar que `data` sea un array antes de usar `.map()`
- **PROTEGER** contra errores de tipo: `Array.isArray(data) && data.map()`
- **MANEJAR** casos edge: arrays vacíos, objetos de error, null/undefined
- **LOGGING** para debugging: `console.log('Datos recibidos:', data)`

#### 3. **Sincronización Prisma-API**

- **REGENERAR** cliente Prisma después de cambios en schema: `npx prisma generate`
- **VERIFICAR** nombres de relaciones: schema vs cliente generado
- **TESTEAR** APIs inmediatamente después de cambios
- **DOCUMENTAR** cambios en relaciones para futuras referencias

#### 4. **Estructura de Respuestas API**

- **GET endpoints** deben devolver SIEMPRE arrays (no objetos `{ data: [...] }`)
- **Error handling** debe devolver arrays vacíos `[]` en lugar de objetos de error
- **Consistencia** en formato de respuesta entre todos los endpoints
- **Validación** de tipos en frontend para cada respuesta

### 🔧 **LINEAMIENTOS DE DESARROLLO**

#### 1. **Antes de Hacer Cambios**

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

#### 2. **Durante el Desarrollo**

```bash
# 1. Cambios incrementales
# 2. Testing después de cada cambio
# 3. Verificar que no se rompe nada existente
# 4. Logs para debugging
```

#### 3. **Después de Cambios**

```bash
# 1. Regenerar Prisma si es necesario
npx prisma generate

# 2. Reiniciar servidor
npm run dev

# 3. Probar todas las funcionalidades afectadas
# 4. Verificar en navegador
```

### 🚫 **ERRORES COMUNES A EVITAR**

#### 1. **Cambios en Relaciones Prisma**

❌ **INCORRECTO:**

```typescript
// Cambiar nombres sin verificar impacto
const evaluaciones = await prisma.evaluacion.findMany({
  include: {
    Archivo: true, // Cambió de 'archivo' a 'Archivo'
    MatrizEspecificacion: true, // Cambió de 'matriz' a 'MatrizEspecificacion'
  },
});
```

✅ **CORRECTO:**

```typescript
// Mantener nombres del schema
const evaluaciones = await prisma.evaluacion.findMany({
  include: {
    archivo: true,
    matriz: true,
    preguntas: true,
  },
});
```

#### 2. **Manejo de Respuestas API**

❌ **INCORRECTO:**

```typescript
// Frontend sin validación
const data = await res.json();
setEvaluaciones(data); // Puede fallar si data no es array
```

✅ **CORRECTO:**

```typescript
// Frontend con validación robusta
const data = await res.json();
const evaluacionesArray = Array.isArray(data) ? data : [];
setEvaluaciones(evaluacionesArray);
```

#### 3. **Renderizado sin Validación**

❌ **INCORRECTO:**

```jsx
{
  evaluaciones.map(ev => <div key={ev.id}>{ev.titulo}</div>);
}
```

✅ **CORRECTO:**

```jsx
{
  Array.isArray(evaluaciones) &&
    evaluaciones.map(ev => <div key={ev.id}>{ev.titulo}</div>);
}
```

### 📋 **CHECKLIST DE VERIFICACIÓN**

#### Antes de Commit

- [ ] Todas las APIs devuelven el formato esperado
- [ ] Frontend maneja casos edge (arrays vacíos, errores)
- [ ] No hay errores de console en navegador
- [ ] Funcionalidades existentes siguen funcionando
- [ ] Cliente Prisma regenerado si hubo cambios en schema
- [ ] Servidor reiniciado y probado

#### Antes de Push

- [ ] Tests pasan (si existen)
- [ ] Documentación actualizada
- [ ] Commit message descriptivo
- [ ] Backup de cambios importantes

## 🗂️ Índice de Documentación

### 📖 Documentación General

- **[README Principal](../README.md)** - Descripción general del proyecto, instalación y uso básico

### 🔧 Documentación Técnica

#### 📝 [Editor de Contenido](./EDITOR.md)

- Funcionalidades del editor TipTap
- APIs de archivos e imágenes
- Hooks personalizados
- Configuración y troubleshooting

#### 🎯 [Gestión de Matrices](./MATRICES.md)

- Creación y edición de matrices de especificación
- Gestión de OAs e indicadores
- APIs de matrices
- Validaciones y flujo de trabajo

#### 📝 [Sistema de Evaluaciones](./EVALUACIONES.md)

- Creación y edición de evaluaciones
- Editor TipTap con extracción automática
- Gestión de preguntas y alternativas
- Modos de creación y edición
- APIs y base de datos

#### 📊 [Corrección de Evaluaciones](./CORRECCION_EVALUACIONES.md)

- Carga de resultados desde archivos CSV
- Procesamiento automático de puntuaciones
- Almacenamiento estructurado de resultados
- Cálculo de notas y estadísticas
- APIs para procesamiento de datos

#### 🎤 [Entrevista Interactiva](./ENTREVISTA.md)

- Sistema de preguntas dinámicas
- Text-to-Speech (TTS)
- Componentes de interfaz
- Configuración y animaciones

#### 🔌 [APIs del Sistema](./API.md)

- Documentación completa de todas las APIs
- Endpoints, parámetros y respuestas
- Ejemplos de uso con curl
- Configuración de seguridad

#### 🗄️ [Base de Datos](./DATABASE.md)

- Estructura completa de la base de datos
- Tablas y relaciones
- Scripts de restauración
- Optimización y troubleshooting

#### 🎣 [Hooks Personalizados](./HOOKS.md)

- Hooks del editor y evaluaciones
- Hooks de entrevista y utilidades
- Patrones de uso y mejores prácticas
- Ejemplos de implementación

#### 🏗️ [Arquitectura del Sistema](./ARQUITECTURA.md)

- Patrones de diseño y estructura de código
- Flujo de datos y decisiones técnicas
- Escalabilidad y seguridad
- Testing y deployment

### 🛠️ Scripts y Utilidades

#### 📋 [Scripts de Restauración](../scripts-restauracion/README.md)

- Restauración de datos desde CSV
- Scripts independientes por módulo
- Verificación de integridad
- Instrucciones de uso

#### 🚧 [Tareas Pendientes](./TAREAS_PENDIENTES.md)

- Configuración de horario docente
- Gestión de planificaciones guardadas
- Integración y mejoras del sistema
- Funcionalidades avanzadas

#### 🧪 [Testing Strategy](./TESTING_STRATEGY.md)

- Estrategia completa de testing
- Configuración de Jest
- Tests de API y componentes
- Cobertura y calidad

## 🚀 Guías de Inicio Rápido

### Para Desarrolladores

1. **Instalación:** Sigue el [README principal](../README.md)
2. **Lecciones aprendidas:** Lee esta sección completa antes de empezar
3. **Base de datos:** Consulta [DATABASE.md](./DATABASE.md)
4. **APIs:** Revisa [API.md](./API.md)
5. **Hooks:** Consulta [HOOKS.md](./HOOKS.md) para patrones y mejores prácticas
6. **Módulos específicos:** Selecciona según tu interés

### Para Usuarios Finales

1. **Editor:** [EDITOR.md](./EDITOR.md) - Crear planificaciones y materiales
2. **Planificación Anual:** [PLANIFICACION_ANUAL.md](./PLANIFICACION_ANUAL.md) - Gestionar distribución de OAs
3. **Matrices:** [MATRICES.md](./MATRICES.md) - Gestionar matrices de especificación
4. **Evaluaciones:** [EVALUACIONES.md](./EVALUACIONES.md) - Crear y editar evaluaciones
5. **Entrevista:** [ENTREVISTA.md](./ENTREVISTA.md) - Sistema interactivo

## 🔍 Búsqueda por Tema

### 🎨 Interfaz de Usuario

- **Editor:** [EDITOR.md](./EDITOR.md) - Componentes TipTap y UI
- **Evaluaciones:** [EVALUACIONES.md](./EVALUACIONES.md) - Editor y sidebar de preguntas
- **Entrevista:** [ENTREVISTA.md](./ENTREVISTA.md) - Animaciones y TTS
- **Matrices:** [MATRICES.md](./MATRICES.md) - Formularios y validación
- **Planificación Anual:** [PLANIFICACION_ANUAL.md](./PLANIFICACION_ANUAL.md) - Calendario y gestión de OAs

### 💾 Gestión de Datos

- **Base de datos:** [DATABASE.md](./DATABASE.md) - Estructura y consultas
- **APIs:** [API.md](./API.md) - Endpoints y operaciones
- **Restauración:** [scripts-restauracion/README.md](../scripts-restauracion/README.md)

### 🔧 Desarrollo

- **Configuración:** [README principal](../README.md)
- **Hooks:** [HOOKS.md](./HOOKS.md) - Patrones y mejores prácticas
- **APIs:** [API.md](./API.md) - Testing y debugging
- **Base de datos:** [DATABASE.md](./DATABASE.md) - Migraciones y comandos

## 📊 Estructura del Proyecto

```
educacion-app/
├── docs/                      # 📚 Documentación
│   ├── README.md             # Índice de documentación (ESTE ARCHIVO)
│   ├── EDITOR.md             # Documentación del editor
│   ├── MATRICES.md           # Documentación de matrices
│   ├── EVALUACIONES.md       # Documentación de evaluaciones
│   ├── ENTREVISTA.md         # Documentación de entrevista
│   ├── API.md                # Documentación de APIs
│   ├── HOOKS.md              # Documentación de hooks
│   ├── ARQUITECTURA.md       # Documentación de arquitectura
│   ├── DATABASE.md           # Documentación de base de datos
│   ├── TESTING_STRATEGY.md   # Estrategia de testing
│   └── TAREAS_PENDIENTES.md  # Tareas pendientes
├── horarios_backup/          # 🔄 Backup de funcionalidad de horarios
│   ├── src/app/api/horarios/ # APIs de horarios
│   ├── src/components/horarios/ # Componentes de horarios
│   └── use-horarios.ts       # Hook de horarios
├── scripts-restauracion/      # 🛠️ Scripts de restauración
│   ├── README.md             # Instrucciones de restauración
│   ├── restore-all-data.js   # Restaurar todos los datos
│   ├── restore-oas.js        # Restaurar solo OAs
│   └── restore-archivos-ejemplo.js # Restaurar archivos ejemplo
├── src/                       # 💻 Código fuente
│   ├── app/                  # Páginas y APIs
│   ├── components/           # Componentes React
│   ├── hooks/                # Custom hooks
│   └── lib/                  # Utilidades
├── tests/                    # 🧪 Tests del sistema
│   ├── api/                  # Tests de APIs
│   ├── components/           # Tests de componentes
│   └── integration/          # Tests de integración
├── prisma/                   # 🗄️ Base de datos
│   ├── schema.prisma         # Esquema de base de datos
│   ├── dev.db               # Base de datos SQLite
│   └── migrations/           # Migraciones
└── README.md                 # 📖 Documentación principal
```

## 🎯 Casos de Uso Comunes

### Crear una Planificación de Clase

1. **Configuración:** [README principal](../README.md) - Instalación
2. **Editor:** [EDITOR.md](./EDITOR.md) - Uso del editor
3. **Guardado:** [API.md](./API.md) - APIs de archivos
4. **Imágenes:** [EDITOR.md](./EDITOR.md) - Upload de imágenes

### Crear una Matriz de Especificación

1. **Conceptos:** [MATRICES.md](./MATRICES.md) - Explicación del módulo
2. **OAs:** [DATABASE.md](./DATABASE.md) - Datos disponibles
3. **Creación:** [MATRICES.md](./MATRICES.md) - Flujo de trabajo
4. **APIs:** [API.md](./API.md) - Endpoints de matrices

### Crear una Evaluación

1. **Conceptos:** [EVALUACIONES.md](./EVALUACIONES.md) - Explicación del módulo
2. **Matriz:** [MATRICES.md](./MATRICES.md) - Seleccionar matriz base
3. **Editor:** [EVALUACIONES.md](./EVALUACIONES.md) - Uso del editor TipTap
4. **Preguntas:** [EVALUACIONES.md](./EVALUACIONES.md) - Gestión de preguntas y alternativas
5. **APIs:** [API.md](./API.md) - Endpoints de evaluaciones

### Usar la Entrevista Interactiva

1. **Funcionalidades:** [ENTREVISTA.md](./ENTREVISTA.md) - Características
2. **TTS:** [ENTREVISTA.md](./ENTREVISTA.md) - Configuración de audio
3. **Preguntas:** [ENTREVISTA.md](./ENTREVISTA.md) - Estructura de datos

## 🔧 Troubleshooting

### Problemas Comunes

- **Base de datos:** [DATABASE.md](./DATABASE.md) - Sección troubleshooting
- **APIs:** [API.md](./API.md) - Códigos de error y debugging
- **Editor:** [EDITOR.md](./EDITOR.md) - Problemas comunes
- **Evaluaciones:** [EVALUACIONES.md](./EVALUACIONES.md) - Troubleshooting específico
- **Restauración:** [scripts-restauracion/README.md](../scripts-restauracion/README.md)

### Logs y Debug

- **Servidor:** `npm run dev` - Logs de desarrollo
- **Base de datos:** `npx prisma studio` - Interfaz visual
- **APIs:** [API.md](./API.md) - Ejemplos de testing

### Errores Críticos y Soluciones

#### Error: `evaluaciones.map is not a function`

**Causa:** API devuelve objeto en lugar de array
**Solución:**

```typescript
// En el frontend
const data = await res.json();
const evaluacionesArray = Array.isArray(data) ? data : [];
setEvaluaciones(evaluacionesArray);
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
  const { id } = await params;
  // resto del código
}
```

## 📈 Contribución

### Para Contribuir

1. **Fork** el repositorio
2. **Crea** una rama para tu feature
3. **Lee** las lecciones aprendidas en esta documentación
4. **Documenta** tus cambios
5. **Actualiza** la documentación relevante
6. **Envía** un Pull Request

### Estándares de Documentación

- **Markdown** para todos los archivos
- **Emojis** para mejor navegación
- **Ejemplos de código** cuando sea posible
- **Sección de troubleshooting** en cada módulo
- **Lecciones aprendidas** documentadas

## 🔗 Enlaces Útiles

### Repositorio

- **GitHub:** https://github.com/Daniel-Visit/educacion
- **Issues:** Para reportar bugs o solicitar features
- **Discussions:** Para preguntas y discusiones

### Tecnologías

- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **TipTap:** https://tiptap.dev/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

### Recursos Educativos

- **Currículum Nacional:** https://www.curriculumnacional.cl
- **Elige Educar:** https://eligeeducar.cl
- **MINEDUC:** https://www.mineduc.cl

---

**Última actualización:** Julio 2025  
**Versión de documentación:** 2.0  
**Mantenido por:** Equipo de Desarrollo  
**Estado:** Funcionalidad de evaluaciones restaurada, sistema estable
