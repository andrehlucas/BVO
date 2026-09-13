import type { Catalog, Plan, PlanFeature, Track } from '@/domain/catalog/types'
import { normalizePlanPrice } from '@/domain/pricing/normalize-price'
import type { NormalizedPrice } from '@/domain/pricing/types'
import { getPlanEligibility } from './eligibility'
import type { OfferCandidate } from './types'

const sumKnown = (values: Array<number | null>): number | null =>
  values.every((value): value is number => value !== null)
    ? values.reduce((total, value) => total + value, 0)
    : null

const combineNormalizedPrices = (plans: Plan[]): NormalizedPrice => {
  if (plans.length === 1) return normalizePlanPrice(plans[0]!)

  const prices = plans.map(normalizePlanPrice)
  const isComplete = prices.every((price) => price.isComplete)

  return {
    advertisedMonthlyCents: sumKnown(prices.map((price) => price.advertisedMonthlyCents)),
    firstMonthCents: isComplete ? sumKnown(prices.map((price) => price.firstMonthCents)) : null,
    recurringMonthlyCents: isComplete ? sumKnown(prices.map((price) => price.recurringMonthlyCents)) : null,
    mandatoryUpfrontCents: prices.reduce((total, price) => total + price.mandatoryUpfrontCents, 0),
    optionalAddOns: prices.flatMap((price) => price.optionalAddOns),
    usageBasedFeatures: [...new Set(prices.flatMap((price) => price.usageBasedFeatures))].sort(),
    promotion: null,
    isComplete,
    explanation: isComplete
      ? 'Combined plan prices include each plan’s required recurring fees; promotions and usage-based charges are separate.'
      : 'At least one plan has a required price that is unavailable, quote-only, or usage-based, so fixed combined totals cannot be calculated.',
  }
}

const isMutuallyCombinable = (first: Plan, second: Plan): boolean =>
  first.providerId === second.providerId
  && first.canCombineWith?.includes(second.id) === true
  && second.canCombineWith?.includes(first.id) === true

const localLocationIds = (catalog: Catalog, plan: Plan, citySlug: string): string[] => {
  const locationsById = new Map(catalog.locations.map((location) => [location.id, location]))

  return plan.locationIds.filter((locationId) => {
    const location = locationsById.get(locationId)
    return location?.providerId === plan.providerId && location.citySlug === citySlug
  })
}

const candidateFromPlans = (
  plans: Plan[],
  locationId: string | null,
  track: Track,
): OfferCandidate => ({
  providerId: plans[0]!.providerId,
  planIds: plans.map((plan) => plan.id).sort(),
  locationId,
  track,
  normalizedPrice: combineNormalizedPrices(plans),
  features: plans.flatMap((plan) => plan.features) as PlanFeature[],
  evidenceIds: [...new Set(plans.flatMap((plan) => plan.evidenceIds))].sort(),
})

const candidateKey = (candidate: OfferCandidate): string =>
  [candidate.providerId, candidate.locationId ?? 'national', candidate.planIds.join(',')].join(':')

const sortCandidates = (first: OfferCandidate, second: OfferCandidate): number => {
  const firstKey = candidateKey(first)
  const secondKey = candidateKey(second)
  return firstKey.localeCompare(secondKey)
}

export function buildOfferCandidates(
  catalog: Catalog,
  citySlug: string,
  track: Track,
): OfferCandidate[] {
  const candidates = new Map<string, OfferCandidate>()
  const addCandidate = (candidate: OfferCandidate) => {
    candidates.set(candidateKey(candidate), candidate)
  }

  for (const plan of catalog.plans) {
    if (!getPlanEligibility(plan, track).eligible) continue

    if (track === 'receptionist-phone') {
      addCandidate(candidateFromPlans([plan], null, track))
      continue
    }

    for (const locationId of localLocationIds(catalog, plan, citySlug)) {
      addCandidate(candidateFromPlans([plan], locationId, track))
    }
  }

  if (track !== 'full-office') {
    return [...candidates.values()].sort(sortCandidates)
  }

  for (let firstIndex = 0; firstIndex < catalog.plans.length; firstIndex += 1) {
    const first = catalog.plans[firstIndex]!
    for (let secondIndex = firstIndex + 1; secondIndex < catalog.plans.length; secondIndex += 1) {
      const second = catalog.plans[secondIndex]!
      if (!isMutuallyCombinable(first, second)) continue

      const plans = [first, second]
      const addressPlan = plans.find((plan) => getPlanEligibility(plan, 'address-mail').eligible)
      const receptionistPlan = plans.find((plan) =>
        getPlanEligibility(plan, 'receptionist-phone').eligible,
      )
      if (!addressPlan || !receptionistPlan) continue

      for (const locationId of localLocationIds(catalog, addressPlan, citySlug)) {
        addCandidate(candidateFromPlans(plans, locationId, track))
      }
    }
  }

  return [...candidates.values()].sort(sortCandidates)
}
