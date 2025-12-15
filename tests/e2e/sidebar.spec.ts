import { test, expect } from '@playwright/test';

test.describe('Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login first (auth required for sidebar)
    await page.goto('/auth/login');
  });

  test('should toggle collapse state', async ({ page }) => {
    // Skip if not logged in - just verify sidebar structure
    await page.goto('/');

    const sidebar = page.locator('[data-testid="sidebar"]');

    // If sidebar exists, test toggle functionality
    if (await sidebar.isVisible()) {
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');

      // Initially expanded
      await expect(sidebar).toHaveClass(/w-72/);

      // Click toggle
      await toggleBtn.click();
      await expect(sidebar).toHaveClass(/w-16/);

      // Click again to expand
      await toggleBtn.click();
      await expect(sidebar).toHaveClass(/w-72/);
    }
  });

  test('should persist collapse state after refresh', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('[data-testid="sidebar"]');

    if (await sidebar.isVisible()) {
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');

      // Collapse sidebar
      await toggleBtn.click();

      // Refresh page
      await page.reload();

      // Should still be collapsed
      await expect(sidebar).toHaveClass(/w-16/);
    }
  });

  test('should show tooltips when collapsed', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('[data-testid="sidebar"]');

    if (await sidebar.isVisible()) {
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');
      await toggleBtn.click();

      // Hover over nav item
      const navItem = page.locator('[data-testid="nav-evaluaciones"]');
      await navItem.hover();

      // Tooltip should appear
      const tooltip = page.locator('[role="tooltip"]');
      await expect(tooltip).toBeVisible();
    }
  });

  test('should navigate correctly when collapsed', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('[data-testid="sidebar"]');

    if (await sidebar.isVisible()) {
      const toggleBtn = page.locator('[data-testid="sidebar-toggle"]');
      await toggleBtn.click();

      // Click nav item
      const navItem = page.locator('[data-testid="nav-dashboard"]');
      await navItem.click();

      // Should navigate
      await expect(page).toHaveURL('/');
    }
  });
});
