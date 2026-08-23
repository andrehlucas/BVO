import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('editorial entry points', () => {
  test('takes a reader from a guide to a city comparison and from a provider review to its city', async ({ page }) => {
    test.skip(test.info().project.name === 'mobile-chromium', 'Covered by the mobile acceptance journey.')
    await page.goto('/guides/what-is-a-virtual-office')
    await page.getByRole('link', { name: 'Florida city' }).click()
    await expect(page).toHaveURL(/\/florida$/)
    await page.getByRole('link', { name: /Miami.*Compare Miami options/ }).click()
    await expect(page).toHaveURL(/\/cities\/miami$/)

    await page.goto('/providers/regus')
    await page.getByRole('link', { name: 'Miami comparison' }).click()
    await expect(page).toHaveURL(/\/cities\/miami$/)
  })
})

test.describe('provider profile', () => {
  test('renders the Opus decision journey without overflow or serious accessibility violations', async ({ page }) => {
    await page.goto('/providers/opus-virtual-offices')

    await expect(page.getByRole('heading', { level: 1, name: 'Opus Virtual Offices review' })).toBeVisible()
    await expect(page.getByText('650+', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Compare Florida locations' })).toHaveAttribute('href', '#compare-locally')

    const workspaceImage = page.getByRole('img', { name: 'Illustrative modern office building exterior' })
    await workspaceImage.scrollIntoViewIfNeeded()
    await expect(workspaceImage).toBeVisible()
    await expect.poll(() => workspaceImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)

    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)

    const results = await new AxeBuilder({ page }).analyze()
    const blockingViolations = results.violations.filter((violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(blockingViolations).toEqual([])
  })
})

test.describe('mobile comparison', () => {
  test('retains the explicit unranked explanation when no comparable phone row is available', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-chromium', 'Mobile-only acceptance journey.')
    await page.goto('/cities/miami?need=receptionist-phone')

    await expect(page.getByRole('heading', { name: /compare virtual offices in miami by what you actually need/i })).toBeVisible()
    const unranked = page.getByRole('region', { name: 'Offers not ranked' })
    await expect(unranked).toContainText('Opus Virtual Offices')
    await expect(unranked).toContainText('We could not verify every number needed for a fair ranking.')
    await expect(unranked).toContainText('Live receptionist is included')
    await expect(unranked).toContainText('Mail forwarding is usage-based')
    await expect(page.getByRole('button', { name: 'Compare offer details' })).toBeVisible()
    await expect(page.locator('.comparison-disclosure')).toBeVisible()
  })
})
