// e2e/wizard.spec.ts
import { test, expect } from '@playwright/test'

test('wizard: can navigate all 6 steps and reach cart', async ({ page }) => {
  await page.goto('/build')

  // Step 1: Ears
  await expect(page.getByRole('heading', { name: /Choose Your Ears/i })).toBeVisible()
  await page.getByText('Premium Floppy Ears').click()
  await page.getByRole('button', { name: 'Next →' }).click()

  // Step 2: Tail
  await expect(page.getByRole('heading', { name: /Choose Your Tail/i })).toBeVisible()
  await page.getByText('Bushy Tail').click()
  await page.getByRole('button', { name: 'Next →' }).click()

  // Step 3: Eyes
  await expect(page.getByRole('heading', { name: /Choose Your Eyes/i })).toBeVisible()
  await page.getByText('Classic Puppy Eyes').click()
  await page.getByRole('button', { name: 'Next →' }).click()

  // Step 4: Toofs
  await expect(page.getByRole('heading', { name: /Choose Your Toofs/i })).toBeVisible()
  await page.getByText('Buck Toofs').click()
  await page.getByRole('button', { name: 'Next →' }).click()

  // Step 5: Legs
  await expect(page.getByRole('heading', { name: /Choose Your Fur Stick/i })).toBeVisible()
  await page.getByText('Outstretched Fur Stick').click()
  await page.getByRole('button', { name: 'Next →' }).click()

  // Step 6: Coat
  await expect(page.getByRole('heading', { name: /Choose Your Coat/i })).toBeVisible()
  await page.getByText('Golden Doodle').click()
  await page.getByRole('button', { name: 'Review Cart →' }).click()

  // Cart
  await expect(page.getByRole('heading', { name: /Your Boi Parts/i })).toBeVisible()
  await expect(page.getByText('Premium Floppy Ears')).toBeVisible()
  await expect(page.getByText('Golden Doodle')).toBeVisible()
})

test('wizard: back button returns to previous step', async ({ page }) => {
  await page.goto('/build')
  await page.getByRole('button', { name: 'Next →' }).click()
  await expect(page.getByRole('heading', { name: /Choose Your Tail/i })).toBeVisible()
  await page.getByRole('button', { name: '← Back' }).click()
  await expect(page.getByRole('heading', { name: /Choose Your Ears/i })).toBeVisible()
})

test('wizard: selecting a product highlights the card', async ({ page }) => {
  await page.goto('/build')
  const card = page.getByText('Premium Floppy Ears').locator('..')
  await card.click()
  await expect(card).toHaveClass(/selected/)
})
