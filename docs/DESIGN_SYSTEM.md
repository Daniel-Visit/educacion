# Design System - Educacion App

Sistema de diseno visual documentado para reutilizar en otras aplicaciones.

---

## 1. Fundamentos

### 1.1 Filosofia de Diseno

- **Glassmorphism**: Fondos semi-transparentes con backdrop-blur
- **Gradientes**: Uso extensivo para jerarquia visual y branding
- **Bordes suaves**: Border-radius generosos para apariencia moderna
- **Sombras sutiles**: Profundidad sin sobrecargar visualmente

### 1.2 Principios

1. **Consistencia**: Mismos patrones en toda la aplicacion
2. **Claridad**: Informacion facilmente escaneable
3. **Eficiencia**: Minimizar clics para tareas comunes
4. **Accesibilidad**: Contraste adecuado y areas de click generosas

---

## 2. Colores

### 2.1 Paleta Principal

```css
/* Primarios - Indigo/Purple (Marca) */
--color-primary-50: #eef2ff; /* Fondos muy suaves */
--color-primary-100: #e0e7ff; /* Fondos suaves */
--color-primary-200: #c7d2fe; /* Bordes activos */
--color-primary-500: #6366f1; /* Iconos secundarios */
--color-primary-600: #4f46e5; /* Botones, enlaces */
--color-primary-700: #4338ca; /* Hover en botones */
--color-primary-900: #312e81; /* Texto destacado */

/* Acento - Purple */
--color-accent-500: #a855f7;
--color-accent-600: #9333ea;

/* Neutros */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

### 2.2 Colores Semanticos

```css
/* Exito - Emerald/Teal */
--color-success-light: from-emerald-50 to-teal-50;
--color-success-gradient: from-emerald-500 to-teal-600;
--color-success-text: #047857;

/* Error - Red/Pink */
--color-error-light: from-red-50 to-pink-50;
--color-error-gradient: from-red-600 to-pink-600;
--color-error-text: #dc2626;

/* Warning - Amber/Orange */
--color-warning-light: from-amber-50 to-orange-50;
--color-warning-gradient: from-amber-500 to-orange-600;
--color-warning-text: #d97706;

/* Info - Blue/Cyan */
--color-info-light: from-blue-50 to-cyan-50;
--color-info-gradient: from-blue-500 to-cyan-600;
--color-info-text: #2563eb;
```

### 2.3 Gradientes Principales

```css
/* Gradiente de marca (default) */
.gradient-brand {
  @apply bg-gradient-to-r from-indigo-600 to-purple-600;
}

/* Gradiente de marca sutil */
.gradient-brand-light {
  @apply bg-gradient-to-r from-indigo-50 to-purple-50;
}

/* Gradiente para iconos/logos */
.gradient-icon {
  @apply bg-gradient-to-br from-indigo-600 to-purple-500;
}

/* Gradiente hover suave */
.gradient-hover {
  @apply hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50;
}
```

### 2.4 Fondos de Aplicacion

```css
/* Fondo principal de la app */
--app-background: #f7f8fd;

/* Contenedor principal (glassmorphism) */
--container-background: rgba(255, 255, 255, 0.8);
--container-shadow: 0 8px 32px 0 rgba(99, 102, 241, 0.1);

/* Sidebar */
--sidebar-background: rgba(255, 255, 255, 0.7);
--sidebar-border: #f0f0fa;
```

---

## 3. Tipografia

### 3.1 Escala de Tamanos

```css
/* Headings */
--text-4xl: 2.25rem; /* 36px - Hero titles */
--text-3xl: 1.875rem; /* 30px - Page titles */
--text-2xl: 1.5rem; /* 24px - Section titles */
--text-xl: 1.25rem; /* 20px - Card titles */
--text-lg: 1.125rem; /* 18px - Subtitles */

