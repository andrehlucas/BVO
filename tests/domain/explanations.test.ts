import type { Catalog, Plan } from '@/domain/catalog/types'
import { explainRecommendation } from '@/domain/ranking/explain'
import { rankOffers } from '@/domain/ranking/rank'
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
})
