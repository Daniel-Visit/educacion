# Chore: UI Refactoring - Space Optimization & Collapsible Sidebar

## Chore Description

Refactoring completo del frontend para optimizar el uso del espacio y mejorar la responsividad de la aplicacion. Los objetivos principales son:

1. **Sidebar colapsable**: Permitir ocultar/mostrar el sidebar para maximizar el area de trabajo
2. **Headers compactos**: Reducir la altura de los headers de pagina de ~200px a ~80px
3. **Reduccion de padding**: Ajustar el padding del contenido principal de 40px a 24px
4. **FAB reposicionado**: Corregir la posicion del Floating Action Button
5. **Componente PageHeader unificado**: Crear un componente reutilizable para headers de pagina

El resultado esperado es aumentar el espacio util del viewport de 61% a 72-86%.

## Relevant Files

Use these files to resolve the chore:

### Core Layout Files (Modificar)

- `src/components/ui/AppShell.tsx` - Layout principal que contiene Sidebar y main content. Necesita:
  - Integrar SidebarContext
  - Ajustar padding del main content (p-10 -> p-6)
  - Manejar transiciones de ancho del sidebar

- `src/components/ui/Sidebar.tsx` - Sidebar actual de 320px fijo. Necesita:
  - Implementar estados expandido (256px) / colapsado (64px)
  - Agregar boton toggle
  - Mostrar tooltips en estado colapsado
  - Ocultar textos y mostrar solo iconos cuando colapsado

- `src/components/ui/Fab.tsx` - FAB con posicion `right-22` no estandar. Necesita:
  - Corregir posicionamiento a valores estandar de Tailwind
  - Agregar variantes de tamano

### Pages with Headers (Migrar a PageHeader)

- `src/app/(app)/evaluaciones/page.tsx` - Header con stats (4 stats cards)
- `src/app/(app)/matrices/page.tsx` - Header con titulo y boton crear
- `src/app/(app)/dashboard/page.tsx` - Header simple con titulo y fecha
- `src/app/(app)/horarios/page.tsx` - Usa HorariosList component
- `src/app/(app)/planificacion-anual/page.tsx` - Header con gradiente
- `src/app/(app)/planificacion-anual/listado/page.tsx` - Lista de planificaciones
- `src/app/(app)/resultados-evaluaciones/page.tsx` - Header de resultados
- `src/app/(app)/correccion-evaluaciones/page.tsx` - Header de correccion
- `src/app/(app)/editor/page.tsx` - Header del editor
- `src/app/(app)/matrices/[id]/page.tsx` - Detalle de matriz

### Components with Headers (Migrar a PageHeader)

- `src/components/admin/UsersManagement.tsx` - Header admin con search y acciones
- `src/components/horarios/HorariosList.tsx` - Header de horarios con modal
- `src/components/planificacion-anual/PlanificacionesList.tsx` - Header de planificaciones
- `src/components/matrices/MatrizHeader.tsx` - Header especifico de matriz
- `src/components/evaluacion/EvaluacionForm.tsx` - Header del formulario

### New Files

- `src/contexts/SidebarContext.tsx` - Context para estado global del sidebar (collapsed/expanded)
- `src/components/ui/PageHeader.tsx` - Componente unificado para headers de pagina
- `src/hooks/use-sidebar.ts` - Hook para acceder al estado del sidebar
- `playwright.config.ts` - Configuracion de Playwright para E2E tests
- `tests/e2e/sidebar.spec.ts` - Tests E2E para funcionalidad del sidebar
- `tests/e2e/page-header.spec.ts` - Tests E2E para componente PageHeader
- `tests/e2e/fab.spec.ts` - Tests E2E para FAB positioning
- `tests/e2e/visual.spec.ts` - Tests de regresion visual con screenshots

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create SidebarContext

Create the global state management for sidebar collapsed state.

- Create `src/contexts/SidebarContext.tsx` with:
  ```typescript
  interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    collapseSidebar: () => void;
    expandSidebar: () => void;
  }
  ```
- Initialize state from localStorage (`sidebar-collapsed` key)
- Persist state changes to localStorage
- Export `SidebarProvider` component and `useSidebar` hook

### Step 2: Create useSidebar Hook

