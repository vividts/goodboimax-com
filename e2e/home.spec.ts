// e2e/home.spec.ts
import { test, expect } from '@playwright/test'

test('home page shows hero and Build Your Boi button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /GoodBoiMax/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Build Your Boi/i })).toBeVisible()
})

test('Build Your Boi button navigates to /build', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Build Your Boi/i }).click()
  await expect(page).toHaveURL('/build')
  await expect(page.getByRole('heading', { name: /Choose Your Ears/i })).toBeVisible()
})
