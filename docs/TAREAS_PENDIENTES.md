# 📋 Tareas Pendientes - Sistema de Planificación Anual

## 🎯 Objetivo
Completar el sistema de planificación anual con configuración de horarios y gestión de planificaciones guardadas.

## 📅 Estado Actual
- ✅ **Planificación Anual Básica** - Implementada
  - Calendario interactivo con eventos por eje
  - Drawer de OAs con filtros y asignación
  - Colores diferenciados por eje
  - Componentes modulares y refactorizados
  - Documentación completa

- ✅ **Sistema de Botones de Eje** - Implementado (Hoy)
  - Botones `+` y `-` en cada eje para habilitar/deshabilitar OA
  - Lógica de restricción mejorada con OA del eje "actitud" siempre disponibles
  - Control granular de asignación de OA fuera del orden estricto
  - Integración completa con sistema de filtrado existente
  - Documentación técnica completa

## 🚧 Tareas Pendientes

### 🧪 **Fase 0: Implementación de Testing (COMPLETADO ✅)**
- [x] **Configurar Jest + Supertest** para testing de APIs
- [x] **Crear estructura de carpetas** para tests
- [x] **Implementar tests para API de horarios** existente
- [x] **Establecer workflow de testing** automático
- [x] **Configurar scripts de testing** en package.json
- [x] **Documentar estrategia de testing** continua
- [x] **Crear tests para APIs existentes** (evaluaciones, archivos, etc.)

### 🧪 **Fase Final: Testing Completo de la Plataforma (4 días intensivos)**

#### **📋 Plan Eficiente - 4 Días Intensivos**

##### **Día 1: APIs Completas (1 día intensivo)**
- [ ] **Tests para TODAS las APIs** (reutilizando estructura de horarios.test.js):
  - [ ] `/api/evaluaciones` (GET, POST, PUT, DELETE) - 8 tests
  - [ ] `/api/matrices` (GET, POST, PUT, DELETE) - 8 tests
  - [ ] `/api/archivos` (GET, POST, PUT, DELETE) - 8 tests
  - [ ] `/api/metodologias` (GET) - 4 tests
  - [ ] `/api/oas` (GET) - 4 tests
  - [ ] `/api/ejes` (GET) - 4 tests
  - [ ] `/api/imagenes` (GET, POST, PUT, DELETE) - 8 tests
  - [ ] Completar `/api/horarios` (PUT, DELETE) - 4 tests
  - **Total**: ~48 tests en 1 día intensivo

##### **Día 2: Componentes Completos (1 día intensivo)**
- [ ] **Tests para TODOS los componentes**:
  - [ ] `EvaluacionForm.tsx`, `MatrizSelector.tsx`, `MatrizForm.tsx` - 18 tests
  - [ ] `SimpleEditor.tsx`, `SaveContentModal.tsx` - 12 tests
  - [ ] `EventCalendar.tsx`, `DayView.tsx`, `MonthView.tsx` - 18 tests
  - [ ] `AppShell.tsx`, `Drawer.tsx`, `Fab.tsx`, `Sidebar.tsx` - 16 tests
  - [ ] `InterviewCard.tsx`, `Sidebar.tsx` (entrevista) - 12 tests
  - [ ] `EjeSection.tsx`, `OACard.tsx`, `OADrawerContent.tsx` - 12 tests
  - **Total**: ~88 tests en 1 día intensivo

##### **Día 3: Integración + Utilidades (1 día intensivo)**
- [ ] **Tests para flujos + utilidades + DB**:
  - [ ] Flujo completo de creación de evaluación - 6 tests
  - [ ] Flujo completo de creación de matriz - 6 tests
  - [ ] Flujo completo de planificación anual - 6 tests
  - [ ] Flujo completo de entrevista - 6 tests
  - [ ] Flujo completo de editor de contenido - 6 tests
  - [ ] `use-evaluacion-form.ts`, `use-planificacion-anual.ts` - 10 tests
  - [ ] `use-tiptap-editor.ts`, `extract-evaluacion.ts` - 10 tests
  - [ ] Tests de base de datos (relaciones, constraints) - 10 tests
  - **Total**: ~68 tests en 1 día intensivo

