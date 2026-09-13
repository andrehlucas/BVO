import affiliateLinksConfig from '../../config/affiliate-links.json'
import { vi } from 'vitest'

const catalog = vi.hoisted(() => ({
  value: {
    providers: [
      {
        id: 'example-office',
        name: 'Example Office',
        slug: 'example-office',
        websiteUrl: 'https://example.com/public-provider-page',
        description: 'Virtual office provider.',
        evidenceIds: [],
        lastReviewedAt: '2026-08-19T12:00:00Z',
      },
    ],
    locations: [],
    plans: [],
    evidence: [],
    assessments: [],
  },
}))

vi.mock('@/domain/catalog/load-catalog', () => ({
  loadCatalog: () => catalog.value,
}))

import { GET } from '@/app/go/[providerId]/route'
import { resolveOutboundUrl } from '@/commercial/resolve-outbound-url'
import type { AffiliateLink } from '@/commercial/affiliate-link-schema'

const providerId = 'example-office'
const fallbackUrl = 'https://example.com/public-provider-page'
const affiliateLinks = affiliateLinksConfig as AffiliateLink[]

function createAffiliateLink(overrides: Partial<AffiliateLink> = {}): AffiliateLink {
  return {
    providerId,
    destinationUrl: 'https://affiliate.example.com/offer',
    trackingParameters: { partner: 'virtual-office' },
    active: true,
    disclosureLabel: 'Affiliate link',
    ...overrides,
  }
}

afterEach(() => {
  affiliateLinks.splice(0)
})

describe('resolveOutboundUrl', () => {
  it('uses an active affiliate destination with only configured tracking parameters', () => {
    affiliateLinks.push(createAffiliateLink())

    expect(resolveOutboundUrl(providerId, fallbackUrl).toString()).toBe(
      'https://affiliate.example.com/offer?partner=virtual-office',
    )
  })

  it('uses the validated public URL when the affiliate link is inactive', () => {
    affiliateLinks.push(createAffiliateLink({ active: false }))

    expect(resolveOutboundUrl(providerId, fallbackUrl).toString()).toBe(fallbackUrl)
  })

  it('rejects non-HTTPS destinations', () => {
    expect(() => resolveOutboundUrl(providerId, 'http://example.com')).toThrow('HTTPS')
  })
})

describe('GET /go/:providerId', () => {
  it('returns 404 when the provider does not exist', async () => {
    const response = await GET(new Request('https://virtualoffice.test/go/missing-provider'), {
      params: Promise.resolve({ providerId: 'missing-provider' }),
    })

    expect(response.status).toBe(404)
  })

  it('redirects only to the catalog provider URL and rejects arbitrary parameters', async () => {
    const redirectResponse = await GET(
      new Request(
        'https://virtualoffice.test/go/example-office?city=miami&track=address-mail&redirect=https://attacker.test',
      ),
      { params: Promise.resolve({ providerId }) },
    )

    expect(redirectResponse.status).toBe(400)
    expect(redirectResponse.headers.get('location')).toBeNull()
  })

  it('redirects with allowed context parameters without forwarding them', async () => {
    affiliateLinks.push(createAffiliateLink())

    const response = await GET(
      new Request(
        'https://virtualoffice.test/go/example-office?city=miami&track=address-mail&plan=starter&position=1&context=ranking',
      ),
      { params: Promise.resolve({ providerId }) },
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://affiliate.example.com/offer?partner=virtual-office')
    expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
  })
})
