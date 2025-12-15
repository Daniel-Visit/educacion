import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.skip('sidebar expanded screenshot', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('sidebar-expanded.png', {
      fullPage: true,
    });
  });

  test.skip('sidebar collapsed screenshot', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Collapse sidebar
    const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(500); // Wait for animation
    }

    await expect(page).toHaveScreenshot('sidebar-collapsed.png', {
      fullPage: true,
    });
  });

  test.skip('evaluaciones page screenshot', async ({ page }) => {
    await page.goto('/evaluaciones');

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('evaluaciones-page.png', {
      fullPage: true,
    });
  });

  test.skip('matrices page screenshot', async ({ page }) => {
    await page.goto('/matrices');

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('matrices-page.png', {
      fullPage: true,
    });
  });
});
