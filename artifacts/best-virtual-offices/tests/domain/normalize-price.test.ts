import { normalizePlanPrice } from '@/domain/pricing/normalize-price'
import type { Plan } from '@/domain/catalog/types'

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'test-plan',
  providerId: 'test-provider',
  locationIds: [],
  name: 'Test plan',
  tracks: ['address-mail'],
  basePrice: { amountCents: 9900, currency: 'USD', billingPeriod: 'month' },
  quoteRequired: false,
  mandatoryFees: [],
  deposit: null,
  promotion: null,
  includedReceptionistMinutes: null,
  minimumTermMonths: null,
  renewalTerms: null,
  cancellationTerms: null,
  features: [],
  limits: [],
  evidenceIds: [],
  ...overrides,
})

describe('normalizePlanPrice', () => {
  it('normalizes a monthly plan with upfront and recurring mandatory fees', () => {
    const monthlyPlan = plan({
      mandatoryFees: [
        { name: 'Setup', price: { amountCents: 2900, currency: 'USD', billingPeriod: 'one_time' } },
        { name: 'Mailbox', price: { amountCents: 1000, currency: 'USD', billingPeriod: 'month' } },
      ],
    })

    expect(normalizePlanPrice(monthlyPlan)).toMatchObject({
      advertisedMonthlyCents: 9900,
      firstMonthCents: 12800,
      recurringMonthlyCents: 10900,
      isComplete: true,
    })
  })

  it('converts annual prices to a monthly equivalent', () => {
    expect(normalizePlanPrice(plan({
      basePrice: { amountCents: 118800, currency: 'USD', billingPeriod: 'year' },
    }))).toMatchObject({
      advertisedMonthlyCents: 9900,
      firstMonthCents: 9900,
      recurringMonthlyCents: 9900,
      isComplete: true,
    })
  })

  it('preserves a temporary promotion separately from fixed totals', () => {
    const promotion = { description: 'First month free', endsAt: '2026-09-01' }

    expect(normalizePlanPrice(plan({ promotion }))).toMatchObject({
      promotion,
      advertisedMonthlyCents: 9900,
      recurringMonthlyCents: 9900,
    })
  })

  it('keeps usage-based charges out of the fixed monthly estimate', () => {
    expect(normalizePlanPrice(plan({
      features: [
        {
          feature: 'mail_forwarding',
          state: 'usage_based',
          price: { amountCents: 50, currency: 'USD', billingPeriod: 'usage' },
        },
      ],
    }))).toMatchObject({
      recurringMonthlyCents: 9900,
      optionalAddOns: [{ feature: 'mail_forwarding', amountCents: null }],
      usageBasedFeatures: ['mail_forwarding'],
      isComplete: true,
    })
  })

  it('marks fixed totals unavailable when a required amount needs a quote', () => {
    expect(normalizePlanPrice(plan({
      mandatoryFees: [{ name: 'Required service', quoteRequired: true }],
    }))).toMatchObject({
      advertisedMonthlyCents: 9900,
      firstMonthCents: null,
      recurringMonthlyCents: null,
      isComplete: false,
    })
  })

  it('preserves a non-comparable daily published starting price without inventing a monthly total', () => {
    expect(normalizePlanPrice(plan({
      basePrice: null,
      quoteRequired: false,
      publishedStartingPrice: {
        amountCents: 300,
        currency: 'USD',
        billingPeriod: 'day',
        qualifier: 'from',
        comparisonStatus: 'not_comparable',
      },
    }))).toMatchObject({
      advertisedMonthlyCents: null,
      recurringMonthlyCents: null,
      isComplete: false,
    })
  })

  it('does not treat a published monthly promotion as a comparable recurring price', () => {
    expect(normalizePlanPrice(plan({
      basePrice: null,
      quoteRequired: false,
      publishedPromotionalPrice: {
        amountCents: 7900,
        currency: 'USD',
        billingPeriod: 'month',
        qualifier: 'promo',
        comparisonStatus: 'not_comparable',
      },
      promotion: { description: 'Promo: $79/mo.' },
    }))).toMatchObject({
      advertisedMonthlyCents: null,
      recurringMonthlyCents: null,
      isComplete: false,
    })
  })
})
