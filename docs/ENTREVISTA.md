# 🎤 Entrevista Interactiva

## Sincronización y Navegación (Actualizado 2024)

La entrevista ahora cuenta con una **sincronización bidireccional profesional** entre el sidebar, la URL y el estado interno:

- El paso actual de la entrevista (`step`) y el máximo paso alcanzado (`maxStep`) se sincronizan con el parámetro `step` en la URL.
- El usuario solo puede navegar en el sidebar hasta el `maxStep` alcanzado. Los pasos futuros aparecen deshabilitados.
- Si el usuario navega hacia atrás, puede editar respuestas previas. Si avanza, el sidebar habilita el siguiente paso.
- Si el usuario intenta ir a un paso futuro (por URL o sidebar), la entrevista lo redirige automáticamente al último paso permitido.
- El sidebar muestra un check alineado a la derecha en los pasos completados.
- El resumen y la entrevista siempre están alineados con la URL y el sidebar.

**Notas para desarrolladores:**
- Para agregar nuevos pasos, solo hay que actualizar el array de pasos y la lógica de preguntas. La sincronización se mantiene automáticamente.
- El estado de respuestas se conserva al retroceder y puede editarse.

## Descripción General

El módulo de entrevista interactiva proporciona una experiencia conversacional para recopilar información educativa a través de preguntas dinámicas, respuestas de texto a voz y generación de resúmenes automáticos.

## Características Principales

### ✨ Funcionalidades de la Entrevista
- **Preguntas dinámicas** basadas en respuestas previas
- **Text-to-Speech (TTS)** para respuestas orales
- **Interfaz conversacional** moderna y atractiva
- **Generación de resúmenes** automáticos
- **Animaciones fluidas** y transiciones suaves
- **Diseño responsive** para todos los dispositivos

### 🎨 Elementos de Interfaz
- **Orb animado** como elemento visual central (no se muestra en el resumen)
- **Tarjetas de conversación** con preguntas y respuestas
- **Sidebar** con progreso, navegación segura y checks alineados
- **Botones de control** para TTS y navegación
- **Resumen final** con información recopilada, centrado y destacado

## Estructura de Archivos

```
src/app/entrevista/
└── page.tsx                    # Página principal de entrevista

src/components/entrevista/
├── constants.ts               # Constantes y configuración
├── Dropdown.tsx               # Componente de selección
├── InterviewCard.tsx          # Tarjeta de pregunta/respuesta
├── OrbVideo.tsx               # Orb animado central
├── Sidebar.tsx                # Sidebar de navegación
├── Summary.tsx                # Componente de resumen
├── TypewriterText.tsx         # Efecto de escritura
├── useInterview.ts            # Hook principal de entrevista
├── useTTS.ts                  # Hook de text-to-speech
└── index.ts                   # Exportaciones

src/app/api/
└── metodologias/
    └── route.ts               # API de metodologías
```

## Uso del Módulo

### 1. Acceso a la Entrevista
```bash
# Navegar a la página de entrevista
http://localhost:3000/entrevista
```

### 2. Flujo de la Entrevista
1. **Inicio:** Se presenta la entrevista con animación del orb
2. **Preguntas:** Se muestran preguntas una por una
3. **Respuestas:** El usuario selecciona o ingresa respuestas
4. **TTS:** Las respuestas se leen en voz alta
5. **Navegación:** Se puede avanzar/retroceder con controles
6. **Resumen:** Al final se muestra un resumen completo

### 3. Controles Disponibles
- **Play/Pause:** Controlar reproducción de audio
- **Anterior/Siguiente:** Navegar entre preguntas
- **Volumen:** Ajustar volumen del TTS
- **Velocidad:** Cambiar velocidad de reproducción

## Configuración de Preguntas

### Estructura de Pregunta
```typescript
interface Question {
  id: string
  text: string
  type: 'text' | 'select' | 'multiselect'
  options?: string[]
  required?: boolean
  conditional?: {
    questionId: string
    value: string
  }
}
```

### Tipos de Preguntas
1. **Texto libre:** Respuesta abierta del usuario
2. **Selección única:** Una opción de una lista
3. **Selección múltiple:** Varias opciones de una lista

### Preguntas Condicionales
```typescript
{
  id: 'metodologia',
  text: '¿Qué metodología prefieres?',
  type: 'select',
  options: ['ABP', 'Aula Invertida', 'Gamificación'],
  conditional: {
    questionId: 'tipo_planificacion',
    value: 'planificacion'
  }
}
```

## APIs de la Entrevista

### Metodologías (`/api/metodologias`)

