import { afterEach, describe, expect, it, vi } from 'vitest'
import sitemap from '@/app/sitemap'
import robots from '@/app/robots'
import { generateMetadata as cityMetadata } from '@/app/cities/[city]/page'
import { generateMetadata as guideMetadata } from '@/app/guides/[slug]/page'
import { generateMetadata as providerMetadata } from '@/app/providers/[slug]/page'
import { getSiteUrl } from '@/seo/site-url'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('public metadata', () => {
  it('uses unique factual metadata and a canonical path for every public city', async () => {
    const slugs = ['orlando', 'tampa', 'fort-lauderdale', 'miami', 'boca-raton']
    const metadata = await Promise.all(slugs.map((city) => cityMetadata({ params: Promise.resolve({ city }) })))
    const titles = metadata.map((item) => item.title)
    const descriptions = metadata.map((item) => item.description)

    expect(new Set(titles).size).toBe(slugs.length)
    expect(new Set(descriptions).size).toBe(slugs.length)
    expect(metadata[3]?.alternates?.canonical).toBe('/cities/miami')
    expect(descriptions.join(' ')).not.toMatch(/\$|\b(?:price|cost|cheap|save)\b/i)
  })

  it('uses reviewed editorial page metadata and never exposes legal-draft guides', async () => {
    const guide = await guideMetadata({ params: Promise.resolve({ slug: 'what-is-a-virtual-office' }) })
    const provider = await providerMetadata({ params: Promise.resolve({ slug: 'regus' }) })

    expect(guide.alternates?.canonical).toBe('/guides/what-is-a-virtual-office')
    expect(provider.alternates?.canonical).toBe('/providers/regus')
    expect(guide.description).not.toMatch(/\$|\b(?:price|cost|cheap|save)\b/i)
  })

  it('publishes the complete reviewed route inventory in the sitemap', async () => {
    const siteUrl = getSiteUrl().origin
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toEqual(expect.arrayContaining([
      `${siteUrl}/`,
      `${siteUrl}/florida`,
      `${siteUrl}/providers`,
      `${siteUrl}/guides`,
      ...['orlando', 'tampa', 'fort-lauderdale', 'miami', 'boca-raton'].map((city) => `${siteUrl}/cities/${city}`),
      ...['regus', 'opus-virtual-offices', 'alliance-virtual-offices', 'davinci-virtual'].map((slug) => `${siteUrl}/providers/${slug}`),
      ...[
        'what-is-a-virtual-office',
        'business-address-vs-virtual-office',
        'mail-handling-vs-live-receptionist',
        'hidden-fees-in-virtual-office-plans',
        'how-to-choose-a-virtual-office-in-florida',
        'virtual-office-checklist-for-freelancers-and-small-businesses',
      ].map((slug) => `${siteUrl}/guides/${slug}`),
      `${siteUrl}/methodology`,
      `${siteUrl}/affiliate-disclosure`,
      `${siteUrl}/privacy`,
      `${siteUrl}/corrections`,
    ]))
    expect(urls).not.toContain(`${siteUrl}/guides/business-address-vs-registered-agent`)
    expect(urls).not.toContain(`${siteUrl}/guides/can-you-use-a-virtual-office-address-for-your-business`)
  })

  it('keeps outbound redirects out of search indexes', () => {
    expect(robots().rules).toEqual(expect.objectContaining({
      userAgent: '*',
      allow: '/',
      disallow: ['/go/'],
    }))
  })

  it('requires an HTTPS public site URL in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://example.com')
    expect(getSiteUrl).toThrow(/HTTPS/i)

    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    expect(getSiteUrl().toString()).toBe('https://example.com/')
  })

  it('uses the stable Vercel production domain when no custom domain is configured', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'bvo.example.vercel.app')

    expect(getSiteUrl().toString()).toBe('https://bvo.example.vercel.app/')
  })
})