##### **Día 4: Calidad + CI/CD + Documentación (1 día intensivo)**
- [ ] **Tests de calidad + configuración + documentación**:
  - [ ] Edge cases críticos - 10 tests
  - [ ] Performance básico - 8 tests
  - [ ] Tests de accesibilidad básicos - 6 tests
  - [ ] Tests de seguridad básicos - 6 tests
  - [ ] CI/CD básico (pipeline, commits, reportes)
  - [ ] Documentación completa (guías, ejemplos, refinamiento)
  - **Total**: ~30 tests + configuración + documentación

#### **🎯 Resultado Esperado (4 días intensivos)**
- ✅ **234+ tests** implementados
- ✅ **90%+ cobertura** del código completo
- ✅ **CI/CD completo** funcionando
- ✅ **Documentación** completa
- ✅ **Base sólida** para desarrollo futuro

#### **📊 Estrategias de Optimización**
- [ ] **Reutilización de código**: Templates de tests
- [ ] **Tests automatizados**: Scripts de generación
- [ ] **Priorización inteligente**: Crítico → Importante → Opcional
- [ ] **Paralelización**: 2 desarrolladores trabajando simultáneamente

### 🔧 Fase 1: Configuración de Horario Docente

#### 1.1 Modelo de Base de Datos
- [ ] **Crear tablas en Prisma Schema:**
  ```sql
  -- Tabla de profesores
  model Profesor {
    id          Int      @id @default(autoincrement())
    rut         String   @unique
    nombre      String
    email       String?
    telefono    String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    asignaturas ProfesorAsignatura[]
    niveles     ProfesorNivel[]
    modulos     ModuloHorarioProfesor[]
  }

  -- Tabla de relación profesor-asignatura
  model ProfesorAsignatura {
    id          Int      @id @default(autoincrement())
    profesorId  Int
    asignaturaId Int
    profesor    Profesor   @relation(fields: [profesorId], references: [id], onDelete: Cascade)
    asignatura  asignatura @relation(fields: [asignaturaId], references: [id], onDelete: Cascade)

    @@unique([profesorId, asignaturaId])
  }

  -- Tabla de relación profesor-nivel
  model ProfesorNivel {
    id          Int      @id @default(autoincrement())
    profesorId  Int
    nivelId     Int
    profesor    Profesor @relation(fields: [profesorId], references: [id], onDelete: Cascade)
    nivel       nivel    @relation(fields: [nivelId], references: [id], onDelete: Cascade)

    @@unique([profesorId, nivelId])
  }

  -- Tabla de horarios
  model Horario {
    id          Int      @id @default(autoincrement())
    nombre      String
    docenteId   Int      // Profesor titular
    asignaturaId Int     // FK a asignatura
    nivelId     Int      // FK a nivel
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    asignatura  asignatura @relation(fields: [asignaturaId], references: [id])
    nivel       nivel      @relation(fields: [nivelId], references: [id])
    modulos     ModuloHorario[]
    planificaciones PlanificacionAnual[]
  }

  -- Tabla de módulos horarios
  model ModuloHorario {
    id          Int      @id @default(autoincrement())
    horarioId   Int
    dia         String   // 'Lunes', 'Martes', etc.
    horaInicio  String   // '08:00' - HORA DE COMIENZO DE LA CLASE
    duracion    Int      // Duración en minutos (30, 45, 60, 90, 120)
    orden       Int      // Orden dentro del día
    horario     Horario  @relation(fields: [horarioId], references: [id], onDelete: Cascade)
    asignaciones AsignacionOA[]
    profesores  ModuloHorarioProfesor[]
  }

  -- Tabla de relación módulo-profesor (para titular y ayudantes)
  model ModuloHorarioProfesor {
    id          Int      @id @default(autoincrement())
    moduloHorarioId Int
    profesorId  Int
    rol         String   // 'titular' o 'ayudante'
    moduloHorario ModuloHorario @relation(fields: [moduloHorarioId], references: [id], onDelete: Cascade)
    profesor    Profesor @relation(fields: [profesorId], references: [id], onDelete: Cascade)

    @@unique([moduloHorarioId, profesorId, rol])
  }
  ```

