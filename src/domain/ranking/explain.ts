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

const featureDimensions: Record<Track, Partial<Record<FeatureKey, string>>> = {
  'address-mail': {
    business_address: 'addressAndLocalConvenience',
    mail_receiving: 'mailManagement',
    mail_forwarding: 'mailManagement',
    mail_scanning: 'mailManagement',
    local_mail_pickup: 'mailManagement',
  },
  'receptionist-phone': {
    live_receptionist: 'humanAnsweringScope',
    administrative_support: 'humanAnsweringScope',
    business_phone_number: 'phoneFeaturesAndForwarding',
    call_forwarding: 'phoneFeaturesAndForwarding',
    appointment_scheduling: 'phoneFeaturesAndForwarding',
  },
  'full-office': {
    business_address: 'addressAndMail',
    mail_receiving: 'addressAndMail',
    mail_forwarding: 'addressAndMail',
    live_receptionist: 'phoneAndLiveReceptionist',
    business_phone_number: 'phoneAndLiveReceptionist',
    call_forwarding: 'phoneAndLiveReceptionist',
    meeting_rooms: 'workspaceAndLocalPresence',
    coworking_access: 'workspaceAndLocalPresence',
    private_office_access: 'workspaceAndLocalPresence',
    guest_reception: 'workspaceAndLocalPresence',
  },
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
  return (Object.values(result.supportingOffers) as RankedOffer[])
    .sort((first, second) =>
      second.score - first.score
      || second.evidenceConfidence - first.evidenceConfidence
      || first.track.localeCompare(second.track))[0]
    ?? null
}

const featureState = (features: PlanFeature[], feature: FeatureKey): FeatureState | undefined =>
  features.find((item) => item.feature === feature)?.state

const dimensionRatio = (points: number, maxPoints: number): number => points / maxPoints

const limitationFor = (features: PlanFeature[], track: Track, offer: RankedOffer): string => {
  const weakest = offer.breakdown
    .filter((item) => item.points < item.maxPoints)
    .sort((first, second) => dimensionRatio(first.points, first.maxPoints) - dimensionRatio(second.points, second.maxPoints))[0]
  const featureForWeakestDimension = weakest
    ? featuresForTrack[track]
      .filter((key) => featureDimensions[track][key] === weakest.dimension)
      .map((key) => ({ key, state: featureState(features, key) }))
      .filter(({ state }) => state === 'paid_add_on' || state === 'usage_based' || state === 'not_available' || state === 'not_confirmed')
      .sort((first, second) => featureLabels[first.key].localeCompare(featureLabels[second.key]))[0]
    : undefined

  if (featureForWeakestDimension?.state === 'paid_add_on' || featureForWeakestDimension?.state === 'usage_based') {
    return `${featureLabels[featureForWeakestDimension.key]} costs extra`
  }
  if (featureForWeakestDimension?.state === 'not_available') {
    return `${featureLabels[featureForWeakestDimension.key]} is unavailable`
  }
  if (featureForWeakestDimension?.state === 'not_confirmed') {
    return `${featureLabels[featureForWeakestDimension.key]} is not confirmed`
  }
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
  const dimensionByName = new Map(offer.breakdown.map((item) => [item.dimension, item]))
  const strengths = featuresForTrack[offer.track]
    .map((key) => ({ key, state: featureState(features, key), dimension: featureDimensions[offer.track][key] }))
    .filter((feature): feature is { key: FeatureKey; state: 'included'; dimension: string } =>
      feature.state === 'included' && feature.dimension !== undefined && dimensionByName.has(feature.dimension),
    )
    .sort((first, second) => {
      const firstDimension = dimensionByName.get(first.dimension)!
      const secondDimension = dimensionByName.get(second.dimension)!
      return dimensionRatio(secondDimension.points, secondDimension.maxPoints) - dimensionRatio(firstDimension.points, firstDimension.maxPoints)
        || secondDimension.points - firstDimension.points
        || featureLabels[first.key].localeCompare(featureLabels[second.key])
    })
    .slice(0, 3)
    .map(({ key }) => `${featureLabels[key]} is included`)
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
