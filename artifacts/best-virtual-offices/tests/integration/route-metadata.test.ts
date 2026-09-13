import { describe, expect, it } from 'vitest'
import { pageMetadata } from '@/seo/use-page-metadata'

describe('route metadata', () => {
  it('provides unique metadata for every public city', () => {
    const paths = ['orlando', 'tampa', 'fort-lauderdale', 'miami', 'boca-raton']
      .map((city) => `/cities/${city}`)
    const metadata = paths.map(pageMetadata)

    expect(new Set(metadata.map((item) => item.title))).toHaveLength(paths.length)
    expect(new Set(metadata.map((item) => item.description))).toHaveLength(paths.length)
  })

  it('uses reviewed editorial metadata for guides and providers', () => {
    expect(pageMetadata('/guides/what-is-a-virtual-office').title).toBe('What Is a Virtual Office?')
    expect(pageMetadata('/providers/regus').title).toMatch(/Regus Virtual Office Review/)
  })

  it('marks missing and draft routes as noindex', () => {
    expect(pageMetadata('/guides/business-address-vs-registered-agent').noindex).toBe(true)
    expect(pageMetadata('/not-a-route').noindex).toBe(true)
  })

  it('provides metadata for hubs and trust pages', () => {
    for (const path of ['/florida', '/providers', '/guides', '/methodology', '/affiliate-disclosure', '/privacy', '/corrections']) {
      const metadata = pageMetadata(path)
      expect(metadata.title).not.toBe('Page Not Found')
      expect(metadata.description.length).toBeGreaterThan(40)
    }
  })
})