#### 1.2 API Endpoints
- [ ] **Crear API `/api/profesores`:**
  - `GET /api/profesores` - Listar todos los profesores
  - `POST /api/profesores` - Crear nuevo profesor
  - `PUT /api/profesores/:id` - Actualizar profesor
  - `DELETE /api/profesores/:id` - Eliminar profesor
  - `GET /api/profesores/:id` - Obtener profesor específico
  - `GET /api/profesores/asignatura/:asignaturaId` - Filtrar por asignatura
  - `GET /api/profesores/nivel/:nivelId` - Filtrar por nivel
  - `GET /api/profesores/asignatura/:asignaturaId/nivel/:nivelId` - Filtrar por asignatura y nivel

- [ ] **Crear API `/api/horarios`:**
  - `GET /api/horarios` - Listar horarios del docente
  - `POST /api/horarios` - Crear nuevo horario
  - `PUT /api/horarios/:id` - Actualizar horario
  - `DELETE /api/horarios/:id` - Eliminar horario
  - `GET /api/horarios/:id` - Obtener horario específico

#### 1.3 Pantalla de Gestión de Horarios
- [ ] **Crear página `/horarios`**
- [ ] **Componente `HorariosList.tsx`:**
  - Lista de horarios guardados del docente
  - **Filtros avanzados:**
    - Filtro por asignatura
    - Filtro por nivel
    - Filtro por profesor titular
    - Filtro por nombre
    - Filtro por fecha de creación
  - Botón "Crear Nuevo Horario" que abre modal
  - Botón "Usar Horario" que navega a planificación anual
  - **Información mostrada por horario:**
    - Nombre del horario
    - Asignatura y nivel
    - Profesor titular
    - Fecha de creación
    - Número de módulos configurados
  - Botones para editar, duplicar, eliminar horarios
- [ ] **Componente `CrearHorarioModal.tsx`:**
  - Modal para crear nuevo horario
  - **Formulario de configuración:**
    - **Selector de asignatura:** Lista desplegable con asignaturas disponibles
    - **Selector de nivel:** Lista desplegable con niveles disponibles
    - **Campo nombre:** Nombre descriptivo del horario
  - **Grid semanal interactivo** (Lunes a Viernes, 8:00 AM - 6:00 PM)
  - **Opciones de UI para configuración:**
    - **Selector de hora de comienzo:** Lista desplegable con horas (8:00-18:00)
    - **Selector de duración:** Lista desplegable con duraciones (30min, 45min, 1h, 1.5h, 2h)
    - **Selector de día:** Lista desplegable con días (Lun-Vie)
    - **Selector de profesores por bloque:**
      - **Profesor titular:** Dropdown con profesores que imparten la asignatura/nivel
      - **Profesores ayudantes:** Multi-select con profesores disponibles
      - **Validación:** Al menos un profesor titular por bloque
    - Selector de bloques de tiempo con drag & drop
    - Vista de calendario semanal con slots clickeables
    - Botones de acción rápida para duraciones comunes (1h, 2h, etc.)
  - Botones para agregar/eliminar bloques
  - Validación de solapamientos
  - Botón "Crear y Usar" que guarda y navega a planificación
- [ ] **Hook `use-horarios.ts`:**
  - Gestión de lista de horarios
  - Creación y edición de horarios
  - **Carga de asignaturas, niveles y profesores:**
    - Obtener lista de asignaturas disponibles
    - Obtener lista de niveles disponibles
    - Obtener lista de profesores disponibles
    - Filtrar profesores por asignatura y nivel
    - Filtrar horarios por asignatura, nivel y profesor
  - Validaciones de bloques
  - Navegación a planificación anual

#### 1.4 Validaciones
- [ ] **Validaciones de horario:**
  - No permitir bloques solapados en el mismo día
  - **Restricciones de horario:**
    - Solo días de Lunes a Viernes
    - Horario permitido: 8:00 AM a 6:00 PM (08:00 - 18:00)
    - No permitir bloques fuera de este rango
  - Horas de inicio y fin válidas (formato HH:MM)
  - Al menos un bloque por semana antes de guardar
  - Nombre único para cada horario del docente
  - **Validaciones de bloques:**
    - **Hora de comienzo:** Entre 8:00 AM y 6:00 PM
    - **Duración:** Opciones predefinidas (30min, 45min, 1h, 1.5h, 2h)
    - Duración mínima de 30 minutos
    - Duración máxima de 4 horas por bloque
    - Máximo 8 horas por día
    - **Cálculo automático:** horaFin = horaInicio + duración
