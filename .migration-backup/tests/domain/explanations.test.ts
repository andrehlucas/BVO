import type { Catalog, Plan } from '@/domain/catalog/types'
import { explainRecommendation } from '@/domain/ranking/explain'
import { rankOffers } from '@/domain/ranking/rank'
import type { OverallProviderResult, RankedOffer, ScoreBreakdownItem } from '@/domain/ranking/types'
import { validCatalogFixture } from '../fixtures/catalog'

const catalogForExplanation = (mailForwarding: Plan['features'][number]['state']): Catalog => {
  const catalog = structuredClone(validCatalogFixture) as Catalog
  catalog.plans[0] = {
    ...catalog.plans[0]!,
    mandatoryFees: [{ name: 'Setup fee', price: { amountCents: 2900, currency: 'USD', billingPeriod: 'one_time' } }],
    features: [
      { feature: 'business_address', state: 'included' },
      { feature: 'mail_receiving', state: 'included' },
      { feature: 'mail_forwarding', state: mailForwarding },
      { feature: 'mail_scanning', state: 'included' },
      { feature: 'local_mail_pickup', state: 'included' },
    ],
  }
  return catalog
}

const offer = (
  track: RankedOffer['track'],
  planId: string,
  score: number,
  breakdown: ScoreBreakdownItem[],
): RankedOffer => ({
  providerId: 'example-office',
  planIds: [planId],
  locationId: 'miami-example',
  track,
  normalizedPrice: {
    advertisedMonthlyCents: 9900,
    firstMonthCents: 9900,
    recurringMonthlyCents: 9900,
    mandatoryUpfrontCents: 0,
    optionalAddOns: [],
    usageBasedFeatures: [],
    promotion: null,
    isComplete: true,
    explanation: 'Verified.',
  },
  features: [],
  evidenceIds: ['miami-address-mail-price'],
  score,
  breakdown,
  evidenceConfidence: 1,
  closeAlternative: false,
})

const item = (dimension: string, points: number, maxPoints: number): ScoreBreakdownItem => ({
  dimension,
  points,
  maxPoints,
  reason: 'Verified editorial input.',
})

describe('recommendation explanations', () => {
  it('returns factual structured copy for an address and mail recommendation', () => {
    const catalog = catalogForExplanation('paid_add_on')
    const result = rankOffers(catalog, 'miami', 'address-mail', {}).ranked[0]!

    expect(explainRecommendation(result, catalog)).toEqual({
      headline: 'Best verified value for address and mail',
      strengths: expect.arrayContaining(['Mail receiving is included']),
      limitation: 'Mail forwarding costs extra',
      priceSummary: '$99/month plus a $29 setup fee',
      verifiedAt: '2026-08-19T12:00:00Z',
    })
  })

  it('never describes an unconfirmed feature as unavailable', () => {
    const catalog = catalogForExplanation('not_confirmed')
    const result = rankOffers(catalog, 'miami', 'address-mail', {}).ranked[0]!
    const explanation = explainRecommendation(result, catalog)

    expect(explanation.limitation).not.toMatch(/mail forwarding is unavailable/i)
    expect(explanation.strengths.join(' ')).not.toMatch(/mail forwarding is unavailable/i)
  })

  it('uses the strongest supporting track when explaining an overall provider result', () => {
    const catalog = catalogForExplanation('included')
    catalog.plans.push({
      ...catalog.plans[0]!,
      id: 'phone-plan',
      name: 'Phone plan',
      features: [
        { feature: 'live_receptionist', state: 'included' },
        { feature: 'business_phone_number', state: 'included' },
        { feature: 'call_forwarding', state: 'included' },
        { feature: 'administrative_support', state: 'included' },
      ],
    })
    const overall: OverallProviderResult = {
      providerId: 'example-office',
      citySlug: 'miami',
      score: 90,
      breakdown: [],
      supportingOffers: {
        'address-mail': offer('address-mail', 'miami-address-mail', 88, []),
        'receptionist-phone': offer('receptionist-phone', 'phone-plan', 96, []),
      },
      evidenceConfidence: 1,
      closeAlternative: false,
    }

    expect(explainRecommendation(overall, catalog).headline).toBe(
      'Best verified match for live call answering',
    )
  })

  it('chooses included strengths and limitations from the highest and lowest scored dimensions', () => {
    const catalog = catalogForExplanation('paid_add_on')
    catalog.plans[0]!.features = [
      { feature: 'business_address', state: 'included' },
      { feature: 'mail_receiving', state: 'included' },
      { feature: 'mail_scanning', state: 'included' },
      { feature: 'local_mail_pickup', state: 'included' },
      { feature: 'mail_forwarding', state: 'paid_add_on' },
    ]
    const result = offer('address-mail', 'miami-address-mail', 80, [
      item('comparableTotalCost', 30, 30),
      item('mailManagement', 20, 25),
      item('addressAndLocalConvenience', 2, 20),
      item('contractFlexibility', 15, 15),
      item('transparencyAndEvidence', 10, 10),
    ])
    const explanation = explainRecommendation(result, catalog)

    expect(explanation.strengths).toEqual(expect.arrayContaining([
      'Mail receiving is included',
      'Mail scanning is included',
    ]))
    expect(explanation.strengths).not.toContain('Business address is included')
    expect(explanation.limitation).toBe(
      'addressAndLocalConvenience is less strong than the other verified factors',
    )
  })

  it('supplies three truthful, score-grounded strengths for a sparse but valid offer', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    const result = rankOffers(catalog, 'miami', 'address-mail', {}).ranked[0]!

    expect(explainRecommendation(result, catalog).strengths).toEqual([
      'Business address is included',
      'Mail receiving is included',
      'Verified recurring price: $99/month',
    ])
  })
})
