import type { Catalog, Location, Plan, PlanFeature } from '@/domain/catalog/types'
import { buildOfferCandidates } from '@/domain/ranking/build-candidates'
import { getPlanEligibility } from '@/domain/ranking/eligibility'
import { validCatalogFixture } from '../fixtures/catalog'

type CombinablePlan = Plan & { canCombineWith?: string[] }

const included = (feature: PlanFeature['feature']): PlanFeature => ({ feature, state: 'included' })

const plan = (overrides: Partial<CombinablePlan> = {}): CombinablePlan => ({
  id: 'test-plan',
  providerId: 'example-office',
  locationIds: ['miami-example'],
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
  evidenceIds: ['miami-address-mail-price'],
  ...overrides,
})

const catalog = (
  plans: CombinablePlan[],
  locations: Location[] = structuredClone(validCatalogFixture.locations) as Location[],
): Catalog => ({
  ...(structuredClone(validCatalogFixture) as Catalog),
  locations,
  plans,
})

describe('getPlanEligibility', () => {
  it('requires included business address and mail receiving for address and mail', () => {
    expect(
      getPlanEligibility(
        plan({ features: [included('business_address'), included('mail_receiving')] }),
        'address-mail',
      ),
    ).toEqual({ eligible: true, reasons: [] })

    expect(
      getPlanEligibility(
        plan({
          features: [
            included('business_address'),
            {
              feature: 'mail_receiving',
              state: 'paid_add_on',
              price: { amountCents: 1000, currency: 'USD', billingPeriod: 'month' },
            },
          ],
        }),
        'address-mail',
      ),
    ).toEqual({
      eligible: false,
      reasons: ['Mail receiving is not included.'],
    })
  })

  it('requires an included live receptionist and included phone or forwarding', () => {
    expect(
      getPlanEligibility(
        plan({ features: [included('live_receptionist'), included('call_forwarding')] }),
        'receptionist-phone',
      ),
    ).toEqual({ eligible: true, reasons: [] })

    expect(
      getPlanEligibility(plan({ features: [included('live_receptionist')] }), 'receptionist-phone'),
    ).toEqual({
      eligible: false,
      reasons: ['Business phone number or call forwarding is not included.'],
    })
  })
})

describe('buildOfferCandidates', () => {
  it('uses a single plan that includes every full-office requirement', () => {
    const fullPlan = plan({
      id: 'full-office',
      tracks: ['full-office'],
      features: [
        included('business_address'),
        included('mail_receiving'),
        included('live_receptionist'),
        included('business_phone_number'),
      ],
    })

    expect(buildOfferCandidates(catalog([fullPlan]), 'miami', 'full-office')).toMatchObject([
      {
        providerId: 'example-office',
        planIds: ['full-office'],
        locationId: 'miami-example',
        track: 'full-office',
      },
    ])
  })

  it('only combines mutually compatible plans from the same provider', () => {
    const addressPlan = plan({
      id: 'address',
      features: [included('business_address'), included('mail_receiving')],
      canCombineWith: ['phone'],
    })
    const phonePlan = plan({
      id: 'phone',
      locationIds: ['miami-example'],
      tracks: ['receptionist-phone'],
      features: [included('live_receptionist'), included('business_phone_number')],
      canCombineWith: ['address'],
    })
    const oneSidedPlan = plan({
      id: 'one-sided-phone',
      locationIds: ['miami-example'],
      tracks: ['receptionist-phone'],
      features: [included('live_receptionist'), included('call_forwarding')],
    })

    expect(buildOfferCandidates(catalog([phonePlan, addressPlan, oneSidedPlan]), 'miami', 'full-office'))
      .toMatchObject([
        { planIds: ['address', 'phone'], locationId: 'miami-example' },
      ])
  })

  it('excludes out-of-city address plans while allowing a national phone plan to combine', () => {
    const localAddress = plan({
      id: 'miami-address',
      features: [included('business_address'), included('mail_receiving')],
      canCombineWith: ['national-phone'],
    })
    const nationalPhone = plan({
      id: 'national-phone',
      locationIds: ['orlando-example'],
      tracks: ['receptionist-phone'],
      features: [included('live_receptionist'), included('call_forwarding')],
      canCombineWith: ['miami-address'],
    })
    const orlandoAddress = plan({
      id: 'orlando-address',
      locationIds: ['orlando-example'],
      features: [included('business_address'), included('mail_receiving')],
    })
    const locations: Location[] = [
      ...(structuredClone(validCatalogFixture.locations) as Location[]),
      {
        ...(structuredClone(validCatalogFixture.locations[0]) as Location),
        id: 'orlando-example',
        city: 'Orlando',
        citySlug: 'orlando',
      },
    ]

    expect(buildOfferCandidates(catalog([localAddress, nationalPhone, orlandoAddress], locations), 'miami', 'address-mail'))
      .toMatchObject([{ planIds: ['miami-address'], locationId: 'miami-example' }])
    expect(buildOfferCandidates(catalog([localAddress, nationalPhone, orlandoAddress], locations), 'miami', 'full-office'))
      .toMatchObject([{ planIds: ['miami-address', 'national-phone'], locationId: 'miami-example' }])
  })

  it('deduplicates compositions and returns plan IDs in deterministic order', () => {
    const addressPlan = plan({
      id: 'z-address',
      features: [included('business_address'), included('mail_receiving')],
      canCombineWith: ['a-phone'],
    })
    const phonePlan = plan({
      id: 'a-phone',
      tracks: ['receptionist-phone'],
      features: [included('live_receptionist'), included('business_phone_number')],
      canCombineWith: ['z-address'],
    })

    expect(buildOfferCandidates(catalog([addressPlan, phonePlan]), 'miami', 'full-office')).toHaveLength(1)
    expect(buildOfferCandidates(catalog([addressPlan, phonePlan]), 'miami', 'full-office')[0]?.planIds)
      .toEqual(['a-phone', 'z-address'])
  })
})
