# 🎣 Hooks Personalizados

Esta documentación describe todos los hooks personalizados utilizados en la plataforma educativa, su propósito, API y ejemplos de uso.

## 📋 Índice

- [Hooks del Editor](#hooks-del-editor)
- [Hooks de Evaluaciones](#hooks-de-evaluaciones)
- [Hooks de Entrevista](#hooks-de-entrevista)
- [Hooks de Utilidades](#hooks-de-utilidades)
- [Patrones de Uso](#patrones-de-uso)
- [Mejores Prácticas](#mejores-prácticas)

## 📝 Hooks del Editor

### useTiptapEditor
**Ubicación:** `src/hooks/use-tiptap-editor.ts`

Hook para configurar y gestionar el editor TipTap.

```tsx
const {
  editor,
  isReady,
  content,
  setContent,
  saveContent,
  loadContent
} = useTiptapEditor({
  extensions: [...],
  content: initialContent,
  onUpdate: handleUpdate
})
```

**Props:**
- `extensions`: Array de extensiones TipTap
- `content`: Contenido inicial
- `onUpdate`: Callback cuando cambia el contenido

**Retorna:**
- `editor`: Instancia del editor TipTap
- `isReady`: Estado de inicialización
- `content`: Contenido actual
- `setContent`: Función para establecer contenido
- `saveContent`: Función para guardar contenido
- `loadContent`: Función para cargar contenido

### useImageUpload
**Ubicación:** `src/hooks/use-image-upload.ts`

Hook para manejar la subida de imágenes al editor.

```tsx
const {
  uploadImage,
  isUploading,
  uploadProgress,
  error
} = useImageUpload({
  onSuccess: handleSuccess,
  onError: handleError
})
```

**Funcionalidades:**
- Subida de archivos con drag & drop
- Progreso de carga
- Manejo de errores
- Integración con API de imágenes

### useContentSave
**Ubicación:** `src/hooks/use-content-save.ts`

Hook para guardar y cargar contenido del editor.

```tsx
const {
  savedContents,
  saveContent,
  loadContent,
  deleteContent,
  isLoading
} = useContentSave()
```

**Funcionalidades:**
- Guardado automático de contenido
- Lista de contenidos guardados
- Carga de contenido existente
- Eliminación de contenido

## 🎯 Hooks de Evaluaciones

### useEvaluacionForm
**Ubicación:** `src/hooks/use-evaluacion-form.ts`

Hook principal para el formulario de evaluaciones.

```tsx
const {
  // Estado
  loading, saving, matrices, selectedMatriz,
  preguntasExtraidas, formData, showSaveModal,
  titulo, errors, showSuccess, evaluacionId,
  
  // Handlers
  handleEditorReady, handleMatrizSelect,
  handleRespuestaCorrectaChange, handleSave,
  handleLoadContent, clearErrors, updateFormData,
  
  // Utilidades
  validateForm
} = useEvaluacionForm()
```

**Características:**
- Gestión completa del estado del formulario
- Sincronización con editor TipTap
- Validaciones automáticas
- Modos de creación y edición
- Carga de datos desde API

**Ejemplo de uso:**
```tsx
function CrearEvaluacionPage() {
  const {
    matrices,
    selectedMatriz,
    handleMatrizSelect,
    handleSave,
    validateForm
  } = useEvaluacionForm()

  const handleSubmit = () => {
    if (validateForm()) {
      handleSave()
    }
  }

  return (
    <div>
      <MatrizSelector
        matrices={matrices}
        selectedMatriz={selectedMatriz}
        onMatrizSelect={handleMatrizSelect}
      />
      <button onClick={handleSubmit}>Guardar</button>
    </div>
  )
}
```

### usePreguntasEditor
**Ubicación:** `src/hooks/use-preguntas-editor.ts`

Hook para editar preguntas y alternativas.

```tsx
const {
  editingPregunta,
  editValue,
  openDropdown,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
  handleKeyPress,
  handleDeletePregunta,
  handleDeleteAlternativa,
  handleToggleDropdown,
  handleDropdownAction
} = usePreguntasEditor()
```

**Funcionalidades:**
- Edición inline de preguntas y alternativas
- Gestión de dropdowns de acciones
- Eliminación de elementos
- Reordenamiento automático
- Validaciones de teclado

**Ejemplo de uso:**
```tsx
function PreguntasSidebar({ preguntas, onPreguntasChange }) {
  const {
    editingPregunta,
    editValue,
    handleStartEdit,
    handleSaveEdit,
    handleKeyPress
  } = usePreguntasEditor()

  return (
    <div>
      {preguntas.map(pregunta => (
        <div key={pregunta.numero}>
          {editingPregunta?.numero === pregunta.numero ? (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSaveEdit}
            />
          ) : (
            <span onClick={() => handleStartEdit(pregunta.numero, 'texto')}>
              {pregunta.texto}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
```

### useEvaluacionData
**Ubicación:** `src/hooks/use-evaluacion-data.ts`

Hook personalizado para manejar la carga de datos de evaluaciones y preguntas.

**Propósito:** Centralizar la lógica de carga de datos de evaluaciones, incluyendo resultados y preguntas.

**Parámetros:**
- `evaluacionId` (string | number): ID de la evaluación a cargar

**Retorna:**
```typescript
{
  resultadoData: ResultadoAlumno[] | null;
  preguntas: Pregunta[] | null;
  loading: boolean;
  error: string | null;
}
```

**Tipos:**
```typescript
interface ResultadoAlumno {
  id: number;
  alumno: {
    rut: string;
    nombre: string;
    apellido: string;
  };
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
  nota: number;
  respuestas: RespuestaAlumno[];
}

interface Pregunta {
  id: number;
  numero: number;
  texto: string;
}

interface RespuestaAlumno {
  id: number;
  preguntaId: number;
  alternativaDada: string;
  esCorrecta: boolean;
  puntajeObtenido: number;
}
```

**Características:**
- ✅ **Carga paralela:** Resultados y preguntas se cargan simultáneamente
- ✅ **Error handling:** Manejo robusto de errores sin romper UI
- ✅ **Transformación de datos:** Convierte datos al formato esperado
- ✅ **Estados de carga:** Loading, error y success manejados
- ✅ **Reutilizable:** Se puede usar en múltiples componentes

**Ejemplo de uso:**
```tsx
import { useEvaluacionData } from '@/hooks/use-evaluacion-data';

function GraficosPage({ params }: { params: { id: string } }) {
  const { resultadoData, preguntas, loading, error } = useEvaluacionData(params.id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorDisplay message={error} />;
  if (!resultadoData || !preguntas) return <ErrorDisplay message="No se encontraron datos" />;

  return (
    <div>
      {/* Renderizar tabla con resultadoData y preguntas */}
    </div>
  );
}
```

**APIs utilizadas:**
- `GET /api/evaluaciones/:id/resultados` - Para obtener resultados
- `GET /api/evaluaciones/:id/preguntas` - Para obtener preguntas

**Beneficios:**
- **Separación de responsabilidades:** Lógica de datos separada de UI
- **Reutilización:** Se puede usar en múltiples páginas
- **Testing:** Fácil de testear de forma aislada
- **Mantenibilidad:** Cambios en APIs solo requieren modificar el hook

## 🎤 Hooks de Entrevista

### useInterview
**Ubicación:** `src/hooks/use-interview.ts`

Hook para gestionar el estado de la entrevista interactiva.

```tsx
const {
  currentQuestion,
  answers,
  isComplete,
  progress,
  nextQuestion,
  previousQuestion,
  submitAnswer,
  resetInterview
} = useInterview(questions)
```

**Funcionalidades:**
- Navegación entre preguntas
- Almacenamiento de respuestas
- Cálculo de progreso
- Validación de completitud

### useTTS
**Ubicación:** `src/hooks/use-tts.ts`

Hook para Text-to-Speech.

```tsx
const {
  speak,
  stop,
  isSpeaking,
  voices,
  selectedVoice,
  setVoice
} = useTTS({
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
})
```

**Funcionalidades:**
- Síntesis de voz
- Control de velocidad, tono y volumen
- Lista de voces disponibles
- Estados de reproducción

## 🛠️ Hooks de Utilidades

### useWindowSize
**Ubicación:** `src/hooks/use-window-size.ts`

Hook para detectar cambios en el tamaño de la ventana.

```tsx
const { width, height } = useWindowSize()
```

**Retorna:**
- `width`: Ancho de la ventana
- `height`: Alto de la ventana

### useMobile
**Ubicación:** `src/hooks/use-mobile.ts`

Hook para detectar dispositivos móviles.

```tsx
const { isMobile, isTablet, isDesktop } = useMobile()
```

**Retorna:**
- `isMobile`: true si es dispositivo móvil
- `isTablet`: true si es tablet
- `isDesktop`: true si es desktop

### useCursorVisibility
**Ubicación:** `src/hooks/use-cursor-visibility.ts`

Hook para detectar la visibilidad del cursor.

```tsx
const { isVisible, showCursor, hideCursor } = useCursorVisibility()
```

**Funcionalidades:**
- Detección de movimiento del mouse
- Ocultar/mostrar cursor automáticamente
- Configuración de timeouts

### useMenuNavigation
**Ubicación:** `src/hooks/use-menu-navigation.ts`

Hook para navegación por teclado en menús.

```tsx
const {
  activeIndex,
  handleKeyDown,
  setActiveIndex
} = useMenuNavigation(items.length)
```

**Funcionalidades:**
- Navegación con flechas
- Selección con Enter
- Escape para cerrar
- Loop automático

## 🔄 Patrones de Uso

### Patrón de Formulario Complejo
```tsx
function ComplexForm() {
  // Hook principal del formulario
  const formHook = useMainForm()
  
  // Hooks específicos para secciones
  const editorHook = useEditor()
  const validationHook = useValidation()
  
  // Hook de utilidades
  const { isMobile } = useMobile()
  
  return (
    <form onSubmit={formHook.handleSubmit}>
      <EditorSection hook={editorHook} />
      <ValidationSection hook={validationHook} />
      <SubmitButton disabled={!validationHook.isValid} />
    </form>
  )
}
```

### Patrón de Estado Compartido
```tsx
function ParentComponent() {
  const sharedState = useSharedState()
  
  return (
    <div>
      <ChildA state={sharedState} />
      <ChildB state={sharedState} />
      <ChildC state={sharedState} />
    </div>
  )
}
```

### Patrón de Composición de Hooks
```tsx
function useComplexFeature() {
  const baseHook = useBaseFeature()
  const enhancementHook = useEnhancement()
  const utilityHook = useUtility()
  
  return {
    ...baseHook,
    ...enhancementHook,
    utility: utilityHook
  }
}
```

## ✅ Mejores Prácticas

### 1. Nomenclatura
- Usar prefijo `use` para todos los hooks
- Nombres descriptivos y específicos
- Evitar nombres genéricos como `useData` o `useState`

```tsx
// ✅ Bueno
const { data } = useEvaluacionForm()
const { upload } = useImageUpload()

// ❌ Malo
const { data } = useData()
const { upload } = useUpload()
```

### 2. Estructura de Retorno
- Agrupar valores relacionados
- Usar objetos para múltiples valores
- Mantener consistencia en el orden

```tsx
// ✅ Bueno
return {
  // Estado
  loading, data, error,
  
  // Handlers
  handleSubmit, handleReset,
  
  // Utilidades
  validate, format
}
```

### 3. Manejo de Errores
- Incluir estado de error en todos los hooks
- Proporcionar funciones de manejo de errores
- Logging automático de errores

```tsx
const {
  data,
  error,
  isLoading,
  retry,
  clearError
} = useDataFetching()
```

### 4. Performance
- Usar `useMemo` para cálculos costosos
- Usar `useCallback` para funciones que se pasan como props
- Evitar recrear objetos en cada render

```tsx
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data)
}, [data])

const memoizedHandler = useCallback(() => {
  handleAction(data)
}, [data])
```

### 5. Testing
- Hooks deben ser testables
- Proporcionar mocks para dependencias externas
- Incluir casos de error y edge cases

```tsx
// Test example
test('useEvaluacionForm should handle validation', () => {
  const { result } = renderHook(() => useEvaluacionForm())
  
  act(() => {
    result.current.validateForm()
  })
  
  expect(result.current.errors).toBeDefined()
})
```

## 🔧 Debugging

### React DevTools
- Usar React DevTools para inspeccionar hooks
- Verificar valores de estado
- Monitorear re-renders

### Console Logging
```tsx
function useDebugHook() {
  const state = useState(initialValue)
  
  useEffect(() => {
    console.log('Hook state changed:', state)
  }, [state])
  
  return state
}
```

### Custom Debug Hook
```tsx
function useDebug(identifier, value) {
  useEffect(() => {
    console.log(`${identifier}:`, value)
  }, [identifier, value])
}
```

## 🚀 Próximas Mejoras

### Hooks Planificados
- [ ] `useOffline` - Detección de estado offline
- [ ] `useLocalStorage` - Persistencia local
- [ ] `useDebounce` - Debounce para inputs
- [ ] `useInfiniteScroll` - Scroll infinito
- [ ] `useWebSocket` - Conexiones WebSocket

### Mejoras Técnicas
- [ ] **TypeScript strict mode** para todos los hooks
- [ ] **Testing automático** con Jest y React Testing Library
- [ ] **Documentación automática** con JSDoc
- [ ] **Performance monitoring** con React Profiler
- [ ] **Error boundaries** específicos para hooks

---

**Última actualización:** Julio 2025  
**Versión de hooks:** 1.0  
**Mantenido por:** Equipo de Desarrollo 