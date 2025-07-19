# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.4] - 2025-07-18

### 🎨 Refactorización de Componentes
- **Sistema de Componentes Reutilizables:**
  - `ResultadosHeader` - Header consistente para páginas de resultados
  - `LoadingState` - Estado de carga uniforme en toda la aplicación
  - `ErrorState` - Estado de error consistente
  - `SuccessState` - Estado de éxito uniforme
  - `ModalHeader` - Header para modales reutilizable
- **Utilidades Centralizadas:**
  - `resultados-utils.ts` - Funciones para cálculos y exportación
  - Cálculo de notas según nivel de exigencia
  - Generación de estadísticas y rangos de porcentaje
  - Exportación CSV optimizada

### 🔧 Optimización de Código
- **Eliminación de Duplicación:**
  - ~100 líneas de código duplicado eliminadas
  - Funciones centralizadas en utilidades
  - Componentes reutilizables en lugar de código repetido
- **Refactorización de Páginas:**
  - Página de gráficos completamente refactorizada
  - Página principal de resultados optimizada
  - Modal de carga de resultados mejorado

### 🎯 Mejoras de UX/UI
- **Consistencia Visual:**
  - Headers uniformes en todas las páginas de resultados
  - Estados de loading, error y éxito consistentes
  - Gradientes coherentes por funcionalidad
- **Optimizaciones de Layout:**
  - Alineación horizontal de metadatos en gráficos
  - Espaciado consistente entre elementos
  - Promedio de notas mostrado junto al total de estudiantes

### 📚 Documentación
- **Documentación de Cambios:** `docs/CAMBIOS_20250718.md`
- **Actualización de Arquitectura:** Nuevos patrones de componentes
- **Tareas Pendientes:** Homologación de headers en toda la plataforma
- **Backup de Base de Datos:** Múltiples puntos de restauración

### 🏗️ Arquitectura
- **Patrón de Componentes Reutilizables:**
  - Exportaciones centralizadas en `src/components/resultados/index.ts`
  - Interfaces TypeScript bien definidas
  - Props configurables para máxima flexibilidad
- **Estructura de Utilidades:**
  - Funciones puras para cálculos
  - Separación clara de responsabilidades
  - Testing-friendly architecture

## [1.1.3] - 2025-07-10

### 💰 Análisis Financiero
- **Análisis de Costos Detallado:**
  - Documentación completa en `docs/ANALISIS_COSTOS.md`
  - Análisis de ROI por escenarios (100, 500, 2,000 docentes)
  - Modelo de precios freemium/premium definido
  - Break-even: 15-17 docentes
  - Proyección de ingresos: $7,000/mes en 12 meses

### 📊 Métricas Financieras
- **Costos de Infraestructura:** $81/mes (básico) a $619/mes (enterprise)
- **ROI Esperado:** 764% desde el primer mes
- **Inversión Inicial:** $2,081 (desarrollo + infraestructura + marketing)
- **Cronograma de Inversión:** 12 meses con proyecciones detalladas

### 🎯 Estrategia de Monetización
- **Planes de Precios:**
  - Freemium: 1 docente, 5 planificaciones
  - Básico: $5/mes por docente
  - Institucional: $7/mes por docente
  - Enterprise: $10/mes por docente

## [1.1.2] - 2025-07-10

### 📋 Planificación
- **Plan de Escalabilidad Documentado:**
  - Documentación completa en `docs/PLAN_ESCALABILIDAD.md`
  - Cronograma de 3 días para implementar escalabilidad
  - Stack tecnológico enterprise-grade definido
  - Análisis de costos y ROI detallado

### 🔄 Priorización
- **Testing Aplazado por Escalabilidad:**
  - Priorizada la escalabilidad sobre testing completo
  - Plan de testing movido a post-escalabilidad
  - Justificación: base sólida antes de testing exhaustivo
  - Cronograma actualizado en `docs/TAREAS_PENDIENTES.md`

### 🎯 Objetivos
- **Metas de Escalabilidad Definidas:**
  - 2,000+ usuarios simultáneos
  - Tiempo de respuesta < 1.5 segundos
  - Uptime 99.9%
  - Capacidad para generar ingresos

## [1.1.1] - 2025-07-10

### ✨ Agregado
- **Página de Listado de Planificaciones** (`/planificacion-anual/listado`)
  - Lista todas las planificaciones guardadas
  - Acciones para editar/eliminar cada planificación
  - Paginación para manejar múltiples planificaciones
  - Botón para crear nueva planificación
  - Diseño consistente con el listado de horarios

