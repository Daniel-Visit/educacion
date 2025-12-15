# Propuesta de Refactoring UI - Educacion App

## Resumen Ejecutivo

Este documento contiene el análisis del estado actual del frontend, propuestas de mejora para optimizar el espacio y responsividad, y un sistema de diseño visual documentado para reutilizar en otras aplicaciones.

---

## 1. Analisis del Estado Actual

### 1.1 Layout Principal (AppShell)

**Archivo:** `src/components/ui/AppShell.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│                    bg-[#f7f8fd] (24px padding)              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  max-w-7xl (1280px) | rounded-3xl | bg-white/80       │  │
│  │  ┌──────────┬────────────────────────────────────┐    │  │
│  │  │ Sidebar  │         Main Content               │    │  │
│  │  │  320px   │      flex-1 | p-10 (40px)          │    │  │
│  │  │  fixed   │         overflow-auto              │    │  │
│  │  │          │                                    │    │  │
│  │  └──────────┴────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Problemas identificados:**

- Sidebar de 320px fijo, sin opcion de colapsar
- Padding de contenido muy grande (40px en todas las direcciones)
- Max-width de 1280px limita uso en pantallas grandes
- Solo funciona en pantallas >= 1024px (bloquea mobile/tablet)

### 1.2 Sidebar

**Archivo:** `src/components/ui/Sidebar.tsx`

| Aspecto            | Valor Actual     | Problema                                |
| ------------------ | ---------------- | --------------------------------------- |
| Ancho              | 320px fijo       | No colapsable, ocupa mucho espacio      |
| Padding            | py-10 px-6       | Excesivo verticalmente                  |
| Logo               | 56px (w-14 h-14) | Proporcionado pero grande               |
| Avatar card        | py-3 px-4        | Ocupa espacio vertical                  |
| Nav items          | py-3 px-4        | Altura adecuada                         |
| Entrevista submenu | Muy elaborado    | Ocupa ~40% del sidebar cuando expandido |

### 1.3 Headers de Paginas

**Patron 1: Header con gradiente (Evaluaciones, Matrices)**

```tsx
<div
  className="bg-gradient-to-r from-indigo-600 to-purple-600
     rounded-xl p-6 text-white shadow-lg mb-6 mt-4"
>
  // Icono + Titulo + Stats + Boton
</div>
```

- Altura aproximada: 120-180px
- Padding: 24px
- Margen inferior: 24px
- **Total espacio vertical: ~200px**

**Patron 2: Header simple (Dashboard)**

```tsx
<div className="flex items-center justify-between pb-6">
  <h1 className="text-3xl font-bold">Dashboard</h1>
