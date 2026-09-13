import { describe, expect, it } from 'vitest'
import { EditorialPageNotFoundError, listEditorialPages, loadEditorialPage } from '@/content/load-editorial-page'

describe('generated editorial loader', () => {
  it('loads reviewed pages with rendered Markdown', () => {
    expect(loadEditorialPage('guides', 'what-is-a-virtual-office')).toMatchObject({
      slug: 'what-is-a-virtual-office',
      status: 'reviewed',
      html: expect.stringContaining('<'),
    })
  })

  it('publishes only reviewed editorial pages', () => {
    expect(listEditorialPages('guides').every((page) => page.status === 'reviewed')).toBe(true)
  })

  it('keeps draft guides unavailable by direct URL', () => {
    expect(() => loadEditorialPage('guides', 'business-address-vs-registered-agent'))
      .toThrow(EditorialPageNotFoundError)
    expect(() => loadEditorialPage('guides', 'can-you-use-a-virtual-office-address-for-your-business'))
      .toThrow(EditorialPageNotFoundError)
  })

  it('does not expose an invalid editorial kind', () => {
    expect(() => loadEditorialPage('../../private' as never, 'what-is-a-virtual-office'))
      .toThrow(EditorialPageNotFoundError)
  })
})