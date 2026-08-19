import methodology from '@/../content/methodology/ranking-v1.json'
import type { Catalog, FeatureKey, FeatureState } from '@/domain/catalog/types'
import type { OfferCandidate, RankedOffer, ScoreBreakdownItem } from './types'

export interface RankingPreferences {
  needsMailForwarding?: boolean
  needsMailScanning?: boolean
  needsLocalMailPickup?: boolean
  needsCallForwarding?: boolean
  needsAppointmentScheduling?: boolean
  needsMeetingRooms?: boolean
  needsCoworkingAccess?: boolean
  needsPrivateOfficeAccess?: boolean
  needsGuestReception?: boolean
  prefersMonthToMonth?: boolean
}

export interface TrackScoringContext {
  catalog: Catalog
  candidates: OfferCandidate[]
}

type Weights = Record<string, number>

const confidenceValues = { high: 1, medium: 2 / 3, low: 1 / 3 } as const

const featureState = (candidate: OfferCandidate, key: FeatureKey): FeatureState | undefined =>
  candidate.features.find((feature) => feature.feature === key)?.state

const wholePoints = (value: number): number => Math.round(value)

const scoreFeatures = (
  candidate: OfferCandidate,
  dimension: string,
  maxPoints: number,
  features: FeatureKey[],
): ScoreBreakdownItem => {
  const states = features.map((feature) => featureState(candidate, feature))
  const points = wholePoints(maxPoints * states.reduce((total, state) => {
    if (state === 'included') return total + 1
    if (state === 'paid_add_on') return total + 0.5
    return total
  }, 0) / features.length)
  const notConfirmed = features.filter((feature) => featureState(candidate, feature) === 'not_confirmed')

  let reason: string
  if (points === maxPoints) {
    reason = `Included: ${features.join(', ')}.`
  } else if (notConfirmed.length > 0) {
    reason = `Feature status not confirmed: ${notConfirmed.join(', ')}.`
  } else if (states.some((state) => state === 'paid_add_on')) {
    reason = `Some features are paid add-ons: ${features.filter((feature) => featureState(candidate, feature) === 'paid_add_on').join(', ')}.`
  } else if (states.some((state) => state === 'not_available')) {
    reason = `Not available: ${features.filter((feature) => featureState(candidate, feature) === 'not_available').join(', ')}.`
  } else {
    reason = `No verified included feature for ${features.join(', ')}.`
  }

  return { dimension, points, maxPoints, reason }
}

const numericScore = (
  candidate: OfferCandidate,
  candidates: OfferCandidate[],
  dimension: string,
  maxPoints: number,
): ScoreBreakdownItem => {
  const price = candidate.normalizedPrice.recurringMonthlyCents
  const prices = candidates
    .map((value) => value.normalizedPrice.recurringMonthlyCents)
    .filter((value): value is number => value !== null)
  const cheapest = Math.min(...prices)
  const highest = Math.max(...prices)
  const points = cheapest === highest
    ? maxPoints
    : wholePoints(maxPoints * (highest - price!) / (highest - cheapest))

  return {
    dimension,
    points,
    maxPoints,
    reason: cheapest === highest
      ? `All eligible offers have the same verified recurring cost of ${price} cents per month.`
      : `Verified recurring cost is ${price} cents per month; lower costs receive more points.`,
  }
}

const evidenceConfidence = (candidate: OfferCandidate, catalog: Catalog): number => {
  const evidenceById = new Map(catalog.evidence.map((evidence) => [evidence.id, evidence]))
  const values = candidate.evidenceIds
    .map((id) => evidenceById.get(id))
    .filter((evidence): evidence is NonNullable<typeof evidence> => evidence !== undefined)
    .map((evidence) => confidenceValues[evidence.confidence])
  return values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length
}

const transparencyScore = (
  candidate: OfferCandidate,
  catalog: Catalog,
  dimension: string,
  maxPoints: number,
): ScoreBreakdownItem => {
  const confidence = evidenceConfidence(candidate, catalog)
  return {
    dimension,
    points: wholePoints(maxPoints * confidence),
    maxPoints,
    reason: confidence === 0
      ? 'No linked verified evidence is available for this offer.'
      : `Linked evidence has an average confidence of ${wholePoints(confidence * 100)}%.`,
  }
}