- [ ] **Validaciones de asignatura y nivel:**
    - Asignatura y nivel son obligatorios al crear horario
    - No permitir horarios duplicados para la misma asignatura/nivel/docente
    - Validar que la asignatura y nivel existan en la base de datos
- [ ] **Validaciones de profesores:**
    - Al menos un profesor titular por módulo
    - Profesores deben impartir la asignatura y nivel seleccionados
    - No permitir el mismo profesor como titular y ayudante en el mismo módulo
    - Validar que los profesores existan en la base de datos

### 🔧 Fase 2: Gestión de Planificaciones Guardadas

#### 2.1 Modelo de Base de Datos
- [ ] **Crear tablas en Prisma Schema:**
  ```sql
  -- Tabla de planificaciones anuales
  model PlanificacionAnual {
    id          Int      @id @default(autoincrement())
    nombre      String
    horarioId   Int
    anoAcademico Int
    docenteId   Int
    asignaturaId Int     // FK a asignatura
    nivelId     Int      // FK a nivel
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    horario     Horario  @relation(fields: [horarioId], references: [id])
    asignatura  asignatura @relation(fields: [asignaturaId], references: [id])
    nivel       nivel      @relation(fields: [nivelId], references: [id])
    asignaciones AsignacionOA[]
  }

  -- Tabla de asignaciones de OAs
  model AsignacionOA {
    id          Int      @id @default(autoincrement())
    planificacionId Int
    moduloHorarioId Int
    oaId        Int
    fechaPlanificada String // ISO date
    estado      String   @default("pendiente") // 'pendiente', 'en_progreso', 'completado'
    planificacion PlanificacionAnual @relation(fields: [planificacionId], references: [id], onDelete: Cascade)
    moduloHorario ModuloHorario @relation(fields: [moduloHorarioId], references: [id])
    oa          OA       @relation(fields: [oaId], references: [id])
  }
  ```

#### 2.2 API Endpoints
- [ ] **Crear API `/api/planificaciones-anuales`:**
  - `GET /api/planificaciones-anuales` - Listar planificaciones del docente
  - `POST /api/planificaciones-anuales` - Crear nueva planificación
  - `PUT /api/planificaciones-anuales/:id` - Actualizar planificación
  - `GET /api/planificaciones-anuales/:id` - Obtener planificación específica
  - `DELETE /api/planificaciones-anuales/:id` - Eliminar planificación

#### 2.3 Componentes de Gestión
- [ ] **Componente `PlanificacionesList.tsx`:**
  - Lista de planificaciones guardadas
  - **Filtros avanzados:**
    - Filtro por asignatura
    - Filtro por nivel
    - Filtro por año académico
    - Filtro por nombre
    - Filtro por fecha
  - **Información mostrada por planificación:**
    - Nombre de la planificación
    - Asignatura y nivel
    - Año académico
    - Fecha de creación
    - Número de OAs asignados
  - Botones para cargar, editar, duplicar, eliminar
- [ ] **Componente `SavePlanificacionModal.tsx`:**
  - Modal para guardar planificación actual
  - **Formulario de guardado:**
    - Campo nombre de la planificación
    - Selector de año académico
    - **Información del horario:** Asignatura y nivel (solo lectura)
    - Opción para sobrescribir o guardar como nueva
- [ ] **Componente `LoadPlanificacionModal.tsx`:**
  - Modal para seleccionar planificación a cargar
  - **Filtros de búsqueda:**
    - Filtro por asignatura
    - Filtro por nivel
    - Filtro por año académico
  - **Vista previa de la planificación:**
    - Información del horario (asignatura, nivel, días)
    - Número de OAs asignados
    - Fecha de creación
  - Confirmación de carga
- [ ] **Componente `ImportCSVModal.tsx`** (NUEVO REQUERIMIENTO):
  - Modal para subir archivo CSV
  - Drag & drop para subir archivo
  - Validación de formato CSV
  - Preview de eventos a importar
  - Opciones: sobrescribir o agregar a eventos existentes
  - Botones: Cancelar, Importar

