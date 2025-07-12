# 🎓 Plataforma Educativa - Educacion App

Una plataforma integral para la gestión educativa que incluye planificación de clases, materiales de apoyo, entrevistas interactivas y gestión de matrices de especificación.

## 🚀 Características Principales

### 📝 **Editor de Contenido Avanzado**
- Editor TipTap con funcionalidades completas de edición
- Guardado y carga de planificaciones y materiales
- Upload de imágenes integrado
- Generación de contenido con IA
- Interfaz moderna y responsive

### 🎯 **Gestión de Matrices de Especificación**
- Creación y edición de matrices
- Gestión de OAs (Objetivos de Aprendizaje)
- Indicadores y preguntas
- Interfaz intuitiva para docentes

### 🎤 **Entrevista Interactiva**
- Sistema de preguntas y respuestas
- Text-to-Speech integrado
- Interfaz conversacional
- Generación de resúmenes

### 📊 **Base de Datos Educativa**
- 13 asignaturas del currículum chileno
- 12 niveles educativos (1° Básico a 4° Medio)
- 12 metodologías de enseñanza
- 37 Objetivos de Aprendizaje (OAs)

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript
- **Editor:** TipTap 2.23
- **Base de Datos:** SQLite con Prisma ORM
- **Estilos:** Tailwind CSS 4, SASS
- **UI Components:** Headless UI, Floating UI
- **Iconos:** Lucide React

## 🚨 Lecciones Aprendidas

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

#### Antes de Hacer Cambios
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

#### Después de Cambios
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

#### 2. **Manejo de Respuestas API**
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

### 📚 **Documentación Completa**
Para más detalles sobre lecciones aprendidas, patrones de código y troubleshooting, consulta:
- **[Lecciones Aprendidas Completas](docs/LECCIONES_APRENDIDAS.md)** - Documento principal de lecciones
- **[Documentación de APIs](docs/API.md)** - Lecciones específicas de APIs
- **[Documentación de Evaluaciones](docs/EVALUACIONES.md)** - Lecciones específicas del módulo de evaluaciones
- **[Índice de Documentación](docs/README.md)** - Documentación completa del proyecto

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm, yarn, pnpm o bun

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Daniel-Visit/educacion.git
cd educacion
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la base de datos (SIMPLIFICADO)**
```bash
# Crear archivo .env con la URL de la base de datos
echo DATABASE_URL="file:./dev.db" > .env

# Generar el cliente de Prisma (la base de datos ya está incluida)
npx prisma generate
```

4. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🗂️ Estructura del Proyecto

```
educacion-app/
├── src/
│   ├── app/                    # Páginas de Next.js App Router
│   │   ├── api/               # APIs REST
│   │   ├── editor/            # Editor de contenido
│   │   ├── entrevista/        # Entrevista interactiva
│   │   ├── matrices/          # Gestión de matrices
│   │   ├── planificacion-anual/ # Planificación anual
│   │   └── simple/            # Editor simple
│   ├── components/            # Componentes React
│   │   ├── editor/           # Componentes del editor
│   │   ├── entrevista/       # Componentes de entrevista
│   │   ├── planificacion-anual/ # Componentes de planificación anual
│   │   ├── tiptap-*          # Componentes TipTap
│   │   └── ui/               # Componentes UI básicos
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilidades y configuraciones
│   └── styles/               # Estilos SCSS
├── prisma/                   # Configuración de base de datos
├── scripts-restauracion/     # Scripts de restauración
└── public/                   # Archivos estáticos
```

## 🎮 Uso de la Aplicación

### Planificación Anual
1. Navega a `/planificacion-anual` o usa el sidebar "Planificación → Planificación Anual"
2. Selecciona un horario existente o crea uno nuevo
3. Abre el drawer "Objetivos de Aprendizaje"
4. Filtra por eje o muestra solo OAs asignables
5. Asigna clases a OAs usando los botones + y -
6. Visualiza la distribución en el calendario interactivo
7. Guarda la planificación con el botón "Guardar"

### Gestión de Planificaciones
1. Navega a `/planificacion-anual/listado` o usa el sidebar "Planificación → Planificaciones"
2. Ve todas las planificaciones guardadas
3. Haz clic en "Ver/Editar" para modificar una planificación existente
4. El horario se preselecciona automáticamente al editar

### Editor de Contenido
1. Navega a `/editor`
2. Selecciona entre "Planificación de Clase" o "Material de Apoyo"
3. Usa el editor TipTap para crear contenido
4. Guarda tu trabajo con el botón "Guardar"
5. Carga archivos existentes desde el FAB flotante

### Gestión de Matrices
1. Ve a `/matrices` para ver todas las matrices
2. Crea una nueva matriz con `/matrices/crear`
3. Edita matrices existentes desde la lista
4. Gestiona OAs e indicadores

### Entrevista Interactiva
1. Accede a `/entrevista`
2. Responde las preguntas interactivamente
3. Escucha las respuestas con TTS
4. Revisa el resumen generado

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linting del código

# Base de datos
npx prisma studio    # Interfaz visual de la BD
npx prisma generate  # Regenerar cliente Prisma
npx prisma db push   # Aplicar cambios al esquema

# Base de datos (ya incluida)
# La base de datos completa con todos los datos ya está incluida en el repositorio
# No es necesario restaurar nada manualmente
```

## 📊 Base de Datos

### Tablas Principales
- **asignatura:** 13 asignaturas del currículum
- **nivel:** 12 niveles educativos
- **metodologia:** 12 metodologías de enseñanza
- **oa:** 37 Objetivos de Aprendizaje
- **archivo:** Contenido guardado del editor
- **imagen:** Imágenes subidas por usuarios
- **MatrizEspecificacion:** Matrices de especificación

### Base de Datos Completa
La base de datos SQLite (`prisma/dev.db`) ya incluye todos los datos:
- 13 asignaturas del currículum chileno
- 12 niveles educativos
- 12 metodologías de enseñanza
- 37 Objetivos de Aprendizaje (OAs)
- Archivos de ejemplo
- No es necesario restaurar nada manualmente

## 🔒 Seguridad y Respaldo

- **Respaldo automático:** La base de datos se respalda automáticamente
- **Scripts de restauración:** Sistema modular para restaurar datos específicos
- **Validación de datos:** Verificación de integridad en todas las operaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para la comunidad educativa**