const contractScore = (
  candidate: OfferCandidate,
  context: TrackScoringContext,
  preferences: RankingPreferences,
  dimension: string,
  maxPoints: number,
): ScoreBreakdownItem => {
  const plans = candidate.planIds.map((id) => context.catalog.plans.find((plan) => plan.id === id))
  const terms = plans.map((plan) => plan?.minimumTermMonths)
  if (terms.some((term) => term === null || term === undefined)) {
    return { dimension, points: 0, maxPoints, reason: 'Minimum contract term is not confirmed.' }
  }
  const term = Math.max(...(terms as number[]))
  const comparableTerms = context.candidates
    .map((value) => value.planIds.map((id) => context.catalog.plans.find((plan) => plan.id === id)?.minimumTermMonths))
    .filter((value): value is number[] => value.every((term): term is number => term !== null && term !== undefined))
    .map((value) => Math.max(...value))
  const shortest = Math.min(...comparableTerms)
  const longest = Math.max(...comparableTerms)
  const points = preferences.prefersMonthToMonth
    ? (term <= 1 ? maxPoints : 0)
    : shortest === longest
    ? maxPoints
    : wholePoints(maxPoints * (longest - term) / (longest - shortest))
  return {
    dimension,
    points,
    maxPoints,
    reason: preferences.prefersMonthToMonth
      ? term <= 1
        ? 'Verified month-to-month terms satisfy the selected flexibility preference.'
        : `Verified minimum contract term is ${term} month(s), which does not satisfy the selected month-to-month preference.`
      : shortest === longest
      ? `All eligible offers have the same verified minimum term of ${term} month(s).`
      : `Verified minimum contract term is ${term} month(s); shorter terms receive more points.`,
  }
}

const localPresenceScore = (
  candidate: OfferCandidate,
  context: TrackScoringContext,
  dimension: string,
  maxPoints: number,
  workspaceFeatures: FeatureKey[] = [],
): ScoreBreakdownItem => {
  const location = candidate.locationId
    ? context.catalog.locations.find((value) => value.id === candidate.locationId)
    : undefined
  if (!location || location.availability === 'not_confirmed') {
    return { dimension, points: 0, maxPoints, reason: 'Local availability is not confirmed.' }
  }
  if (location.availability === 'unavailable') {
    return { dimension, points: 0, maxPoints, reason: 'The local location is unavailable.' }
  }
  if (workspaceFeatures.length === 0) {
    return { dimension, points: maxPoints, maxPoints, reason: 'A verified local location is available.' }
  }
  const workspace = scoreFeatures(candidate, dimension, maxPoints, workspaceFeatures)
  const physicalCount = workspaceFeatures.filter((feature) => location.physicalFeatures.includes(feature)).length
  const featurePoints = wholePoints(maxPoints * physicalCount / workspaceFeatures.length)
  return {
    ...workspace,
    points: Math.max(workspace.points, featurePoints),
    reason: physicalCount > 0
      ? `Verified local location and workspace features: ${workspaceFeatures.filter((feature) => location.physicalFeatures.includes(feature)).join(', ')}.`
      : workspace.reason,
  }
}

const scoreAddressMail = (
  candidate: OfferCandidate,
  context: TrackScoringContext,
  preferences: RankingPreferences,
  weights: Weights,
): ScoreBreakdownItem[] => [
  numericScore(candidate, context.candidates, 'comparableTotalCost', weights.comparableTotalCost!),
  scoreFeatures(candidate, 'mailManagement', weights.mailManagement!, [
    ...(preferences.needsMailForwarding ? ['mail_forwarding' as const] : []),
    ...(preferences.needsMailScanning ? ['mail_scanning' as const] : []),
    ...(preferences.needsLocalMailPickup ? ['local_mail_pickup' as const] : []),
  ].length > 0 ? [
    ...(preferences.needsMailForwarding ? ['mail_forwarding' as const] : []),
    ...(preferences.needsMailScanning ? ['mail_scanning' as const] : []),
    ...(preferences.needsLocalMailPickup ? ['local_mail_pickup' as const] : []),
  ] : ['mail_forwarding', 'mail_scanning', 'local_mail_pickup']),
  localPresenceScore(candidate, context, 'addressAndLocalConvenience', weights.addressAndLocalConvenience!),
  contractScore(candidate, context, preferences, 'contractFlexibility', weights.contractFlexibility!),
  transparencyScore(candidate, context.catalog, 'transparencyAndEvidence', weights.transparencyAndEvidence!),
]

