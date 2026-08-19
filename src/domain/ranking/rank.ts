import type { Catalog, Track } from '@/domain/catalog/types'
import { buildOfferCandidates } from './build-candidates'
import { scoreTrackOffer, type RankingPreferences } from './score-track'
import type { RankedOffer, RankingResult } from './types'

const compareOffers = (first: RankedOffer, second: RankedOffer): number =>
  second.score - first.score
  || second.evidenceConfidence - first.evidenceConfidence
  || first.normalizedPrice.recurringMonthlyCents! - second.normalizedPrice.recurringMonthlyCents!
  || first.providerId.localeCompare(second.providerId)

export function rankOffers(
  catalog: Catalog,
  citySlug: string,
  track: Track,
  preferences: RankingPreferences,
): RankingResult {
  const candidates = buildOfferCandidates(catalog, citySlug, track)
  const context = { catalog, candidates }
  const ranked: RankedOffer[] = []
  const unranked: RankingResult['unranked'] = []

  for (const candidate of candidates) {
    const offer = scoreTrackOffer(candidate, context, preferences)
    if (offer) ranked.push(offer)
    else unranked.push({ candidate, reason: 'insufficient_verified_data' })
  }

  ranked.sort(compareOffers)
  const leaderScore = ranked[0]?.score
  if (leaderScore !== undefined) {
    for (const offer of ranked) offer.closeAlternative = leaderScore - offer.score <= 2
  }

  return { ranked, unranked }
}