/* Body */
--text-base: 1rem; /* 16px - Body text */
--text-sm: 0.875rem; /* 14px - Secondary text */
--text-xs: 0.75rem; /* 12px - Captions, labels */
```

### 3.2 Font Weights

```css
--font-normal: 400; /* Texto regular */
--font-medium: 500; /* Labels, navegacion */
--font-semibold: 600; /* Subtitulos, enfasis */
--font-bold: 700; /* Titulos */
--font-extrabold: 800; /* Logo, branding */
```

### 3.3 Uso por Contexto

| Contexto       | Tamano       | Weight    | Color            |
| -------------- | ------------ | --------- | ---------------- |
| Logo principal | text-2xl     | extrabold | indigo-900       |
| Tagline        | text-sm      | medium    | purple-500       |
| Page title     | text-xl/2xl  | bold      | gray-900 o white |
| Section title  | text-lg      | semibold  | gray-800         |
| Card title     | text-base    | semibold  | gray-900         |
| Body text      | text-sm/base | normal    | gray-600         |
| Nav items      | text-base    | semibold  | indigo-900       |
| Labels         | text-sm      | medium    | gray-700         |
| Captions       | text-xs      | medium    | gray-500         |

---

## 4. Espaciado

### 4.1 Escala Base (4px)

```css
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
```

### 4.2 Uso Recomendado

| Contexto        | Padding    | Gap/Margin                  |
| --------------- | ---------- | --------------------------- |
| Contenedor app  | p-6        | mt-6 mb-6                   |
| Main content    | p-6 lg:p-8 | -                           |
| Cards           | p-4 lg:p-6 | mb-4                        |
| Page headers    | p-4        | mb-4                        |
| Buttons         | px-4 py-2  | gap-2                       |
| Form fields     | px-3 py-2  | gap-4 (form), mb-4 (fields) |
| Nav items       | px-4 py-3  | space-y-2                   |
| Iconos en texto | -          | gap-2                       |
| Stats/badges    | px-3 py-1  | gap-4                       |

---

## 5. Border Radius

### 5.1 Escala

```css
--radius-sm: 0.375rem; /* 6px  - Badges, inputs */
--radius-md: 0.5rem; /* 8px  - Buttons */
--radius-lg: 0.625rem; /* 10px - Cards pequenas */
--radius-xl: 0.75rem; /* 12px - Cards */
--radius-2xl: 1rem; /* 16px - Modals, nav items */
--radius-3xl: 1.5rem; /* 24px - Contenedores principales */
--radius-full: 9999px; /* Pills, avatares */
```

### 5.2 Uso por Componente

| Componente           | Radius                    |
| -------------------- | ------------------------- |
| Contenedor principal | rounded-3xl               |
| Cards                | rounded-xl                |
| Modals/Dialogs       | rounded-2xl               |
| Nav items            | rounded-2xl               |
| Buttons              | rounded-lg                |
| Inputs               | rounded-lg                |
| Badges               | rounded-full o rounded-md |
| Avatars              | rounded-full              |
| Icon containers      | rounded-lg o rounded-2xl  |

---

## 6. Sombras

### 6.1 Definiciones

```css
/* Sombra sutil (inputs, cards en reposo) */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Sombra default (cards) */
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Sombra media (dropdowns, popovers) */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Sombra grande (modals, headers destacados) */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Sombra extra grande (elementos elevados) */
--shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Sombra de marca (contenedor principal) */
--shadow-brand: 0 8px 32px 0 rgba(99, 102, 241, 0.1);
```

### 6.2 Uso por Contexto

| Contexto              | Sombra                     |
| --------------------- | -------------------------- |
| Contenedor principal  | shadow-brand (custom)      |
| Cards                 | shadow-sm, hover:shadow-md |
| Modals                | shadow-xl                  |
| Headers con gradiente | shadow-lg                  |
| Buttons activos       | shadow-md                  |
| FAB                   | shadow-lg, hover:shadow-xl |
| Dropdowns             | shadow-md                  |

---

## 7. Componentes

### 7.1 Botones

```tsx
// Variantes de boton
const buttonVariants = {
  // Principal - Gradiente de marca
  gradient: `
    bg-gradient-to-r from-indigo-600 to-purple-500
    text-white font-semibold
    hover:from-indigo-700 hover:to-purple-600
    active:scale-95
    shadow-md hover:shadow-lg
    transition-all duration-200
  `,

  // Secundario - Outline
  outline: `
    border border-gray-300
    text-gray-700 font-medium
    hover:bg-gray-50
    transition-colors
  `,

  // Ghost - Solo hover
  ghost: `
    text-gray-600 font-medium
    hover:bg-gray-100
    transition-colors
  `,

  // Destructivo
  destructive: `
    bg-red-600 text-white font-semibold
    hover:bg-red-700
    transition-colors
  `,
};

