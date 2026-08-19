import methodology from '@/../content/methodology/ranking-v1.json'
import type { Catalog, Evidence, Location, Track } from '@/domain/catalog/types'
import { rankOffers } from './rank'
import type { OverallProviderResult, RankedOffer, ScoreBreakdownItem } from './types'

const tracks: Track[] = ['address-mail', 'receptionist-phone', 'full-office']
const confidenceValues = { high: 1, medium: 2 / 3, low: 1 / 3 } as const

const round = (value: number): number => Math.round(value)

const evidenceConfidence = (evidenceIds: string[], evidenceById: Map<string, Evidence>): number | null => {
  const evidence = evidenceIds.map((id) => evidenceById.get(id))
  if (evidence.length === 0 || evidence.some((item) => item === undefined)) return null

  return evidence.reduce((total, item) => total + confidenceValues[item!.confidence], 0) / evidence.length
}

const verifiedCityLocations = (
  catalog: Catalog,
  providerId: string,
  citySlug: string,
  evidenceById: Map<string, Evidence>,
): Location[] => catalog.locations.filter((location) =>
  location.providerId === providerId
  && location.citySlug === citySlug
  && location.availability === 'available'
  && evidenceConfidence(location.evidenceIds, evidenceById) !== null,
)

const bestTrackOffers = (catalog: Catalog, citySlug: string, providerId: string): Partial<Record<Track, RankedOffer>> =>
  Object.fromEntries(tracks.flatMap((track) => {
    const offer = rankOffers(catalog, citySlug, track, {}).ranked.find((candidate) => candidate.providerId === providerId)
    return offer ? [[track, offer]] : []
  })) as Partial<Record<Track, RankedOffer>>

const providerFlexibility = (offers: Partial<Record<Track, RankedOffer>>, catalog: Catalog): number | null => {
  const terms = Object.values(offers).flatMap((offer) => offer!.planIds.map((planId) =>
    catalog.plans.find((plan) => plan.id === planId)?.minimumTermMonths,
  ))
  return terms.length > 0 && terms.every((term): term is number => term !== null && term !== undefined)
    ? Math.min(...terms)
    : null
}

const pointsByRange = (value: number, values: number[], maxPoints: number, higherIsBetter = true): number => {
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  if (minimum === maximum) return maxPoints
  return round(maxPoints * (higherIsBetter
    ? (value - minimum) / (maximum - minimum)
    : (maximum - value) / (maximum - minimum)))
}

interface ProviderInputs {
  providerId: string
  locations: Location[]
  offers: Partial<Record<Track, RankedOffer>>
  flexibility: number
  transparency: number
}

const collectProviderInputs = (catalog: Catalog, citySlug: string): ProviderInputs[] => {
  const evidenceById = new Map(catalog.evidence.map((evidence) => [evidence.id, evidence]))

  return catalog.providers.flatMap((provider) => {
    const providerConfidence = evidenceConfidence(provider.evidenceIds, evidenceById)
    const locations = verifiedCityLocations(catalog, provider.id, citySlug, evidenceById)
    const offers = bestTrackOffers(catalog, citySlug, provider.id)
    const flexibility = providerFlexibility(offers, catalog)
    const offerEvidence = Object.values(offers).flatMap((offer) => offer!.evidenceIds)
    const locationEvidence = locations.flatMap((location) => location.evidenceIds)
    const transparency = evidenceConfidence(
      [...new Set([...provider.evidenceIds, ...locationEvidence, ...offerEvidence])],
      evidenceById,
    )

    if (
      providerConfidence === null
      || locations.length === 0
      || Object.keys(offers).length === 0
      || flexibility === null
      || transparency === null
    ) return []

    return [{ providerId: provider.id, locations, offers, flexibility, transparency }]
  })
}

export function rankOverallProviders(catalog: Catalog, citySlug: string): OverallProviderResult[] {
  const inputs = collectProviderInputs(catalog, citySlug)
  const weights = methodology.overallProviderRating
  const flexibilityValues = inputs.map((input) => input.flexibility)
  const locationCounts = inputs.map((input) => input.locations.length)
  const transparencyValues = inputs.map((input) => input.transparency)

  const results = inputs.map((input): OverallProviderResult => {
    const rankedOffers = Object.values(input.offers) as RankedOffer[]
    const productLineScore = rankedOffers.reduce((total, offer) => total + offer.score, 0) / tracks.length
    const coverage = rankedOffers.length / tracks.length
    const breakdown: ScoreBreakdownItem[] = [
      {
        dimension: 'productLineValue',
        points: round(weights.productLineValue * productLineScore / 100),
        maxPoints: weights.productLineValue,
        reason: 'Uses the average verified score of this provider’s city-eligible offers across the three needs.',
      },
      {
        dimension: 'coverageAcrossNeeds',
        points: round(weights.coverageAcrossNeeds * coverage),
        maxPoints: weights.coverageAcrossNeeds,
        reason: `${rankedOffers.length} of the 3 editorial needs have a fully verified eligible offer in this city.`,
      },
      {
        dimension: 'flexibility',
        points: pointsByRange(input.flexibility, flexibilityValues, weights.flexibility, false),
        maxPoints: weights.flexibility,
        reason: `The shortest verified minimum term among the supporting offers is ${input.flexibility} month(s).`,
      },
      {
        dimension: 'localPresenceAndOptions',
        points: pointsByRange(input.locations.length, locationCounts, weights.localPresenceAndOptions),
        maxPoints: weights.localPresenceAndOptions,
        reason: `${input.locations.length} verified available location(s) are in ${citySlug}.`,
      },
      {
        dimension: 'transparencyAndVerifiability',
        points: round(weights.transparencyAndVerifiability * pointsByRange(input.transparency, transparencyValues, 100) / 100),
        maxPoints: weights.transparencyAndVerifiability,
        reason: `Provider, city-location, and supporting-offer evidence averages ${round(input.transparency * 100)}% confidence.`,
      },
    ]

    return {
      providerId: input.providerId,
      citySlug,
      score: breakdown.reduce((total, item) => total + item.points, 0),
      breakdown,
      supportingOffers: input.offers,
      evidenceConfidence: input.transparency,
      closeAlternative: false,
    }
  })

  results.sort((first, second) =>
    second.score - first.score
    || second.evidenceConfidence - first.evidenceConfidence
    || first.providerId.localeCompare(second.providerId))
  const leaderScore = results[0]?.score
  if (leaderScore !== undefined) {
    for (const result of results) result.closeAlternative = leaderScore - result.score <= 2
  }
  return results
}
