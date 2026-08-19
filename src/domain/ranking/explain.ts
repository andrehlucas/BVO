import type { Catalog, FeatureKey, FeatureState, PlanFeature, Track } from '@/domain/catalog/types'
import type { OverallProviderResult, RankedOffer, RecommendationExplanation } from './types'

type RecommendationResult = RankedOffer | OverallProviderResult

const featureLabels: Record<FeatureKey, string> = {
  business_address: 'Business address',
  mail_receiving: 'Mail receiving',
  mail_forwarding: 'Mail forwarding',
  mail_scanning: 'Mail scanning',
  local_mail_pickup: 'Local mail pickup',
  live_receptionist: 'Live receptionist',
  business_phone_number: 'Business phone number',
  call_forwarding: 'Call forwarding',
  appointment_scheduling: 'Appointment scheduling',
  business_email: 'Business email',
  administrative_support: 'Administrative support',
  meeting_rooms: 'Meeting rooms',
  coworking_access: 'Coworking access',
  private_office_access: 'Private office access',
  guest_reception: 'Guest reception',
  registered_agent: 'Registered agent',
  company_formation_assistance: 'Company formation assistance',
}

const featuresForTrack: Record<Track, FeatureKey[]> = {
  'address-mail': ['mail_receiving', 'business_address', 'mail_forwarding', 'mail_scanning', 'local_mail_pickup'],
  'receptionist-phone': ['live_receptionist', 'business_phone_number', 'call_forwarding', 'appointment_scheduling', 'administrative_support'],
  'full-office': ['business_address', 'mail_receiving', 'live_receptionist', 'call_forwarding', 'meeting_rooms', 'coworking_access'],
}

const headlineForTrack: Record<Track, string> = {
  'address-mail': 'Best verified value for address and mail',
  'receptionist-phone': 'Best verified match for live call answering',
  'full-office': 'Best verified value for a full virtual office',
}

const formatDollars = (amountCents: number): string => {
  const dollars = amountCents / 100
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`
}

const isOverallResult = (result: RecommendationResult): result is OverallProviderResult =>
  'supportingOffers' in result

const primaryOffer = (result: RecommendationResult): RankedOffer | null => {
  if (!isOverallResult(result)) return result
  return result.supportingOffers['address-mail']
    ?? result.supportingOffers['full-office']
    ?? result.supportingOffers['receptionist-phone']
    ?? null
}

const featureState = (features: PlanFeature[], feature: FeatureKey): FeatureState | undefined =>
  features.find((item) => item.feature === feature)?.state

const limitationFor = (features: PlanFeature[], track: Track, offer: RankedOffer): string => {
  for (const key of featuresForTrack[track]) {
    const state = featureState(features, key)
    if (state === 'paid_add_on' || state === 'usage_based') return `${featureLabels[key]} costs extra`
    if (state === 'not_available') return `${featureLabels[key]} is unavailable`
    if (state === 'not_confirmed') return `${featureLabels[key]} is not confirmed`
  }

  const weakest = offer.breakdown
    .filter((item) => item.points < item.maxPoints)
    .sort((first, second) => first.points / first.maxPoints - second.points / second.maxPoints)[0]
  return weakest
    ? `${weakest.dimension} is less strong than the other verified factors`
    : 'No material verified limitation identified'
}

const verifiedAtFor = (offer: RankedOffer, catalog: Catalog): string => {
  const planIds = new Set(offer.planIds)
  const dates = [
    catalog.providers.find((provider) => provider.id === offer.providerId)?.lastReviewedAt,
    ...catalog.evidence
      .filter((evidence) => offer.evidenceIds.includes(evidence.id) || planIds.has(evidence.entityId) || evidence.entityId === offer.locationId)
      .map((evidence) => evidence.capturedAt),
  ].filter((value): value is string => value !== undefined)
  return dates.sort().at(-1) ?? ''
}

export function explainRecommendation(
  result: RecommendationResult,
  catalog: Catalog,
): RecommendationExplanation {
  const offer = primaryOffer(result)
  if (!offer) {
    return {
      headline: 'No verified recommendation is available',
      strengths: [],
      limitation: 'No complete verified offer supports this recommendation',
      priceSummary: 'Verified comparable price is unavailable',
      verifiedAt: '',
    }
  }

  const plans = offer.planIds
    .map((id) => catalog.plans.find((plan) => plan.id === id))
    .filter((plan): plan is NonNullable<typeof plan> => plan !== undefined)
  const features = plans.flatMap((plan) => plan.features)
  const strengths = featuresForTrack[offer.track]
    .filter((key) => featureState(features, key) === 'included')
    .slice(0, 3)
    .map((key) => `${featureLabels[key]} is included`)
  const monthlyPrice = offer.normalizedPrice.recurringMonthlyCents
  const upfront = offer.normalizedPrice.mandatoryUpfrontCents

  return {
    headline: headlineForTrack[offer.track],
    strengths,
    limitation: limitationFor(features, offer.track, offer),
    priceSummary: monthlyPrice === null
      ? 'Verified comparable price is unavailable'
      : upfront > 0
        ? `${formatDollars(monthlyPrice)}/month plus a ${formatDollars(upfront)} setup fee`
        : `${formatDollars(monthlyPrice)}/month`,
    verifiedAt: verifiedAtFor(offer, catalog),
  }
}