// Tamanos
const buttonSizes = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-6 text-base rounded-lg',
};
```

### 7.2 Cards

```tsx
// Card basica
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-6">
  {children}
</div>

// Card interactiva
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-6
     hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
  {children}
</div>

// Card con gradiente de fondo
<div className="bg-gradient-to-r from-indigo-50 to-purple-50
     rounded-xl border border-indigo-100 p-4 lg:p-6">
  {children}
</div>
```

### 7.3 Inputs

```tsx
// Input basico
<input className="
  w-full h-10 px-3
  border border-gray-300 rounded-lg
  text-sm text-gray-900 placeholder:text-gray-400
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
  disabled:bg-gray-100 disabled:cursor-not-allowed
  transition-colors
" />

// Select
<select className="
  w-full h-10 px-3
  border border-gray-300 rounded-lg
  text-sm text-gray-900
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
  bg-white
  cursor-pointer
" />
```

### 7.4 Badges

```tsx
// Badge default
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
  Label
</span>

// Badge success
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
  Completado
</span>

// Badge warning
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
  Pendiente
</span>

// Badge error
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
  Error
</span>

// Badge info (con gradiente)
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800">
  IA
</span>
```

### 7.5 Modals/Dialogs

```tsx
// Overlay
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

// Modal container
<div className="fixed inset-0 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
    {/* Header con gradiente */}
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon className="text-white" size={20} />
        </div>
        <h2 className="text-lg font-bold text-white">Titulo</h2>
      </div>
    </div>

    {/* Content */}
    <div className="p-6">
      {children}
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-3 px-6 pb-6">
      <button className="btn-outline">Cancelar</button>
      <button className="btn-gradient">Confirmar</button>
    </div>
  </div>
</div>
```

### 7.6 Navigation Items

```tsx
// Item normal
<a className="
  flex items-center gap-3 px-4 py-3 rounded-2xl
  font-semibold text-base text-indigo-900
  hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
  transition-all
">
  <Icon className="text-indigo-500" size={22} />
  <span>Label</span>
</a>

// Item activo
<a className="
  flex items-center gap-3 px-4 py-3 rounded-2xl
  font-semibold text-base text-white
  bg-gradient-to-r from-indigo-600 to-purple-600
  shadow-lg
">
  <Icon className="text-white" size={22} />
  <span>Label</span>
</a>
```

---

## 8. Iconografia

### 8.1 Libreria

**Lucide React** - Iconos consistentes y ligeros

```bash
npm install lucide-react
```

### 8.2 Tamanos Estandar

| Contexto         | Tamano  | Clase                 |
| ---------------- | ------- | --------------------- |
| Inline con texto | 16px    | size={16}             |
| Navigation       | 22px    | size={22}             |
| Cards/Headers    | 20-24px | size={20} o size={24} |
| Hero/Logo        | 32px    | size={32}             |
| FAB              | 32-36px | size={32}             |

### 8.3 Contenedores de Iconos

```tsx
// Contenedor pequeno (badges, inline)
<div className="p-1.5 rounded-md bg-indigo-100">
  <Icon className="text-indigo-600" size={16} />
</div>

// Contenedor medio (cards, nav)
<div className="p-2 rounded-lg bg-indigo-100">
  <Icon className="text-indigo-600" size={20} />
</div>

// Contenedor grande (hero, features)
<div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500">
  <Icon className="text-white" size={24} />
</div>

// Contenedor logo
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center">
  <Icon className="text-white" size={32} />
