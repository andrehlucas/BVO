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