Create a convenience hook for accessing sidebar state.

- Create `src/hooks/use-sidebar.ts`
- Re-export the context hook with proper error handling
- Add TypeScript types for better DX

### Step 3: Create PageHeader Component

Create the unified, compact page header component.

- Create `src/components/ui/PageHeader.tsx` with props:
  ```typescript
  interface PageHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    stats?: Array<{ label: string; value: string | number; icon?: LucideIcon }>;
    variant?: 'gradient' | 'simple' | 'minimal';
    className?: string;
  }
  ```
- Implement three variants:
  - `gradient`: Background indigo-purple gradient (default)
  - `simple`: White background with border
  - `minimal`: No background, just bottom border
- Use compact sizing: p-4 instead of p-6, text-xl instead of text-2xl
- Stats should be inline on desktop, hidden or collapsed on smaller screens
- Total height target: ~80px (vs current ~200px)

### Step 4: Update AppShell Layout

Integrate SidebarContext and reduce main content padding.

- Wrap children with `SidebarProvider` in app layout or AppShell
- Change main padding from `p-10` to `p-6`
- Add transition classes for smooth sidebar width changes:
  ```typescript
  className={cn(
    "flex-1 min-h-0 flex flex-col relative overflow-auto transition-all duration-300",
    isCollapsed ? "p-6" : "p-6"
  )}
  ```

### Step 5: Update Sidebar Component - Structure

Refactor Sidebar to support collapsed state.

- Import and use `useSidebar` hook
- Change width classes:
  - Expanded: `w-72` (288px, down from 320px)
  - Collapsed: `w-16` (64px)
- Reduce vertical padding: `py-10` -> `py-6`
- Add toggle button in header area:
  ```typescript
  <button
    onClick={toggleSidebar}
    className="p-2 rounded-lg hover:bg-indigo-50 transition-colors"
  >
    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
  </button>
  ```

### Step 6: Update Sidebar Component - Collapsed State

Implement the collapsed view of sidebar items.

- Logo section: Show only icon when collapsed, full branding when expanded
- Avatar section: Show only avatar (smaller) when collapsed, hide email
- Nav items: Show only icon when collapsed with Tooltip for label
- Add Tooltip component from Radix UI or create simple one:
  ```typescript
  {isCollapsed ? (
    <Tooltip content={item.name}>
      <button className="p-3 rounded-xl">
        <Icon size={22} />
      </button>
    </Tooltip>
  ) : (
    // Full nav item
  )}
  ```
- Submenu behavior when collapsed: Show as popover on hover/click
- Hide "Cerrar sesion" text when collapsed, show only icon

### Step 7: Update Sidebar Component - Interview Section

Handle the special interview progress section when collapsed.

- When collapsed: Hide the detailed step list
- Show only a compact progress indicator (circular or mini bar)
- On hover/click when collapsed: Show popover with full progress

### Step 8: Fix FAB Positioning

Correct the FAB position to use standard Tailwind values.

- Change `right-22` to `right-6` (24px from right edge)
- Position should be relative to the main content area, not viewport
- Consider sidebar state for positioning:
  ```typescript
  className={cn(
    "fixed bottom-6 z-50 transition-all duration-300",
    "right-6"  // Simple fixed position
  )}
  ```
- Add size variants:
  ```typescript
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };
  ```

### Step 9: Migrate Evaluaciones Page Header

Replace inline header with PageHeader component.

- Import PageHeader component
- Replace the existing header div (lines ~197-270) with:
  ```typescript
  <PageHeader
    icon={CheckCircle2}
    title="Evaluaciones"
    subtitle="Gestiona las evaluaciones creadas en la plataforma"
    stats={[
      { label: "Total", value: evaluaciones.length, icon: FileText },
      { label: "Preguntas", value: totalPreguntas, icon: Target },
      { label: "Matrices", value: matricesUnicas, icon: BarChart3 },
    ]}
    actions={
      <Button onClick={() => router.push('/evaluaciones/crear')}>
        <Plus className="w-4 h-4 mr-2" />
        Nueva Evaluacion
      </Button>
    }
  />
  ```
- Remove the inline stats grid (will be handled by PageHeader)
- Keep the delete modal and alert logic unchanged

### Step 10: Migrate Matrices Page Header

