import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const sectionOrder = ['needs', 'cities', 'costs', 'providers', 'methodology', 'guides']

test.describe('homepage decision journey', () => {
  test('preserves the hero and presents six accessible commercial sections', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Compare virtual offices by what you actually need' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: /city/i })).toBeVisible()
    await expect(page.getByLabel('Illustrated map of Miami with office buildings')).toBeVisible()
    await expect(page.locator('.home-proof-strip')).toContainText('4providers reviewed')

    const heroSurface = await page.locator('.home-intro').evaluate((hero) => {
      const rect = hero.getBoundingClientRect()
      const styles = getComputedStyle(hero)
      return {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        viewportWidth: window.innerWidth,
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
      }
    })
    expect(heroSurface).toEqual({
      left: 0,
      right: heroSurface.viewportWidth,
      viewportWidth: heroSurface.viewportWidth,
      borderRadius: '0px',
      boxShadow: 'none',
    })

    const sections = page.locator('[data-home-section]')
    await expect(sections).toHaveCount(6)
    expect(await sections.evaluateAll((elements) => elements.map((element) => element.getAttribute('data-home-section')))).toEqual(sectionOrder)

    await expect(page.locator('a[href^="/go/"]')).toHaveCount(0)
    await expect(page.locator('a[href*="business-address-vs-registered-agent"]')).toHaveCount(0)
    await expect(page.locator('a[href^="/cities/"]', { hasText: /Compare .* options/ })).toHaveCount(5)
    await expect(page.locator('a[href^="/providers/"]')).toHaveCount(4)
    await expect(page.locator('.home-guide-list a[href^="/guides/"]')).toHaveCount(3)
    await expect(page.getByRole('link', { name: 'Review the ranking method' })).toHaveAttribute('href', '/methodology')
    await expect(page.getByRole('link', { name: 'See how affiliate links work' })).toHaveAttribute('href', '/affiliate-disclosure')

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(hasHorizontalOverflow).toBe(false)

    const tooSmallControls = await page.locator('[data-home-section] a').evaluateAll((links) => links
      .filter((link) => {
        const rect = link.getBoundingClientRect()
        return rect.width < 44 || rect.height < 44
      })
      .map((link) => link.textContent?.trim()))
    expect(tooSmallControls).toEqual([])

    const results = await new AxeBuilder({ page }).analyze()
    const blockingViolations = results.violations.filter((violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(blockingViolations).toEqual([])
  })

  test('opens a city comparison from the keyboard', async ({ page }) => {
    await page.goto('/')
    const orlando = page.getByRole('link', { name: 'Compare Orlando options' })
    await orlando.focus()
    await expect(orlando).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/cities\/orlando$/)
  })
})