#### GET `/api/metodologias`
Obtiene todas las metodologías disponibles.
```typescript
// Response
{
  id: number
  nombre_metodologia: string
  descripcion: string
  nivel_recomendado: string
  fuentes_literatura: string
}[]
```

## Hooks Personalizados

### useInterview
```typescript
const {
  currentQuestion,
  answers,
  progress,
  isComplete,
  goToNext,
  goToPrevious,
  updateAnswer,
  resetInterview
} = useInterview()
```

### useTTS
```typescript
const {
  speak,
  stop,
  isPlaying,
  isSupported,
  rate,
  setRate,
  volume,
  setVolume
} = useTTS()
```

## Base de Datos

### Tabla `metodologia`
```sql
CREATE TABLE metodologia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_metodologia TEXT UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  nivel_recomendado TEXT NOT NULL,
  fuentes_literatura TEXT NOT NULL
);
```

### Datos de Entrevista
```sql
-- Preguntas y respuestas se manejan en el frontend
-- Los datos se pueden exportar o guardar según necesidad
```

## Componentes de Interfaz

### OrbVideo
- **Animación central** que cambia según el estado
- **Transiciones suaves** entre estados
- **Responsive design** para diferentes pantallas

### InterviewCard
- **Tarjeta de pregunta** con diseño moderno
- **Tipos de input** según el tipo de pregunta
- **Validación visual** de respuestas

### Sidebar
- **Progreso visual** de la entrevista
- **Navegación segura**: solo hasta el paso alcanzado (`maxStep`)
- **Pasos futuros deshabilitados** visualmente
- **Checks alineados a la derecha** en pasos completados
- **Sincronización con la URL y la entrevista**

### Summary
- **Resumen estructurado** de todas las respuestas
- **Diseño centrado, sin Orb ni card de fondo**
- **Card principal con sombra, icono grande y buen margen superior**
- **Respuestas organizadas en cards con check**
- **Botón destacado para continuar**

## Text-to-Speech (TTS)

### Configuración
```typescript
const ttsConfig = {
  rate: 1.0,        // Velocidad de reproducción
  volume: 1.0,      // Volumen (0-1)
  pitch: 1.0,       // Tono de voz
  lang: 'es-ES'     // Idioma español
}
```

### Funcionalidades
- **Reproducción automática** de respuestas
- **Control manual** de play/pause
- **Ajuste de velocidad** en tiempo real
- **Detección de soporte** del navegador

### Compatibilidad
- **Chrome/Edge:** Soporte completo
- **Firefox:** Soporte básico
- **Safari:** Soporte limitado
- **Mobile:** Soporte nativo

## Flujo de Datos

### 1. Inicialización
```typescript
// Cargar preguntas y configuración
const questions = loadQuestions()
const tts = initializeTTS()
```

### 2. Procesamiento de Respuestas
```typescript
// Validar y procesar respuesta
const processedAnswer = processAnswer(answer, question)
updateInterviewState(processedAnswer)
```

### 3. Navegación
```typescript
// Determinar siguiente pregunta
const nextQuestion = determineNextQuestion(currentQuestion, answers)
navigateToQuestion(nextQuestion)
```

### 4. Generación de Resumen
```typescript
// Crear resumen final
const summary = generateSummary(answers, questions)
displaySummary(summary)
```

## Estilos y Animaciones

### Variables SCSS
```scss
// src/styles/_variables.scss
$orb-size: 200px;
$card-border-radius: 16px;
$transition-duration: 0.3s;
$gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Animaciones CSS
```scss
// src/styles/_keyframe-animations.scss
@keyframes orb-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes card-slide-in {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}
```

## Troubleshooting

### Problemas Comunes

1. **TTS no funciona:**
   - Verificar que el navegador soporte SpeechSynthesis
   - Revisar permisos de audio
   - Comprobar que no esté en modo silencioso

2. **Animaciones lentas:**
   - Verificar rendimiento del dispositivo
   - Reducir complejidad de animaciones
   - Usar `will-change` CSS para optimización

3. **Preguntas no cargan:**
   - Verificar conexión a internet
   - Revisar consola para errores de API
   - Comprobar que las constantes estén definidas

### Logs de Debug
```bash
# Ver logs del navegador
F12 > Console

# Verificar TTS
window.speechSynthesis.getVoices()

# Verificar estado de la entrevista
console.log(interviewState)
```

## Mejoras Futuras

- [ ] Guardado de respuestas en base de datos
- [ ] Exportación a PDF/Word
- [ ] Múltiples idiomas
- [ ] Voz personalizable
- [ ] Preguntas dinámicas basadas en IA
- [ ] Integración con otros módulos
- [ ] Modo offline
- [ ] Accesibilidad mejorada
- [ ] Analytics de uso
- [ ] Plantillas de entrevista personalizables 