#### 2.4 Hook de Gestión
- [ ] **Hook `use-planificaciones.ts`:**
  - Carga de planificaciones guardadas
  - **Filtrado por asignatura y nivel:**
    - Filtrar planificaciones por asignatura
    - Filtrar planificaciones por nivel
    - Combinar filtros para búsqueda específica
  - Guardado de planificación actual
  - Carga de planificación específica
  - Validaciones de guardado
- [ ] **Hook `use-csv-import.ts`** (NUEVO REQUERIMIENTO):
  - Parseo de archivo CSV
  - Validación de formato y datos
  - Conversión de datos CSV a eventos del calendario
  - Manejo de errores de importación
  - Preview de eventos antes de importar

### 🔧 Fase 3: Navegación y Estructura del Sidebar

#### 3.1 Actualización del Sidebar Principal
- [ ] **Modificar `src/components/ui/Sidebar.tsx`:**
  - Agregar submenu "Planificación" con ícono Calendar
  - Submenu "Horarios" que enlaza a `/horarios`
  - Submenu "Calendario" que enlaza a `/planificacion-anual`
  - Mantener estructura consistente con otros submenús
- [ ] **Estructura del submenu propuesta:**
  ```tsx
  {
    name: 'Planificación',
    href: '/planificacion-anual',
    icon: Calendar,
    submenu: [
      { name: 'Horarios', href: '/horarios' },
      { name: 'Calendario', href: '/planificacion-anual' }
    ]
  }
  ```

#### 3.2 Flujo de Navegación
- [ ] **Flujo desde Sidebar:**
  1. Usuario hace clic en "Planificación" → Se expande submenu
  2. Usuario hace clic en "Horarios" → Va a `/horarios`
  3. Usuario crea/selecciona horario → Navega a `/planificacion-anual?horarioId=X`
  4. Usuario hace clic en "Calendario" → Va a `/planificacion-anual` (sin horario)
- [ ] **Flujo desde Horarios:**
  1. Usuario está en `/horarios`
  2. Usuario hace clic en "Crear Nuevo Horario" → Abre modal
  3. Usuario configura horario y hace clic en "Crear y Usar" → Navega a planificación
  4. Usuario hace clic en "Usar Horario" en lista → Navega a planificación

### 🔧 Fase 4: Integración y Mejoras

#### 4.1 Integración con Planificación Anual
- [ ] **Modificar página `/planificacion-anual`:**
  - Recibir horarioId como parámetro de URL
  - Cargar horario seleccionado automáticamente
  - **Mostrar información del horario en el header:**
    - Nombre del horario
    - Asignatura y nivel asociados
    - Profesor titular del horario
    - Horario configurado (días y horas)
  - **Filtros de OAs por asignatura y nivel:**
    - Cargar OAs específicos de la asignatura y nivel del horario
    - Filtrar drawer de OAs automáticamente
    - Mostrar solo OAs relevantes para la planificación
  - Agregar botón "Guardar Planificación"
  - Agregar botón "Cargar Planificación"
  - Agregar botón "Cambiar Horario" que redirige a `/horarios`
  - **Agregar botón "Importar CSV"** (NUEVO REQUERIMIENTO)
    - Abre modal para subir archivo CSV
    - Valida formato del archivo
    - Muestra preview de eventos a importar
    - Permite confirmar o cancelar importación

#### 4.2 Mejoras en la UI
- [ ] **Mejoras en el calendario:**
  - Mostrar horario seleccionado en el header
  - **Información de profesores en eventos:**
    - Mostrar profesor titular en cada evento
    - Mostrar profesores ayudantes si existen
    - Tooltips con información completa del evento
  - Indicadores visuales de módulos sin asignar
  - Tooltips con información del OA asignado
- [ ] **Mejoras en el drawer:**
  - Mostrar progreso de asignación por eje
  - Indicadores de planificación guardada
  - Botones de acción rápida

#### 4.3 Validaciones Avanzadas
- [ ] **Validaciones de planificación:**
  - Verificar que todos los OAs obligatorios estén asignados
  - Validar distribución temporal equilibrada
  - Alertas de módulos sin asignar
  - Sugerencias de optimización

### 🔧 Fase 5: Funcionalidades Avanzadas