</div>
```

---

## 9. Animaciones y Transiciones

### 9.1 Duraciones

```css
--duration-fast: 150ms; /* Hover states */
--duration-normal: 200ms; /* Transiciones UI */
--duration-slow: 300ms; /* Animaciones complejas */
--duration-slower: 500ms; /* Entradas/salidas */
```

### 9.2 Easings

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1); /* ease-out */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 9.3 Patrones Comunes

```tsx
// Hover con escala (botones, FAB)
className = 'transition-transform duration-200 hover:scale-105 active:scale-95';

// Hover con sombra (cards)
className = 'transition-all duration-200 hover:shadow-md';

// Cambio de color suave
className = 'transition-colors duration-150';

// Sidebar collapse
className = 'transition-all duration-300';

// Entrada de modal
className = 'animate-in fade-in-0 zoom-in-95 duration-200';

// Pulse (indicadores activos)
className = 'animate-pulse';
```

---

## 10. Z-Index Scale

```css
--z-base: 0; /* Elementos normales */
--z-dropdown: 10; /* Dropdowns, selects */
--z-sticky: 20; /* Headers sticky */
--z-fixed: 30; /* Elementos fixed */
--z-modal-bg: 40; /* Backdrop de modals */
--z-modal: 50; /* Modals, dialogs, FAB */
--z-popover: 60; /* Popovers, tooltips */
--z-toast: 70; /* Notificaciones toast */
--z-drawer: 100; /* Drawer (mobile nav) */
```

---

## 11. Responsive Breakpoints

```css
/* Mobile first approach */
--screen-sm: 640px; /* @media (min-width: 640px) */
--screen-md: 768px; /* @media (min-width: 768px) */
--screen-lg: 1024px; /* @media (min-width: 1024px) */
--screen-xl: 1280px; /* @media (min-width: 1280px) */
--screen-2xl: 1536px; /* @media (min-width: 1536px) */
```

---

## 12. Tokens CSS (Variables)

Archivo recomendado: `globals.css`

```css
@layer base {
  :root {
    /* Colors */
    --background: 247 248 253; /* #f7f8fd */
    --foreground: 17 24 39; /* gray-900 */

    --primary: 79 70 229; /* indigo-600 */
    --primary-foreground: 255 255 255;

    --secondary: 243 244 246; /* gray-100 */
    --secondary-foreground: 55 65 81; /* gray-700 */

    --muted: 243 244 246;
    --muted-foreground: 107 114 128;

    --accent: 147 51 234; /* purple-600 */
    --accent-foreground: 255 255 255;

    --destructive: 220 38 38; /* red-600 */
    --destructive-foreground: 255 255 255;

    --border: 229 231 235; /* gray-200 */
    --input: 209 213 219; /* gray-300 */
    --ring: 99 102 241; /* indigo-500 */

    /* Radius */
    --radius: 0.625rem; /* 10px base */

    /* Sidebar */
    --sidebar-width: 320px;
    --sidebar-width-collapsed: 64px;
  }
}
```

---

## 13. Checklist de Implementacion

### Para nuevas aplicaciones:

- [ ] Instalar Tailwind CSS 4
- [ ] Configurar variables CSS en globals.css
- [ ] Instalar lucide-react para iconos
- [ ] Crear componentes base (Button, Card, Input, Badge)
- [ ] Implementar layout con AppShell
- [ ] Configurar fuente (Inter recomendada)

### Componentes minimos:

1. [ ] Button (gradient, outline, ghost, destructive)
2. [ ] Card (basica, interactiva, con gradiente)
3. [ ] Input / Select / Textarea
4. [ ] Badge (default, success, warning, error, info)
5. [ ] Modal/Dialog
6. [ ] PageHeader
7. [ ] Sidebar (con collapse)
8. [ ] FAB
9. [ ] Toast/Notification
10. [ ] LoadingState

---

## 14. Recursos

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons
- **Radix UI**: https://www.radix-ui.com (primitivos accesibles)
- **shadcn/ui**: https://ui.shadcn.com (componentes pre-hechos)

---

_Documento generado para Educacion App - v1.0_