</div>
```

- Mas compacto pero inconsistente con otras paginas

### 1.4 FAB (Floating Action Button)

**Archivo:** `src/components/ui/Fab.tsx`

```tsx
className = 'fixed bottom-8 right-22 w-16 h-16 rounded-full...';
```

**Problemas:**

- `right-22` (88px) es un valor no estandar de Tailwind
- Posicion no considera el layout con sidebar
- En pantallas grandes, queda muy separado del contenido
- No tiene variantes de tamano

### 1.5 Metricas de Espacio Perdido

En una pantalla de 1440px de ancho:

```
Total viewport:                1440px
- Padding exterior (2x24px):    -48px
- Max-width cap:               1280px (se limita aqui)
- Sidebar:                      -320px
- Padding contenido (2x40px):   -80px
────────────────────────────────────
Espacio util para contenido:    880px
```

**Porcentaje de espacio util: 61%** (se pierde 39% del viewport)

---

## 2. Propuestas de Mejora

### 2.1 Sidebar Colapsable

**Objetivo:** Permitir ocultar el sidebar para maximizar area de trabajo

**Implementacion propuesta:**

```
Estado expandido (320px):        Estado colapsado (64px):
┌──────────────────┐             ┌────┐
│ [Logo] EdK       │             │[L] │
│ Soluciones IA... │             │    │
│──────────────────│             │────│
│ [Avatar card]    │             │[Av]│
│──────────────────│             │────│
│ > Planificacion  │             │[ic]│
│ > Clases IA      │             │[ic]│
│ > Evaluacion     │             │[ic]│
│ > Resultados     │             │[ic]│
│ > Entrevista     │             │[ic]│
│──────────────────│             │────│
│ [Cerrar sesion]  │             │[x] │
└──────────────────┘             └────┘
```

**Cambios requeridos:**

1. **Nuevo estado global** para sidebar (Context o Zustand)
2. **Boton toggle** en sidebar header
3. **Clases condicionales** para ancho
4. **Tooltips** en estado colapsado
5. **Persistencia** en localStorage

**CSS propuesto:**

```tsx
// Sidebar.tsx
<aside className={cn(
  "h-full min-h-0 flex flex-col bg-white/70 backdrop-blur-md",
  "border-r border-[#f0f0fa] overflow-hidden transition-all duration-300",
  isCollapsed ? "w-16 px-2 py-6" : "w-72 px-6 py-8"  // 256px vs 64px
)}>
```

### 2.2 Headers Compactos

**Objetivo:** Reducir altura de headers manteniendo funcionalidad

**Antes (Header con gradiente):**

```
┌─────────────────────────────────────────────────────┐
│  mt-4                                               │
│  ┌───────────────────────────────────────────────┐  │
│  │  p-6                                          │  │
│  │  [Icon]                                       │  │
│  │  Titulo Grande (text-2xl)                     │  │
│  │  Descripcion                                  │  │
│  │                              [Stats] [Boton]  │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│  mb-6                                               │
└─────────────────────────────────────────────────────┘
Altura total: ~200px
```

**Despues (Header compacto):**

```
┌─────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────┐  │
│  │ p-4 | [Icon] Titulo (text-xl) | [Stats] [Btn] │  │
│  └───────────────────────────────────────────────┘  │
│  mb-4                                               │
└─────────────────────────────────────────────────────┘
Altura total: ~80px
```

**Ahorro: 120px por pagina (60% reduccion)**

**Componente propuesto:**

```tsx
// components/ui/PageHeader.tsx
interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  stats?: Array<{ label: string; value: string | number }>;
  variant?: 'gradient' | 'simple' | 'minimal';
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  stats,
  variant = 'gradient',
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'rounded-xl mb-4',
        variant === 'gradient' &&
          'bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4',
        variant === 'simple' && 'bg-white border border-gray-200 p-4',
        variant === 'minimal' && 'pb-4 border-b border-gray-100'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              variant === 'gradient' ? 'bg-white/20' : 'bg-indigo-100'
            )}
          >
            <Icon
              className={
                variant === 'gradient' ? 'text-white' : 'text-indigo-600'
              }
              size={20}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {stats && (
            <div className="hidden md:flex items-center gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs opacity-70">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
```

### 2.3 Reduccion de Padding en Main Content

**Antes:**

```tsx
<main className="flex-1 min-h-0 flex flex-col relative p-10 overflow-auto">
```

**Despues:**

```tsx
<main className="flex-1 min-h-0 flex flex-col relative p-6 lg:p-8 overflow-auto">
```

**Ahorro:** 16-24px en cada direccion

### 2.4 FAB Reposicionado

**Problema actual:** `right-22` (88px) es arbitrario y no se ajusta al layout

**Solucion:**

```tsx
// Posicion relativa al contenedor, no al viewport
<div className="absolute bottom-6 right-6 z-50">
  <Fab ... />
</div>
```

O si debe ser fixed:

```tsx
// Considerar sidebar en el calculo
className={cn(
  "fixed bottom-6 z-50 transition-all duration-300",
  isSidebarCollapsed ? "right-6" : "right-6 lg:right-[calc(50%-640px+24px)]"
)}
```

**Variantes de tamano propuestas:**

```tsx
size: {
  sm: "w-12 h-12",  // 48px - para acciones secundarias
  md: "w-14 h-14",  // 56px - default
  lg: "w-16 h-16",  // 64px - para acciones principales
}
```

### 2.5 Responsive Design (Opcional - Fase 2)

**Breakpoints propuestos:**

```
sm:  640px  - Mobile landscape
md:  768px  - Tablet portrait
lg:  1024px - Tablet landscape / Small desktop
xl:  1280px - Desktop
2xl: 1536px - Large desktop
```

**Comportamiento por breakpoint:**

| Breakpoint | Sidebar                     | Header   | Main Padding |
| ---------- | --------------------------- | -------- | ------------ |
| < 768px    | Drawer (oculto por defecto) | Minimal  | p-4          |
| 768-1023px | Colapsado (64px)            | Compacto | p-4          |
| 1024px+    | Expandido (256px)           | Compacto | p-6          |
| 1280px+    | Expandido (256px)           | Normal   | p-8          |

---

## 3. Comparativa de Espacio

### Antes del Refactoring (1440px viewport)

```
Sidebar:           320px (22%)
Main padding:       80px (6%)
Margenes externos:  48px (3%)
────────────────────────────
Contenido util:    880px (61%)
Header height:     ~200px
```

### Despues del Refactoring (1440px viewport)

```
Sidebar expandido: 256px (18%)
Sidebar colapsado:  64px (4%)
Main padding:       48px (3%)
Margenes externos:  48px (3%)
────────────────────────────
Contenido util (expandido):  1040px (72%)
Contenido util (colapsado): 1232px (86%)
Header height:      ~80px
```

**Mejora total: +11% a +25% mas espacio util**

---

## 4. Plan de Implementacion

### Fase 1: Quick Wins (Bajo riesgo)

1. [ ] Reducir padding de main content (p-10 -> p-6)
2. [ ] Crear componente PageHeader compacto
3. [ ] Migrar headers de paginas existentes
4. [ ] Corregir posicion del FAB

### Fase 2: Sidebar Colapsable

1. [ ] Crear SidebarContext para estado global
2. [ ] Modificar Sidebar.tsx con estados
3. [ ] Agregar boton toggle
4. [ ] Implementar tooltips en estado colapsado
5. [ ] Persistir preferencia en localStorage

### Fase 3: Responsive (Opcional)

1. [ ] Remover bloqueo de dispositivos < 1024px
2. [ ] Implementar sidebar como drawer en mobile
3. [ ] Ajustar breakpoints de componentes
4. [ ] Testing en multiples dispositivos

---

## 5. Sistema de Diseno Visual

Ver documento complementario: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## 6. Archivos Afectados

```
src/components/ui/
├── AppShell.tsx          # Layout principal
├── Sidebar.tsx           # Sidebar con collapse
├── PageHeader.tsx        # NUEVO - Header unificado
├── Fab.tsx               # Correccion posicion
└── SidebarContext.tsx    # NUEVO - Estado global

src/app/(app)/
├── evaluaciones/page.tsx # Migrar a PageHeader
├── matrices/page.tsx     # Migrar a PageHeader
├── dashboard/page.tsx    # Migrar a PageHeader
├── horarios/page.tsx     # Migrar a PageHeader
└── ...otras paginas
```

---

## Siguiente Paso

Revisar [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) para el sistema de diseno completo que puede reutilizarse en otras aplicaciones.