#### 5.1 Exportación e Importación
- [ ] **Exportar planificación:**
  - Exportar a PDF con formato profesional
  - Exportar a Excel para análisis
  - Compartir planificación con otros docentes
- [ ] **Importar planificación:**
  - Importar desde Excel
  - **Importar desde CSV** (NUEVO REQUERIMIENTO)
    - Subir archivo CSV con eventos de planificación
    - Validar formato: título, fecha_inicio, fecha_fin, descripción, ubicación, color
    - Convertir a eventos del calendario (no OAs asignados)
    - Mostrar preview antes de importar
    - Opción de sobrescribir o agregar a eventos existentes
  - Duplicar planificación de otro docente
  - Plantillas predefinidas por asignatura

#### 5.2 Analytics y Reportes
- [ ] **Métricas de planificación:**
  - Cobertura de OAs por período
  - Distribución temporal por eje
  - Eficiencia en asignación de tiempo
  - Comparación con años anteriores

#### 5.3 Integración con Otros Módulos
- [ ] **Integración con Editor:**
  - Generar planificaciones de clase desde OAs asignados
  - Vincular contenido con OAs específicos
- [ ] **Integración con Evaluaciones:**
  - Crear matrices basadas en OAs planificados
  - Programar evaluaciones según planificación

## 🆕 Requerimientos Adicionales

### 📋 Importación de Planificaciones desde CSV
- [ ] **Descripción:** Permitir importar planificaciones desde archivos CSV en la pantalla del calendario
- [ ] **Prioridad:** Media
- [ ] **Fase:** Fase 4 - Integración y Mejoras
- [ ] **Criterios de aceptación:** 
  - Usuario puede subir archivo CSV con eventos de planificación
  - Los eventos se importan como eventos del calendario (no como OAs asignados)
  - El sistema valida formato del CSV y muestra errores si es necesario
  - Los eventos importados se pueden editar manualmente en el calendario
  - Se mantiene compatibilidad con eventos manuales existentes
- [ ] **Estimación:** 2-3 días de desarrollo

### 📝 Notas del Requerimiento
- **Fecha de registro:** Julio 2025
- **Estado:** Planificado
- **Contexto:** El calendario ya permite agregar eventos manualmente sin usar el drawer de OAs. Esta funcionalidad permitirá importar planificaciones predefinidas desde CSV que no necesariamente cumplan con el horario establecido, ya que son solo eventos del calendario.

## 📊 Priorización

### 🔥 Alta Prioridad (Fase 1)
1. Modelo de base de datos para horarios
2. API endpoints básicos
3. Pantalla de configuración de horario
4. Integración con planificación anual

### 🔶 Media Prioridad (Fase 2-3)
1. Modelo de base de datos para planificaciones
2. API endpoints para planificaciones
3. Componentes de gestión
4. Guardado y carga de planificaciones
5. Navegación y estructura del sidebar

### 🔵 Baja Prioridad (Fase 4-5)
1. Mejoras en UI/UX
2. Funcionalidades avanzadas
3. Analytics y reportes
4. Integración con otros módulos

## 🎯 Criterios de Aceptación

### Para Configuración de Horario
- [ ] El docente puede crear y guardar múltiples horarios
- [ ] El sistema valida que no haya solapamientos
- [ ] El horario se puede seleccionar en la planificación anual
- [ ] La interfaz es intuitiva y fácil de usar
- [ ] **Asignatura, nivel y profesores son obligatorios:**
  - Se debe seleccionar asignatura al crear horario
  - Se debe seleccionar nivel al crear horario
  - Se debe seleccionar al menos un profesor titular por módulo
  - No se permiten horarios duplicados para la misma asignatura/nivel
- [ ] **Restricciones de horario aplicadas:**
  - Solo se permiten días de Lunes a Viernes
  - Horario restringido de 8:00 AM a 6:00 PM
  - No se pueden crear bloques fuera del rango permitido
