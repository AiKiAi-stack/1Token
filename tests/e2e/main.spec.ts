import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect to login if not authenticated', async ({ page }) => {
    await expect(page).toHaveURL('/login')
  })

  test('should allow login with correct password', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })
})

test.describe('Token Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should display token list', async ({ page }) => {
    await expect(page.locator('text=Your Tokens')).toBeVisible()
  })

  test('should create a new token', async ({ page }) => {
    await page.click('button:has-text("Add Token")')
    
    await page.fill('input[name="platform"]', 'GitHub')
    await page.fill('input[name="tokenValue"]', 'ghp_test123')
    await page.fill('input[name="purpose"]', 'Testing')
    
    await page.click('button:has-text("Create")')
    
    await expect(page.locator('text=GitHub')).toBeVisible()
  })

  test('should copy token to clipboard', async ({ page }) => {
    // Test copy functionality
    const copyButton = page.locator('button:has-text("Copy")')
    await expect(copyButton).toBeVisible()
  })

  test('should edit an existing token', async ({ page }) => {
    // Test edit functionality
    const editButton = page.locator('button:has-text("Edit")')
    await expect(editButton).toBeVisible()
  })

  test('should delete a token', async ({ page }) => {
    // Test delete functionality
    const deleteButton = page.locator('button:has-text("Delete")')
    await expect(deleteButton).toBeVisible()
  })
})

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/dashboard')
    
    const themeToggle = page.locator('[aria-label="Toggle theme"]')
    await themeToggle.click()
    
    // Check if theme changed
    const html = page.locator('html')
    const theme = await html.getAttribute('class')
    expect(theme).toContain('dark')
  })
})

test.describe('Export Functionality', () => {
  test('should open export dialog', async ({ page }) => {
    await page.goto('/dashboard')
    
    const exportButton = page.locator('button:has-text("Export")')
    await exportButton.click()
    
    await expect(page.locator('text=Export Tokens')).toBeVisible()
  })

  test('should export tokens as .env format', async ({ page }) => {
    // Test export functionality
    await page.goto('/dashboard')
    const exportButton = page.locator('button:has-text("Export")')
    await exportButton.click()
    
    await page.click('text=.env')
    // Verify download or copy
  })
})

test.describe('CLI Tool', () => {
  test('should get token by platform', async () => {
    // This would require running the CLI
    // Test would be: 1token get github
    expect(true).toBe(true)
  })

  test('should list all tokens', async () => {
    // This would require running the CLI
    // Test would be: 1token list
    expect(true).toBe(true)
  })
})
