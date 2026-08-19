import methodology from '@/../content/methodology/ranking-v1.json'
import type { Catalog, Plan, PlanFeature, Track } from '@/domain/catalog/types'
import { rankOffers } from '@/domain/ranking/rank'
import { scoreTrackOffer } from '@/domain/ranking/score-track'
import { buildOfferCandidates } from '@/domain/ranking/build-candidates'
import { validCatalogFixture } from '../fixtures/catalog'

const money = (amountCents: number) => ({
  amountCents,
  currency: 'USD' as const,
  billingPeriod: 'month' as const,
})

const feature = (
  name: PlanFeature['feature'],
  state: PlanFeature['state'] = 'included',
): PlanFeature => ({ feature: name, state })

const plan = (id: string, providerId: string, track: Track, overrides: Partial<Plan> = {}): Plan => ({
  id,
  providerId,
  locationIds: ['miami-example'],
  name: id,
  tracks: [track],
  basePrice: money(10000),
  quoteRequired: false,
  mandatoryFees: [],
  deposit: null,
  promotion: null,
  includedReceptionistMinutes: 100,
  minimumTermMonths: 1,
  renewalTerms: 'Renews monthly.',
  cancellationTerms: 'Cancel before the next billing cycle.',
  features: [],
  limits: [],
  evidenceIds: ['miami-address-mail-price'],
  ...overrides,
})

const catalogWithPlans = (plans: Plan[]): Catalog => {
  const baseProvider = structuredClone(validCatalogFixture.providers[0]) as Catalog['providers'][number]
  const baseLocation = structuredClone(validCatalogFixture.locations[0]) as Catalog['locations'][number]
  const localizedPlans = plans.map((value) => ({
    ...value,
    locationIds: [`miami-${value.providerId}`],
  }))

  return {
    ...(structuredClone(validCatalogFixture) as Catalog),
    providers: [
      ...localizedPlans
        .filter((value, index, all) => all.findIndex((item) => item.providerId === value.providerId) === index)
        .map((value) => ({
          ...baseProvider,
          id: value.providerId,
          slug: value.providerId,
          name: value.providerId,
        })),
    ],
    locations: localizedPlans
      .filter((value, index, all) => all.findIndex((item) => item.providerId === value.providerId) === index)
      .map((value) => ({
        ...baseLocation,
        id: `miami-${value.providerId}`,
        providerId: value.providerId,
      })),
    plans: localizedPlans,
  }
}

const addressMailFeatures = (mailFeature: PlanFeature = feature('mail_forwarding')) => [
  feature('business_address'),
  feature('mail_receiving'),
  mailFeature,
]

const receptionistFeatures = (phoneFeature: PlanFeature = feature('call_forwarding')) => [
  feature('live_receptionist'),
  phoneFeature,
]

const fullOfficeFeatures = () => [
  feature('business_address'),
  feature('mail_receiving'),
  feature('live_receptionist'),
  feature('call_forwarding'),
  feature('meeting_rooms'),
]

interface IncompleteRankingOverride {
  minimumTermMonths?: number | null
  locationAvailability?: Catalog['locations'][number]['availability']
  evidenceIds?: string[]
}

const incompleteRankingCases: Array<[string, IncompleteRankingOverride]> = [
  ['an unconfirmed contract term', { minimumTermMonths: null }],
  ['an unconfirmed local availability', { locationAvailability: 'not_confirmed' }],
  ['missing linked evidence', { evidenceIds: ['missing-evidence'] }],
]

