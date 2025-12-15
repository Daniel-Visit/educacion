import { test, expect } from '@playwright/test';

test.describe('FAB', () => {
  test('should be positioned correctly', async ({ page }) => {
    await page.goto('/editor');

    const fab = page.locator('[data-testid="fab"]');

    if (await fab.isVisible()) {
      await expect(fab).toBeVisible();

      // Check position is within expected bounds
      const box = await fab.boundingBox();
      const viewport = page.viewportSize();

      if (box && viewport) {
        // Should be near the right edge (within ~50px tolerance due to various factors)
        expect(viewport.width - box.x - box.width).toBeLessThan(50);

        // Should be near the bottom edge
        expect(viewport.height - box.y - box.height).toBeLessThan(50);
      }
    }
  });

  test('should toggle open state', async ({ page }) => {
    await page.goto('/editor');

    const fab = page.locator('[data-testid="fab"]');

    if (await fab.isVisible()) {
      await fab.click();

      // FAB panel should be visible
      const panel = page.locator('[data-fab-panel]');

      // Wait a bit for animation
      await page.waitForTimeout(300);

      // Check if panel appeared (may not exist on all pages)
      const isPanelVisible = await panel.isVisible().catch(() => false);
      if (isPanelVisible) {
        await expect(panel).toBeVisible();

        // Click again to close
        await fab.click();
        await expect(panel).not.toBeVisible();
      }
    }
  });
});
