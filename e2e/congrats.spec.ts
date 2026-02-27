// e2e/congrats.spec.ts
import { test, expect } from '@playwright/test'

async function goToCongrats(page: Parameters<Parameters<typeof test>[1]>[0]) {
  await page.goto('/build')
  for (const selector of [
    'Premium Floppy Ears', 'Bushy Tail', 'Classic Puppy Eyes',
    'Buck Toofs', 'Outstretched Fur Stick', 'Golden Doodle',
  ]) {
    await page.getByText(selector).click()
    const isLast = selector === 'Golden Doodle'
    const nextBtn = page.getByRole('button', { name: isLast ? 'Review Cart →' : 'Next →' })
    await nextBtn.click()
  }
  // Now on Cart — click checkout
  await page.getByRole('button', { name: /Complete Purchase/i }).click()
  await expect(page.locator('#congrats-headline')).toBeVisible()
}

test('congrats: shows headline and name input', async ({ page }) => {
  await goToCongrats(page)
  await expect(page.locator('#congrats-headline')).toContainText('Congrats')
  await expect(page.locator('.name-input')).toBeVisible()
})

test('congrats: name validation rejects too-short names', async ({ page }) => {
  await goToCongrats(page)
  await page.locator('.name-input').fill('A')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('.name-input-error')).toContainText('2')
})

test('congrats: valid name saves and shows confirmation', async ({ page }) => {
  await goToCongrats(page)
  const uniqueName = `Boi${Math.random().toString(36).slice(2, 7)}`
  await page.locator('.name-input').fill(uniqueName)
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('.name-saved')).toContainText('Saved', { timeout: 8000 })
  await expect(page.locator('.name-display')).toContainText(uniqueName)
})

test('congrats: skip hides input and returns home', async ({ page }) => {
  await goToCongrats(page)
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page).toHaveURL('/')
})