const scoreReceptionistPhone = (
  candidate: OfferCandidate,
  context: TrackScoringContext,
  preferences: RankingPreferences,
  weights: Weights,
): ScoreBreakdownItem[] => [
  numericScore(candidate, context.candidates, 'totalCostAndMinuteAllowance', weights.totalCostAndMinuteAllowance!),
  scoreFeatures(candidate, 'humanAnsweringScope', weights.humanAnsweringScope!, ['live_receptionist', 'administrative_support']),
  scoreFeatures(candidate, 'phoneFeaturesAndForwarding', weights.phoneFeaturesAndForwarding!, [
    ...(preferences.needsCallForwarding ? ['call_forwarding' as const] : []),
    ...(preferences.needsAppointmentScheduling ? ['appointment_scheduling' as const] : []),
  ].length > 0 ? [
    ...(preferences.needsCallForwarding ? ['call_forwarding' as const] : []),
    ...(preferences.needsAppointmentScheduling ? ['appointment_scheduling' as const] : []),
  ] : ['business_phone_number', 'call_forwarding']),
  contractScore(candidate, context, preferences, 'contractFlexibility', weights.contractFlexibility!),
  transparencyScore(candidate, context.catalog, 'transparencyAndEvidence', weights.transparencyAndEvidence!),
]

const scoreFullOffice = (
  candidate: OfferCandidate,
  context: TrackScoringContext,
  preferences: RankingPreferences,
  weights: Weights,
): ScoreBreakdownItem[] => [
  numericScore(candidate, context.candidates, 'totalPackageCost', weights.totalPackageCost!),
  scoreFeatures(candidate, 'addressAndMail', weights.addressAndMail!, ['business_address', 'mail_receiving', 'mail_forwarding']),
  scoreFeatures(candidate, 'phoneAndLiveReceptionist', weights.phoneAndLiveReceptionist!, ['live_receptionist', 'business_phone_number', 'call_forwarding']),
  contractScore(candidate, context, preferences, 'contractFlexibility', weights.contractFlexibility!),
  localPresenceScore(candidate, context, 'workspaceAndLocalPresence', weights.workspaceAndLocalPresence!, [
    ...(preferences.needsMeetingRooms ? ['meeting_rooms' as const] : []),
    ...(preferences.needsCoworkingAccess ? ['coworking_access' as const] : []),
    ...(preferences.needsPrivateOfficeAccess ? ['private_office_access' as const] : []),
    ...(preferences.needsGuestReception ? ['guest_reception' as const] : []),
  ].length > 0 ? [
    ...(preferences.needsMeetingRooms ? ['meeting_rooms' as const] : []),
    ...(preferences.needsCoworkingAccess ? ['coworking_access' as const] : []),
    ...(preferences.needsPrivateOfficeAccess ? ['private_office_access' as const] : []),
    ...(preferences.needsGuestReception ? ['guest_reception' as const] : []),
  ] : ['meeting_rooms', 'coworking_access', 'private_office_access', 'guest_reception']),
  transparencyScore(candidate, context.catalog, 'transparencyAndEvidence', weights.transparencyAndEvidence!),
]

export function scoreTrackOffer(
  candidate: OfferCandidate,
  context: TrackScoringContext,
  preferences: RankingPreferences,
): RankedOffer | null {
  if (!candidate.normalizedPrice.isComplete || candidate.normalizedPrice.recurringMonthlyCents === null) {
    return null
  }

  const weights = methodology.tracks[candidate.track] as Weights
  const breakdown = candidate.track === 'address-mail'
    ? scoreAddressMail(candidate, context, preferences, weights)
    : candidate.track === 'receptionist-phone'
      ? scoreReceptionistPhone(candidate, context, preferences, weights)
      : scoreFullOffice(candidate, context, preferences, weights)

  return {
    ...candidate,
    score: breakdown.reduce((total, item) => total + item.points, 0),
    breakdown,
    evidenceConfidence: evidenceConfidence(candidate, context.catalog),
    closeAlternative: false,
  }
}
