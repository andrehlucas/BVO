import methodology from '@/../content/methodology/ranking-v1.json'
import type { Catalog, Plan, PlanFeature } from '@/domain/catalog/types'
import { rankOverallProviders } from '@/domain/ranking/overall'
import { validCatalogFixture } from '../fixtures/catalog'

const money = (amountCents: number, billingPeriod: 'month' | 'one_time' = 'month') => ({
  amountCents,
  currency: 'USD' as const,
  billingPeriod,
})

const feature = (name: PlanFeature['feature'], state: PlanFeature['state'] = 'included'): PlanFeature => ({
  feature: name,
  state,
})

const completePlan = (id: string, providerId: string, overrides: Partial<Plan> = {}): Plan => ({
  id,
  providerId,
  locationIds: [`miami-${providerId}`],
  name: `${providerId} complete virtual office`,
  tracks: ['full-office'],
  basePrice: money(9900),
  quoteRequired: false,
  mandatoryFees: [],
  deposit: null,
  promotion: null,
  includedReceptionistMinutes: 100,
  minimumTermMonths: 1,
  renewalTerms: 'Renews monthly.',
  cancellationTerms: 'Cancel before the next billing cycle.',
  features: [
    feature('business_address'),
    feature('mail_receiving'),
    feature('mail_forwarding'),
    feature('mail_scanning'),
    feature('local_mail_pickup'),
    feature('live_receptionist'),
    feature('business_phone_number'),
    feature('call_forwarding'),
    feature('administrative_support'),
    feature('meeting_rooms'),
    feature('coworking_access'),
    feature('private_office_access'),
    feature('guest_reception'),
  ],
  limits: [],
  evidenceIds: ['miami-address-mail-price'],
  ...overrides,
})

const catalogWithProviders = (plans: Plan[], citiesByProvider: Record<string, string> = {}): Catalog => {
  const baseProvider = structuredClone(validCatalogFixture.providers[0]) as Catalog['providers'][number]
  const baseLocation = structuredClone(validCatalogFixture.locations[0]) as Catalog['locations'][number]
  const providerIds = [...new Set(plans.map((plan) => plan.providerId))]

  return {
    ...(structuredClone(validCatalogFixture) as Catalog),
    providers: providerIds.map((providerId) => ({
      ...baseProvider,
      id: providerId,
      name: providerId,
      slug: providerId,
    })),
    locations: providerIds.map((providerId) => ({
      ...baseLocation,
      id: `miami-${providerId}`,
      providerId,
      city: citiesByProvider[providerId] ?? 'Miami',
      citySlug: (citiesByProvider[providerId] ?? 'Miami').toLowerCase(),
      evidenceIds: [`${providerId}-city-location`],
    })),
    plans,
    evidence: [
      ...(structuredClone(validCatalogFixture.evidence) as Catalog['evidence']),
      ...providerIds.map((providerId) => ({
        id: `${providerId}-city-location`,
        entityType: 'location' as const,
        entityId: `miami-${providerId}`,
        field: 'address',
        sourceUrl: `https://example.com/locations/${providerId}`,
        capturedAt: '2026-08-19T12:00:00Z',
        observedValue: 'Verified city location',
        supportingExcerpt: 'Verified city location.',
        verificationMethod: 'official_website',
        confidence: 'high' as const,
      })),
    ],
    assessments: [],
  }
}

describe('overall provider ranking', () => {
  it('uses the approved 25/20/15/15/25 methodology weights', () => {
    const catalog = catalogWithProviders([completePlan('provider-a-plan', 'provider-a')])
    const result = rankOverallProviders(catalog, 'miami')

    expect(methodology.overallProviderRating).toEqual({
      productLineValue: 25,
      coverageAcrossNeeds: 20,
      flexibility: 15,
      localPresenceAndOptions: 15,
      transparencyAndVerifiability: 25,
    })
    expect(result[0]?.breakdown.map((item) => item.maxPoints)).toEqual([25, 20, 15, 15, 25])
    expect(result[0]?.score).toBe(100)
  })

  it('only assigns local-presence points from verified locations in the requested city', () => {
    const catalog = catalogWithProviders([
      completePlan('miami-plan', 'miami-provider'),
      completePlan('orlando-plan', 'orlando-provider', { locationIds: ['miami-orlando-provider'] }),
    ], { 'orlando-provider': 'Orlando' })

    expect(rankOverallProviders(catalog, 'miami').map((result) => result.providerId)).toEqual([
      'miami-provider',
    ])
  })

  it('does not treat provider evidence as verification for a city location', () => {
    const catalog = catalogWithProviders([completePlan('provider-a-plan', 'provider-a')])
    catalog.locations[0]!.evidenceIds = ['provider-website']

    expect(rankOverallProviders(catalog, 'miami')).toEqual([])
  })

  it('does not treat evidence for a different location as verification for this city location', () => {
    const catalog = catalogWithProviders([completePlan('provider-a-plan', 'provider-a')])
    catalog.evidence.find((evidence) => evidence.id === 'provider-a-city-location')!.entityId =
      'another-miami-location'

    expect(rankOverallProviders(catalog, 'miami')).toEqual([])
  })

  it('excludes providers whose available city offers lack verified ranking data', () => {
    const catalog = catalogWithProviders([
      completePlan('complete-plan', 'complete-provider'),
      completePlan('incomplete-plan', 'incomplete-provider', { minimumTermMonths: null }),
    ])

    expect(rankOverallProviders(catalog, 'miami').map((result) => result.providerId)).toEqual([
      'complete-provider',
    ])
  })

  it('does not change editorial results when affiliate configuration is present', () => {
    const catalog = catalogWithProviders([completePlan('provider-a-plan', 'provider-a')])
    const withAffiliateConfiguration = {
      ...catalog,
      affiliateLinks: { 'provider-a': 'https://affiliate.example/provider-a' },
    }

    expect(rankOverallProviders(withAffiliateConfiguration, 'miami')).toEqual(
      rankOverallProviders(catalog, 'miami'),
    )
  })
})
