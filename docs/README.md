# 📚 Documentación de la Plataforma Educativa

Bienvenido a la documentación completa de la Plataforma Educativa. Esta documentación está organizada por módulos para facilitar la navegación y comprensión del sistema.

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

## 🚀 Guías de Inicio Rápido

### Para Desarrolladores
1. **Instalación:** Sigue el [README principal](../README.md)
2. **Base de datos:** Consulta [DATABASE.md](./DATABASE.md)
3. **APIs:** Revisa [API.md](./API.md)
4. **Hooks:** Consulta [HOOKS.md](./HOOKS.md) para patrones y mejores prácticas
5. **Módulos específicos:** Selecciona según tu interés

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
│   ├── README.md             # Índice de documentación
│   ├── EDITOR.md             # Documentación del editor
│   ├── MATRICES.md           # Documentación de matrices
│   ├── EVALUACIONES.md       # Documentación de evaluaciones
│   ├── ENTREVISTA.md         # Documentación de entrevista
│   ├── API.md                # Documentación de APIs
│   ├── HOOKS.md              # Documentación de hooks
│   ├── ARQUITECTURA.md       # Documentación de arquitectura
│   └── DATABASE.md           # Documentación de base de datos
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

## 📈 Contribución

### Para Contribuir
1. **Fork** el repositorio
2. **Crea** una rama para tu feature
3. **Documenta** tus cambios
4. **Actualiza** la documentación relevante
5. **Envía** un Pull Request

### Estándares de Documentación
- **Markdown** para todos los archivos
- **Emojis** para mejor navegación
- **Ejemplos de código** cuando sea posible
- **Sección de troubleshooting** en cada módulo

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
**Versión de documentación:** 1.0  
**Mantenido por:** Equipo de Desarrollo 