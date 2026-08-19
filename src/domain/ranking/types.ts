import type { PlanFeature, Track } from '@/domain/catalog/types'
import type { NormalizedPrice } from '@/domain/pricing/types'

export interface Eligibility {
  eligible: boolean
  reasons: string[]
}

export interface OfferCandidate {
  providerId: string
  planIds: string[]
  locationId: string | null
  track: Track
  normalizedPrice: NormalizedPrice
  features: PlanFeature[]
  evidenceIds: string[]
}

export interface ScoreBreakdownItem {
  dimension: string
  points: number
  maxPoints: number
  reason: string
}

export interface RankedOffer extends OfferCandidate {
  score: number
  breakdown: ScoreBreakdownItem[]
  evidenceConfidence: number
  closeAlternative: boolean
}

export interface RankingResult {
  ranked: RankedOffer[]
  unranked: Array<{
    candidate: OfferCandidate
    reason: 'insufficient_verified_data'
  }>
}
