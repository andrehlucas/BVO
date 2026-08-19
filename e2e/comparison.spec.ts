import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Miami comparison', () => {
  test('keeps incomplete phone offers transparent and keeps redirects safely noindexed', async ({ page }) => {
    test.skip(test.info().project.name === 'mobile-chromium', 'Covered by the mobile acceptance journey.')
    await page.goto('/cities/miami')

    await page.getByRole('radio', { name: 'Live receptionist & phone' }).click()
    await expect(page).toHaveURL(/\/cities\/miami\?need=receptionist-phone$/)
    await expect(page.getByRole('heading', { name: /virtual offices in miami: live receptionist & phone/i })).toBeVisible()

    const unranked = page.getByRole('region', { name: 'Offers not ranked' })
    await expect(unranked).toContainText('Opus Virtual Offices')
    await expect(unranked).toContainText('Insufficient verified data for a numbered ranking.')
    await expect(unranked.getByRole('list', { name: 'Opus Virtual Offices recorded feature statuses' })).toContainText('Live receptionist is included')
    await expect(unranked.getByRole('list', { name: 'Opus Virtual Offices recorded feature statuses' })).toContainText('Mail forwarding is usage-based')
    await expect(page.getByRole('link', { name: /view .* offer/i })).toHaveCount(0)
    await expect(page.locator('.comparison-disclosure')).toBeVisible()

    await page.getByRole('radio', { name: 'Address & mail' }).click()
    await expect(page).toHaveURL(/\/cities\/miami\?need=address-mail$/)
    await expect(page.getByRole('region', { name: 'Offers not ranked' })).toContainText('Mail forwarding is an add-on')

    const results = await new AxeBuilder({ page }).analyze()
    const blockingViolations = results.violations.filter((violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(blockingViolations).toEqual([])

    const response = await page.request.get('/go/opus-virtual-offices?city=miami&track=receptionist-phone&plan=opus-florida-virtual-office', {
      maxRedirects: 0,
    })
    expect(response.status()).toBe(302)
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow')
    expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(response.headers().location).toMatch(/^https:\/\//)
  })

  test('keeps native controls in a predictable keyboard order', async ({ page }) => {
    test.skip(test.info().project.name === 'mobile-chromium', 'Covered by the mobile acceptance journey.')
    await page.goto('/cities/miami')

    const selectedNeed = page.getByRole('radio', { name: 'Address & mail' })
    await selectedNeed.focus()
    await expect(selectedNeed).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Address & mail', exact: true })).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Live receptionist & phone', exact: true })).toBeFocused()
  })
})
