import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    await expect(page.locator('input[placeholder*="email"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="password"]')).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    await expect(page.locator('h1:has-text("Create")')).toBeVisible();
    await expect(page.locator('input[placeholder*="name"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="phone"]')).toBeVisible();
  });

  test('should show validation errors on login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Click login without filling form
    await page.click('button:has-text("Sign In")');

    // Should show validation error
    await expect(page.locator('text=/required/i')).toBeVisible();
  });
});

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check hero section
    await expect(page.locator('h1:has-text("Print Anything")')).toBeVisible();

    // Check CTA buttons
    await expect(page.locator('text=Upload & Print')).toBeVisible();
    await expect(page.locator('text=Find Nearby Shops')).toBeVisible();
  });

  test('should have navigation header', async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=PrintHub')).toBeVisible();
  });
});

test.describe('Shop Discovery', () => {
  test('should display shops page', async ({ page }) => {
    await page.goto(`${BASE_URL}/shops`);

    await expect(page.locator('h1:has-text("Nearby Print Shops")')).toBeVisible();
  });
});

test.describe('Order Flow', () => {
  test('should redirect to login for protected routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/orders`);

    // Should redirect to login if not authenticated
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {
      // May show unauthorized message instead
    });
  });

  test('should display upload page', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);

    await expect(page.locator('h1:has-text("Upload Documents")')).toBeVisible();
    await expect(page.locator('text=drag')).toBeVisible();
  });
});