Replace inline header with PageHeader component.

- Import PageHeader component
- Replace the header div (lines ~141-159) with:
  ```typescript
  <PageHeader
    icon={BarChart3}
    title="Matrices de Especificacion"
    subtitle="Gestiona las matrices de especificacion para evaluaciones"
    actions={
      <Button onClick={handleCreateMatriz}>
        <Plus className="w-4 h-4 mr-2" />
        Nueva Matriz
      </Button>
    }
  />
  ```

### Step 11: Migrate Dashboard Page Header

Update dashboard to use consistent header style.

- The dashboard has a simpler header, use `variant="minimal"`:
  ```typescript
  <PageHeader
    icon={Home}
    title="Dashboard"
    subtitle={formatDateTime(currentDateTime)}
    variant="minimal"
  />
  ```
- Or keep the current simple style if preferred (it's already compact)

### Step 12: Migrate UsersManagement Header

Update admin users page header.

- Replace header div (lines ~241-320) with PageHeader
- The search input and action buttons go in `actions` prop:
  ```typescript
  <PageHeader
    icon={Settings}
    title="Administracion de Usuarios"
    subtitle="Gestiona usuarios, roles y permisos"
    actions={
      <div className="flex items-center gap-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} />
        <SelectionActions count={selectedUsers.size} onDelete={...} />
        <InviteButton onClick={() => setIsInviteModalOpen(true)} />
      </div>
    }
  />
  ```
- May need to extract search/actions into sub-components for cleanliness

### Step 13: Migrate HorariosList Header

Update horarios component header.

- Import PageHeader
- Add header to HorariosList (currently might not have one)
- If it exists in parent page, migrate there instead:
  ```typescript
  <PageHeader
    icon={Calendar}
    title="Configuracion de Horarios"
    subtitle="Gestiona los horarios de clases"
    actions={
      <Button onClick={() => setModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Horario
      </Button>
    }
  />
  ```

### Step 14: Migrate Remaining Page Headers

Update all remaining pages with headers.

- `src/app/(app)/planificacion-anual/page.tsx`
- `src/app/(app)/planificacion-anual/listado/page.tsx`
- `src/app/(app)/resultados-evaluaciones/page.tsx`
- `src/app/(app)/correccion-evaluaciones/page.tsx`
- `src/app/(app)/editor/page.tsx`
- `src/app/(app)/matrices/[id]/page.tsx`
- `src/components/planificacion-anual/PlanificacionesList.tsx`

For each:

1. Identify the current header structure
2. Map to PageHeader props
3. Replace with PageHeader component
4. Test that actions and navigation still work

### Step 15: Add Tooltip Component (if needed)

Create or import Tooltip for collapsed sidebar.

- If not using Radix UI Tooltip, create simple tooltip:
  ```typescript
  // src/components/ui/Tooltip.tsx
  interface TooltipProps {
    content: string;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
  }
  ```
- Use `position: absolute` with proper positioning
- Add entrance animation
- Style consistent with design system

### Step 16: Update App Layout Provider

Ensure SidebarProvider wraps the app correctly.

- Option A: Add to `src/app/(app)/layout.tsx`:

  ```typescript
  import { SidebarProvider } from '@/contexts/SidebarContext';

  export default function AppLayout({ children }) {
    return (
      <SidebarProvider>
        <AppShell>{children}</AppShell>
      </SidebarProvider>
    );
  }
  ```

- Option B: Add inside AppShell component itself
- Ensure provider is above both Sidebar and main content

### Step 17: Remove Debug Console Logs

Clean up development console.logs from modified files.

- Remove console.log statements from:
  - `src/components/ui/Sidebar.tsx` (lines 88-89, 371-372)
  - `src/components/ui/AppShell.tsx` (lines 15-18)
- These were for debugging user roles, no longer needed

### Step 18: Install and Configure Playwright

Set up Playwright for E2E testing.

- Install Playwright:
  ```bash
  npm install -D @playwright/test
  npx playwright install chromium
  ```
- Create `playwright.config.ts`:

  ```typescript
  import { defineConfig, devices } from '@playwright/test';

  export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  });
  ```

- Add test script to `package.json`:
  ```json
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
  ```

### Step 19: Create E2E Test for Sidebar Collapse

Create Playwright test for sidebar functionality.

- Create `tests/e2e/sidebar.spec.ts`:

  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('Sidebar', () => {
    test.beforeEach(async ({ page }) => {
      // Login or setup auth state
      await page.goto('/');
    });

    test('should toggle collapse state', async ({ page }) => {
      const sidebar = page.locator('[data-testid="sidebar"]');
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');

      // Initially expanded
      await expect(sidebar).toHaveClass(/w-72/);

      // Click toggle
      await toggleBtn.click();
      await expect(sidebar).toHaveClass(/w-16/);

      // Click again to expand
      await toggleBtn.click();
      await expect(sidebar).toHaveClass(/w-72/);
    });

    test('should persist collapse state after refresh', async ({ page }) => {
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');

      // Collapse sidebar
      await toggleBtn.click();

      // Refresh page
      await page.reload();

      // Should still be collapsed
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toHaveClass(/w-16/);
    });

    test('should show tooltips when collapsed', async ({ page }) => {
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');
      await toggleBtn.click();

      // Hover over nav item
      const navItem = page.locator('[data-testid="nav-evaluaciones"]');
      await navItem.hover();

      // Tooltip should appear
      const tooltip = page.locator('[role="tooltip"]');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText('Evaluacion');
    });

    test('should navigate correctly when collapsed', async ({ page }) => {
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');
      await toggleBtn.click();

      // Click nav item
      const navItem = page.locator('[data-testid="nav-dashboard"]');
      await navItem.click();

      // Should navigate
      await expect(page).toHaveURL('/');
    });
  });
  ```

- Add `data-testid` attributes to Sidebar component for testing

### Step 20: Create E2E Test for PageHeader

Create Playwright test for page headers.

- Create `tests/e2e/page-header.spec.ts`:

  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('PageHeader', () => {
    test('should render gradient header on evaluaciones page', async ({
      page,
    }) => {
      await page.goto('/evaluaciones');

      const header = page.locator('[data-testid="page-header"]');
      await expect(header).toBeVisible();
      await expect(header).toHaveClass(/from-indigo-600/);

      // Check title
      await expect(header.locator('h1')).toContainText('Evaluaciones');
    });

    test('should display stats correctly', async ({ page }) => {
      await page.goto('/evaluaciones');

      const stats = page.locator('[data-testid="header-stats"]');
      await expect(stats).toBeVisible();
    });

    test('should have working action buttons', async ({ page }) => {
      await page.goto('/evaluaciones');

      const createBtn = page.locator('[data-testid="header-action-create"]');
      await createBtn.click();

      await expect(page).toHaveURL('/evaluaciones/crear');
    });

    test('should render on all main pages', async ({ page }) => {
      const pages = [
        '/evaluaciones',
        '/matrices',
        '/horarios',
        '/planificacion-anual',
        '/resultados-evaluaciones',
      ];

      for (const url of pages) {
        await page.goto(url);
        const header = page.locator('[data-testid="page-header"]');
        await expect(header).toBeVisible();
      }
    });
  });
  ```

- Add `data-testid` attributes to PageHeader component

### Step 21: Create E2E Test for FAB

Create Playwright test for FAB positioning.

- Create `tests/e2e/fab.spec.ts`:

  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('FAB', () => {
    test('should be positioned correctly', async ({ page }) => {
      await page.goto('/editor');

      const fab = page.locator('[data-testid="fab"]');
      await expect(fab).toBeVisible();

      // Check position
      const box = await fab.boundingBox();
      const viewport = page.viewportSize();

      // Should be 24px from right edge
      expect(viewport!.width - box!.x - box!.width).toBeCloseTo(24, 5);

      // Should be 24px from bottom edge
      expect(viewport!.height - box!.y - box!.height).toBeCloseTo(24, 5);
    });

    test('should toggle open state', async ({ page }) => {
      await page.goto('/editor');

      const fab = page.locator('[data-testid="fab"]');
      await fab.click();

      // FAB panel should be visible
      const panel = page.locator('[data-fab-panel]');
      await expect(panel).toBeVisible();

      // Click again to close
      await fab.click();
      await expect(panel).not.toBeVisible();
    });
  });
  ```

### Step 22: Create Visual Regression Tests

Create Playwright visual comparison tests.

- Create `tests/e2e/visual.spec.ts`:

  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('Visual Regression', () => {
    test('sidebar expanded screenshot', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveScreenshot('sidebar-expanded.png', {
        fullPage: true,
      });
    });

    test('sidebar collapsed screenshot', async ({ page }) => {
      await page.goto('/');

      // Collapse sidebar
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');
      await toggleBtn.click();
      await page.waitForTimeout(500); // Wait for animation

      await expect(page).toHaveScreenshot('sidebar-collapsed.png', {
        fullPage: true,
      });
    });

    test('evaluaciones page screenshot', async ({ page }) => {
      await page.goto('/evaluaciones');
      await expect(page).toHaveScreenshot('evaluaciones-page.png', {
        fullPage: true,
      });
    });

    test('matrices page screenshot', async ({ page }) => {
      await page.goto('/matrices');
      await expect(page).toHaveScreenshot('matrices-page.png', {
        fullPage: true,
      });
    });
  });
  ```

- Run `npx playwright test --update-snapshots` to create baseline screenshots

### Step 23: Add Test Data Attributes

Add data-testid attributes to components for testing.

- Update `src/components/ui/Sidebar.tsx`:
  - Add `data-testid="sidebar"` to aside element
  - Add `data-testid="sidebar-toggle"` to toggle button
  - Add `data-testid="nav-{name}"` to each nav item

- Update `src/components/ui/PageHeader.tsx`:
  - Add `data-testid="page-header"` to container
  - Add `data-testid="header-stats"` to stats container
  - Add `data-testid="header-action-create"` to primary action button

- Update `src/components/ui/Fab.tsx`:
  - Add `data-testid="fab"` to button element

### Step 24: Run All E2E Tests

Execute Playwright tests to validate functionality.

- Run tests: `npm run test:e2e`
- Fix any failing tests
- Update snapshots if visual changes are intentional
- Ensure all tests pass before completing

### Step 25: Run Final Validation Commands

Execute all validation commands to ensure zero regressions.

- Run lint, build, and dev server
- Fix any TypeScript errors
- Fix any ESLint warnings
- Verify application starts correctly
- Verify all E2E tests pass

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run lint` - Check for lint errors (must pass with 0 errors)
- `npm run build` - Verify TypeScript compilation succeeds
- `npm run dev` - Verify development server starts correctly
- `npm run test:e2e` - Run all Playwright E2E tests (must pass)
- `npx playwright test tests/e2e/sidebar.spec.ts` - Sidebar collapse tests
- `npx playwright test tests/e2e/page-header.spec.ts` - PageHeader render tests
- `npx playwright test tests/e2e/fab.spec.ts` - FAB positioning tests
- `npx playwright test tests/e2e/visual.spec.ts` - Visual regression tests

## Notes

### Design Tokens Reference

Keep these values consistent across all changes:

```
Sidebar expanded width: 288px (w-72)
Sidebar collapsed width: 64px (w-16)
Main content padding: 24px (p-6)
Header padding: 16px (p-4)
Header margin bottom: 16px (mb-4)
Border radius cards: 12px (rounded-xl)
Border radius nav items: 16px (rounded-2xl)
Transition duration: 300ms
```

### Gradient Reference

Primary gradient (headers, active states):

```
bg-gradient-to-r from-indigo-600 to-purple-600
```

Light gradient (hover states):

```
bg-gradient-to-r from-indigo-50 to-purple-50
```

### Import Paths

New files will use these import paths:

```typescript
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSidebar } from '@/hooks/use-sidebar';
```

### Breaking Changes

None expected. All changes are additive or visual refinements:

- Sidebar collapse is opt-in (starts expanded)
- PageHeader maintains same functionality as inline headers
- FAB position change is visual only

### Rollback Strategy

If issues arise:

1. Sidebar: Remove SidebarContext, revert Sidebar.tsx to fixed width
2. PageHeader: Revert individual page files to inline headers
3. Padding: Change p-6 back to p-10 in AppShell

### Performance Considerations

- SidebarContext uses React Context (lightweight)
- localStorage read only on mount
- Transitions use CSS (GPU accelerated)
- No additional API calls or data fetching changes