describe('track ranking', () => {
  it.each(Object.values(methodology.tracks))('uses approved weights that total 100', (weights) => {
    expect(Object.values(weights).reduce((total, weight) => total + weight, 0)).toBe(100)
  })

  it.each([
    ['address-mail', addressMailFeatures()],
    ['receptionist-phone', receptionistFeatures()],
    ['full-office', fullOfficeFeatures()],
  ] as const)('awards more cost points to the lower complete recurring price for %s', (track, features) => {
    const catalog = catalogWithPlans([
      plan('higher-cost', 'provider-b', track, { basePrice: money(12000), features }),
      plan('lower-cost', 'provider-a', track, { basePrice: money(8000), features }),
    ])

    const result = rankOffers(catalog, 'miami', track, {})
    const costDimension = Object.keys(methodology.tracks[track])[0]!

    expect(result.ranked.find((offer) => offer.providerId === 'provider-a')?.breakdown
      .find((item) => item.dimension === costDimension)?.points)
      .toBeGreaterThan(result.ranked.find((offer) => offer.providerId === 'provider-b')?.breakdown
        .find((item) => item.dimension === costDimension)?.points ?? -1)
  })

  it('scores included requested features above paid add-ons', () => {
    const catalog = catalogWithPlans([
      plan('included-forwarding', 'provider-a', 'address-mail', {
        features: addressMailFeatures(feature('mail_forwarding')),
      }),
      plan('paid-forwarding', 'provider-b', 'address-mail', {
        features: addressMailFeatures({
          feature: 'mail_forwarding',
          state: 'paid_add_on',
          price: money(1000),
        }),
      }),
    ])

    const result = rankOffers(catalog, 'miami', 'address-mail', { needsMailForwarding: true })
    const dimension = 'mailManagement'
    const includedPoints = result.ranked.find((offer) => offer.providerId === 'provider-a')?.breakdown
      .find((item) => item.dimension === dimension)?.points
    const addOnPoints = result.ranked.find((offer) => offer.providerId === 'provider-b')?.breakdown
      .find((item) => item.dimension === dimension)?.points

    expect(includedPoints).toBeGreaterThan(addOnPoints ?? -1)
  })

  it('gives not confirmed features no points without calling them unavailable', () => {
    const catalog = catalogWithPlans([
      plan('unknown-forwarding', 'provider-a', 'address-mail', {
        features: addressMailFeatures({ feature: 'mail_forwarding', state: 'not_confirmed' }),
      }),
    ])
    const candidate = buildOfferCandidates(catalog, 'miami', 'address-mail')[0]!
    const ranked = scoreTrackOffer(candidate, { catalog, candidates: [candidate] }, { needsMailForwarding: true })

    const item = ranked?.breakdown.find((value) => value.dimension === 'mailManagement')
    expect(item?.points).toBe(0)
    expect(item?.reason).toContain('not confirmed')
    expect(item?.reason).not.toContain('unavailable')
  })

  it('returns incomplete essential prices as unranked offers', () => {
    const catalog = catalogWithPlans([
      plan('priced', 'provider-a', 'address-mail', { features: addressMailFeatures() }),
      plan('quote-only', 'provider-b', 'address-mail', {
        basePrice: null,
        quoteRequired: true,
        features: addressMailFeatures(),
      }),
    ])
    const candidate = buildOfferCandidates(catalog, 'miami', 'address-mail')
      .find((value) => value.providerId === 'provider-b')!

    expect(scoreTrackOffer(candidate, { catalog, candidates: buildOfferCandidates(catalog, 'miami', 'address-mail') }, {}))
      .toBeNull()
    expect(rankOffers(catalog, 'miami', 'address-mail', {}).unranked).toEqual([
      { candidate, reason: 'insufficient_verified_data' },
    ])
  })

  it.each(incompleteRankingCases)('keeps offers with %s out of numbered rankings', (_description, override) => {
    const incompletePlan = plan('incomplete', 'provider-b', 'address-mail', {
      features: addressMailFeatures(),
      ...(override.minimumTermMonths === undefined ? {} : { minimumTermMonths: override.minimumTermMonths }),
      ...(override.evidenceIds === undefined ? {} : { evidenceIds: override.evidenceIds }),
    })
    const catalog = catalogWithPlans([
      plan('complete', 'provider-a', 'address-mail', { features: addressMailFeatures() }),
      incompletePlan,
    ])
    if (override.locationAvailability) {
      catalog.locations.find((location) => location.providerId === 'provider-b')!.availability = override.locationAvailability
    }

    const result = rankOffers(catalog, 'miami', 'address-mail', {})

    expect(result.ranked.map((offer) => offer.providerId)).toEqual(['provider-a'])
    expect(result.unranked).toMatchObject([
      { candidate: { providerId: 'provider-b' }, reason: 'insufficient_verified_data' },
    ])
  })

  it('combines verified price and receptionist minute allowance in the receptionist cost dimension', () => {
    const catalog = catalogWithPlans([
      plan('more-minutes', 'provider-a', 'receptionist-phone', {
        basePrice: money(10000),
        includedReceptionistMinutes: 200,
        features: receptionistFeatures(),
      }),
      plan('fewer-minutes', 'provider-b', 'receptionist-phone', {
        basePrice: money(10000),
        includedReceptionistMinutes: 50,
        features: receptionistFeatures(),
      }),
    ])

    const result = rankOffers(catalog, 'miami', 'receptionist-phone', {})
    const points = (providerId: string) => result.ranked.find((offer) => offer.providerId === providerId)?.breakdown
      .find((item) => item.dimension === 'totalCostAndMinuteAllowance')?.points

    expect(result.ranked[0]?.providerId).toBe('provider-a')
    expect(points('provider-a')).toBeGreaterThan(points('provider-b') ?? -1)
  })

  it('keeps receptionist offers with an unverified minute allowance unranked', () => {
    const catalog = catalogWithPlans([
      plan('known-minutes', 'provider-a', 'receptionist-phone', {
        includedReceptionistMinutes: 100,
        features: receptionistFeatures(),
      }),
      plan('unknown-minutes', 'provider-b', 'receptionist-phone', {
        includedReceptionistMinutes: null,
        features: receptionistFeatures(),
      }),
    ])

    expect(rankOffers(catalog, 'miami', 'receptionist-phone', {})).toMatchObject({
      ranked: [{ providerId: 'provider-a' }],
      unranked: [{ candidate: { providerId: 'provider-b' }, reason: 'insufficient_verified_data' }],
    })
  })

  it('sorts equal scores deterministically by provider ID after equal evidence and price', () => {
    const catalog = catalogWithPlans([
      plan('same-b', 'provider-b', 'address-mail', { features: addressMailFeatures() }),
      plan('same-a', 'provider-a', 'address-mail', { features: addressMailFeatures() }),
    ])

    expect(rankOffers(catalog, 'miami', 'address-mail', {}).ranked.map((offer) => offer.providerId))
      .toEqual(['provider-a', 'provider-b'])
  })

  it('keeps preference effects inside the selected track without commercial inputs', () => {
    const catalog = catalogWithPlans([
      plan('with-forwarding', 'provider-a', 'address-mail', { features: addressMailFeatures() }),
      plan('without-forwarding', 'provider-b', 'address-mail', {
        features: addressMailFeatures({ feature: 'mail_forwarding', state: 'not_available' }),
      }),
    ])

    const baseline = rankOffers(catalog, 'miami', 'address-mail', {})
    const preferred = rankOffers(catalog, 'miami', 'address-mail', { needsMailForwarding: true, prefersMonthToMonth: true })

    expect(preferred.ranked[0]?.providerId).toBe('provider-a')
    expect(preferred.ranked[0]?.breakdown.reduce((sum, item) => sum + item.points, 0))
      .toBe(preferred.ranked[0]?.score)
    expect(preferred.ranked[0]?.breakdown.map((item) => item.dimension))
      .toEqual(Object.keys(methodology.tracks['address-mail']))
    expect(baseline.ranked).toHaveLength(2)
  })
})