### 🔧 Mejorado
- **Navegación del Sidebar:**
  - Agregado submenu "Planificaciones" en la sección "Planificación"
  - Enlace directo al listado de planificaciones
  - Estructura de navegación más organizada

### 🐛 Corregido
- **Carga de Planificaciones Existentes:**
  - Al editar una planificación existente, el horario se preselecciona automáticamente
  - El dropdown de horario aparece bloqueado cuando se edita una planificación
  - No se pide seleccionar un horario nuevo al editar
  - Los datos de la planificación se cargan correctamente

### 🏗️ Arquitectura
- **Estructura de archivos corregida:**
  - Movido `listado.tsx` a `listado/page.tsx` para cumplir con Next.js App Router
  - Eliminado archivo incorrecto que causaba error 404

## [1.1.0] - 2025-07-04

### ✨ Agregado
- **Módulo de Planificación Anual** completamente funcional
  - Calendario interactivo con eventos por eje
  - Sistema de asignación de OAs con validaciones
  - Colores diferenciados por eje temático
  - Filtros avanzados por eje y OAs asignables
  - Drawer lateral para gestión de OAs
  - Componentes modulares y reutilizables

### 🏗️ Arquitectura
- **Refactorización completa** de la página de planificación anual
- **Componentes modulares:**
  - `FiltrosDrawer.tsx` - Filtros del drawer
  - `OACard.tsx` - Tarjeta individual de OA
  - `EjeSection.tsx` - Sección completa de eje
  - `OADrawerContent.tsx` - Contenido del drawer
  - `types.ts` - Tipos compartidos
- **Hook personalizado:** `use-planificacion-anual.ts`
- **Tipado fuerte** con TypeScript en todos los componentes

### 🎨 Interfaz de Usuario
- **Navegación mejorada:**
  - Ítem "Planificación Anual" en el sidebar principal
  - Tarjeta destacada en la página de inicio
  - Ícono Calendar para identificación visual
- **Sistema de colores por eje:**
  - Sky, Amber, Violet, Rose, Emerald, Orange
  - Rotación cíclica para ejes adicionales
- **Validaciones visuales:**
  - Botones habilitados/deshabilitados según secuencia
  - Contadores de clases asignadas
  - Indicadores de OA basal

### 🔧 Funcionalidades
- **Cálculo automático de fechas:**
  - Horarios fijos (Martes y Jueves, 9-10 y 12-13)
  - Distribución desde julio 2025
  - Módulos de 1 hora cada uno
- **Validaciones de secuencia:**
  - Respeto del mínimo de clases por OA
  - Secuencia obligatoria dentro de cada eje
  - Prevención de asignaciones inválidas
- **Filtros avanzados:**
  - Dropdown para filtrar por eje
  - Switch para mostrar solo OAs asignables
  - Filtrado combinado en tiempo real

### 📚 Documentación
- **Documentación completa** del módulo en `docs/PLANIFICACION_ANUAL.md`
- **Actualización del README** principal
- **Estructura del proyecto** actualizada
- **Casos de uso** y troubleshooting documentados

### 🔗 Integración
- **API `/api/ejes`** para obtener OAs agrupados por eje
- **Compatibilidad** con el sistema de navegación existente
- **Relación** con otros módulos (Editor, Evaluaciones, Matrices)

## [1.0.0] - 2025-07-01

### ✨ Agregado
- **Editor de Contenido** con TipTap
- **Sistema de Evaluaciones** con matrices de especificación
- **Entrevista Pedagógica** interactiva con TTS
- **Gestión de Matrices** de especificación
- **APIs REST** para todos los módulos
- **Base de datos** con Prisma y SQLite
- **Sistema de navegación** con sidebar
- **Documentación completa** del proyecto

### 🏗️ Arquitectura
- **Next.js 14** con App Router
- **TypeScript** para tipado fuerte
- **Tailwind CSS** para estilos
- **Prisma** como ORM
- **Componentes modulares** y reutilizables

### 🎨 Interfaz de Usuario
- **Diseño moderno** y responsivo
- **Tema consistente** en toda la aplicación
- **Componentes UI** personalizados
- **Animaciones** y transiciones suaves

---

## Tipos de Cambios

- **✨ Agregado** para nuevas funcionalidades
- **🐛 Corregido** para correcciones de bugs
- **💥 Cambiado** para cambios que rompen la compatibilidad
- **🗑️ Eliminado** para funcionalidades eliminadas
- **🔧 Mejorado** para mejoras en funcionalidades existentes
- **📚 Documentación** para cambios en documentación
- **🏗️ Arquitectura** para cambios en la estructura del proyecto
- **🎨 Interfaz de Usuario** para cambios en la UI/UX
- **🔗 Integración** para cambios en integraciones externas 