- [ ] **Opciones de UI funcionan correctamente:**
  - Grid semanal interactivo con slots clickeables
  - **Selectores específicos funcionan:**
    - Selector de asignatura
    - Selector de nivel
    - Selector de profesor titular
    - Selector de profesores ayudantes (multi-select)
    - Selector de día (Lun-Vie)
    - Selector de hora de comienzo (8:00-18:00)
    - Selector de duración (30min, 45min, 1h, 1.5h, 2h)
  - Drag & drop para crear bloques de tiempo
  - Botones de acción rápida funcionan
  - Vista previa en tiempo real del horario
  - **Información de bloques se muestra correctamente:**
    - Hora de comienzo visible en cada bloque
    - Duración visible en cada bloque
    - Cálculo automático de hora de fin

### Para Gestión de Planificaciones
- [ ] El docente puede guardar la planificación actual
- [ ] Se pueden listar y cargar planificaciones guardadas
- [ ] Se pueden editar y duplicar planificaciones
- [ ] Los datos se persisten correctamente en la base de datos
- [ ] **Filtrado por asignatura y nivel funciona:**
  - Se filtran planificaciones por asignatura
  - Se filtran planificaciones por nivel
  - Se muestran solo OAs relevantes para la asignatura/nivel
  - La información de asignatura y nivel se muestra correctamente

### Para Navegación y Sidebar
- [ ] El submenu "Planificación" se expande correctamente
- [ ] Los enlaces "Horarios" y "Calendario" funcionan
- [ ] La navegación desde horarios a planificación funciona con parámetros
- [ ] El flujo de creación de horario es intuitivo

### Para Importación CSV (NUEVO REQUERIMIENTO)
- [ ] El botón "Importar CSV" está visible en la pantalla del calendario
- [ ] Se puede subir archivo CSV mediante drag & drop o click
- [ ] El sistema valida el formato del CSV y muestra errores apropiados
- [ ] Se muestra preview de los eventos antes de importar
- [ ] Los eventos se importan correctamente como eventos del calendario
- [ ] Se mantiene compatibilidad con eventos manuales existentes
- [ ] Se puede elegir entre sobrescribir o agregar a eventos existentes

## 📝 Notas Técnicas

### Consideraciones de Base de Datos
- Usar relaciones apropiadas entre tablas
- Implementar cascada delete donde sea necesario
- Considerar índices para consultas frecuentes
- Validar integridad referencial
- **Configuración de horarios:**
  - Almacenar días como strings: 'Lunes', 'Martes', etc.
  - Almacenar hora de comienzo en formato 24h: '08:00', '09:00', etc.
  - Almacenar duración en minutos: 30, 45, 60, 90, 120
  - Calcular hora de fin automáticamente: horaFin = horaInicio + duración
  - **Configuración de profesores:**
    - Almacenar RUT único para cada profesor
    - Relaciones many-to-many con asignaturas y niveles
    - Roles específicos: 'titular' y 'ayudante' por módulo
    - Validar que profesores impartan la asignatura/nivel asignados
  - Validar rangos en la base de datos (CHECK constraints)
  - Considerar timezone del usuario para conversiones

### Consideraciones de UI/UX
- Mantener consistencia con el diseño actual
- Usar componentes existentes cuando sea posible
- Implementar feedback visual para todas las acciones
- Asegurar responsividad en móviles
- **Opciones de UI para configuración de horarios:**
  - **Vista de calendario semanal:** Grid con días en columnas y horas en filas
  - **Slots clickeables:** Hacer clic en un slot para crear bloque
  - **Drag & drop:** Arrastrar para crear bloques de tiempo
  - **Listas desplegables:** 
    - Selector de día: Lunes, Martes, Miércoles, Jueves, Viernes
    - Selector de hora de comienzo: 8:00, 8:30, 9:00... hasta 18:00
    - Selector de duración: 30min, 45min, 1h, 1.5h, 2h
  - **Botones de acción rápida:** "Agregar 1h", "Agregar 2h", "Limpiar día"
  - **Vista previa en tiempo real:** Mostrar cómo se ve el horario
  - **Colores diferenciados:** Diferentes colores para bloques activos/inactivos
  - **Información de bloque:** Mostrar hora inicio + duración en cada bloque

### Consideraciones de Performance
- Implementar paginación para listas grandes
- Usar lazy loading para componentes pesados
- Optimizar consultas de base de datos
- Implementar cache donde sea apropiado

---

**Estado:** 📋 Planificado  
**Última actualización:** Julio 2025  
**Responsable:** Equipo de Desarrollo 