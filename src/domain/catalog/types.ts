export type Track = 'address-mail' | 'receptionist-phone' | 'full-office'

export type FeatureState =
  | 'included'
  | 'paid_add_on'
  | 'usage_based'
  | 'not_available'
  | 'not_confirmed'

export type FeatureKey =
  | 'business_address'
  | 'mail_receiving'
  | 'mail_forwarding'
  | 'mail_scanning'
  | 'local_mail_pickup'
  | 'live_receptionist'
  | 'business_phone_number'
  | 'call_forwarding'
  | 'appointment_scheduling'
  | 'business_email'
  | 'administrative_support'
  | 'meeting_rooms'
  | 'coworking_access'
  | 'private_office_access'
  | 'guest_reception'
  | 'registered_agent'
  | 'company_formation_assistance'

export type BillingPeriod = 'month' | 'year' | 'one_time' | 'usage'

export interface Money {
  amountCents: number
  currency: 'USD'
  billingPeriod: BillingPeriod
}

export interface Provider {
  id: string
  name: string
  slug: string
  websiteUrl: string
  description: string
  evidenceIds: string[]
  lastReviewedAt: string
}

export interface Location {
  id: string
  providerId: string
  city: string
  citySlug: string
  state: string
  address: string
  neighborhood?: string
  spaceType?: string
  physicalFeatures: FeatureKey[]
  availability: 'available' | 'unavailable' | 'not_confirmed'
  evidenceIds: string[]
}

export interface PlanFeature {
  feature: FeatureKey
  state: FeatureState
  price?: Money
  quoteRequired?: true
  details?: string
}

export interface PlanFee {
  name: string
  price?: Money
  quoteRequired?: true
}

export interface PlanPromotion {
  description: string
  startsAt?: string
  endsAt?: string
}

export interface PlanLimit {
  feature: FeatureKey
  description: string
}

export interface Plan {
  id: string
  providerId: string
  locationIds: string[]
  canCombineWith?: string[]
  name: string
  tracks: Track[]
  basePrice: Money | null
  quoteRequired: boolean
  mandatoryFees: PlanFee[]
  deposit: Money | null
  promotion: PlanPromotion | null
  includedReceptionistMinutes: number | null
  minimumTermMonths: number | null
  renewalTerms: string | null
  cancellationTerms: string | null
  features: PlanFeature[]
  limits: PlanLimit[]
  evidenceIds: string[]
}

export interface Evidence {
  id: string
  entityType: 'provider' | 'location' | 'plan' | 'assessment'
  entityId: string
  field: string
  sourceUrl: string
  capturedAt: string
  observedValue: string
  supportingExcerpt: string
  verificationMethod: string
  confidence: 'high' | 'medium' | 'low'
}

export interface EditorialAssessment {
  id: string
  providerId: string
  planId: string
  recommendedFor: string[]
  strengths: string[]
  limitations: string[]
  rationale: string
  reviewedBy: string
  reviewedAt: string
}

export interface Catalog {
  providers: Provider[]
  locations: Location[]
  plans: Plan[]
  evidence: Evidence[]
  assessments: EditorialAssessment[]
}
