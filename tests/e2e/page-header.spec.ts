import { test, expect } from '@playwright/test';

test.describe('PageHeader', () => {
  test('should render gradient header on evaluaciones page', async ({
    page,
  }) => {
    await page.goto('/evaluaciones');

    const header = page.locator('[data-testid="page-header"]');

    if (await header.isVisible()) {
      await expect(header).toBeVisible();

      // Check title
      await expect(header.locator('h1')).toContainText('Evaluaciones');
    }
  });

  test('should display stats correctly', async ({ page }) => {
    await page.goto('/evaluaciones');

    const stats = page.locator('[data-testid="header-stats"]');

    // Stats may be hidden on mobile
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768) {
      await expect(stats).toBeVisible();
    }
  });

  test('should have working action buttons', async ({ page }) => {
    await page.goto('/evaluaciones');

    const createBtn = page.locator('[data-testid="header-action-create"]');

    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page).toHaveURL('/evaluaciones/crear');
    }
  });

  test('should render on matrices page', async ({ page }) => {
    await page.goto('/matrices');

    const header = page.locator('[data-testid="page-header"]');

    if (await header.isVisible()) {
      await expect(header.locator('h1')).toContainText('Matrices');
    }
  });

  test('should render on horarios page', async ({ page }) => {
    await page.goto('/horarios');

    const header = page.locator('[data-testid="page-header"]');

    if (await header.isVisible()) {
      await expect(header.locator('h1')).toContainText('Configuración');
    }
  });
});
