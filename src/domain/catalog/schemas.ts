import { z } from 'zod'
import type {
  BillingPeriod,
  Catalog,
  EditorialAssessment,
  Evidence,
  FeatureKey,
  FeatureState,
  Location,
  Money,
  Plan,
  PlanFeature,
  PlanFee,
  PlanLimit,
  PlanPromotion,
  Provider,
  PublishedStartingPrice,
  Track,
} from './types'

const trackValues = ['address-mail', 'receptionist-phone', 'full-office'] as const satisfies readonly Track[]
const featureStateValues = [
  'included',
  'paid_add_on',
  'usage_based',
  'not_available',
  'not_confirmed',
] as const satisfies readonly FeatureState[]
const featureKeyValues = [
  'business_address',
  'mail_receiving',
  'mail_forwarding',
  'mail_scanning',
  'local_mail_pickup',
  'live_receptionist',
  'business_phone_number',
  'call_forwarding',
  'appointment_scheduling',
  'business_email',
  'administrative_support',
  'meeting_rooms',
  'coworking_access',
  'private_office_access',
  'guest_reception',
  'registered_agent',
  'company_formation_assistance',
] as const satisfies readonly FeatureKey[]
const billingPeriodValues = ['month', 'year', 'one_time', 'usage'] as const satisfies readonly BillingPeriod[]

const nonEmptyStringSchema = z.string().trim().min(1)
const isoTimestampSchema = z.iso.datetime({ offset: true })
const httpsUrlSchema = z.string().url().refine((value) => new URL(value).protocol === 'https:', {
  message: 'Expected an HTTPS URL',
})

export const moneySchema: z.ZodType<Money> = z
  .object({
    amountCents: z.number().int().nonnegative(),
    currency: z.literal('USD'),
    billingPeriod: z.enum(billingPeriodValues),
  })
  .strict()

export const publishedStartingPriceSchema: z.ZodType<PublishedStartingPrice> = z
  .object({
    amountCents: z.number().int().nonnegative(),
    currency: z.literal('USD'),
    billingPeriod: z.literal('day'),
    qualifier: z.literal('from'),
    comparisonStatus: z.literal('not_comparable'),
  })
  .strict()

const evidenceByFieldSchema = z.record(nonEmptyStringSchema, z.array(nonEmptyStringSchema).min(1))

export const providerSchema: z.ZodType<Provider> = z
  .object({
    id: nonEmptyStringSchema,
    name: nonEmptyStringSchema,
    slug: nonEmptyStringSchema,
    websiteUrl: httpsUrlSchema,
    description: nonEmptyStringSchema,
    evidenceIds: z.array(nonEmptyStringSchema),
    lastReviewedAt: isoTimestampSchema,
  })
  .strict()

export const locationSchema: z.ZodType<Location> = z
  .object({
    id: nonEmptyStringSchema,
    providerId: nonEmptyStringSchema,
    city: nonEmptyStringSchema,
    citySlug: nonEmptyStringSchema,
    state: nonEmptyStringSchema,
    address: nonEmptyStringSchema,
    neighborhood: nonEmptyStringSchema.optional(),
    spaceType: nonEmptyStringSchema.optional(),
    physicalFeatures: z.array(z.enum(featureKeyValues)),
    availability: z.enum(['available', 'unavailable', 'not_confirmed']),
    evidenceIds: z.array(nonEmptyStringSchema),
    evidenceByField: evidenceByFieldSchema.optional(),
  })
  .strict()

export const planFeatureSchema: z.ZodType<PlanFeature> = z
  .object({
    feature: z.enum(featureKeyValues),
    state: z.enum(featureStateValues),
    price: moneySchema.optional(),
    quoteRequired: z.literal(true).optional(),
    details: nonEmptyStringSchema.optional(),
  })
  .strict()
  .superRefine((feature, context) => {
    if (feature.state === 'paid_add_on' && feature.price === undefined && feature.quoteRequired !== true) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Paid add-ons require a price or quoteRequired: true',
        path: ['price'],
      })
    }
  })

export const planFeeSchema: z.ZodType<PlanFee> = z
  .object({
    name: nonEmptyStringSchema,
    price: moneySchema.optional(),
    quoteRequired: z.literal(true).optional(),
  })
  .strict()
  .superRefine((fee, context) => {
    if (fee.price === undefined && fee.quoteRequired !== true) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mandatory fees require a price or quoteRequired: true',
        path: ['price'],
      })
    }
  })

export const planPromotionSchema: z.ZodType<PlanPromotion> = z
  .object({
    description: nonEmptyStringSchema,
    startsAt: isoTimestampSchema.optional(),
    endsAt: isoTimestampSchema.optional(),
  })
  .strict()

export const planLimitSchema: z.ZodType<PlanLimit> = z
  .object({
    feature: z.enum(featureKeyValues),
    description: nonEmptyStringSchema,
  })
  .strict()

export const planSchema: z.ZodType<Plan> = z
  .object({
    id: nonEmptyStringSchema,
    providerId: nonEmptyStringSchema,
    locationIds: z.array(nonEmptyStringSchema).min(1),
    canCombineWith: z.array(nonEmptyStringSchema).optional(),
    name: nonEmptyStringSchema,
    tracks: z.array(z.enum(trackValues)).min(1),
    basePrice: moneySchema.nullable(),
    publishedStartingPrice: publishedStartingPriceSchema.optional(),
    quoteRequired: z.boolean(),
    mandatoryFees: z.array(planFeeSchema),
    deposit: moneySchema.nullable(),
    promotion: planPromotionSchema.nullable(),
    includedReceptionistMinutes: z.number().int().nonnegative().nullable(),
    minimumTermMonths: z.number().int().nonnegative().nullable(),
    renewalTerms: nonEmptyStringSchema.nullable(),
    cancellationTerms: nonEmptyStringSchema.nullable(),
    features: z.array(planFeatureSchema),
    limits: z.array(planLimitSchema),
    // Plans feed factual rankings, so every one must link to at least one source record.
    evidenceIds: z.array(nonEmptyStringSchema).min(1),
    evidenceByField: evidenceByFieldSchema.optional(),
  })
  .strict()
  .superRefine((plan, context) => {
    if (plan.basePrice === null && !plan.quoteRequired && plan.publishedStartingPrice === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Plans without a base price require quoteRequired: true',
        path: ['quoteRequired'],
      })
    }
    if (plan.basePrice !== null && plan.publishedStartingPrice !== undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Plans cannot contain both a comparable base price and a non-comparable published starting price',
        path: ['publishedStartingPrice'],
      })
    }
  })

export const evidenceSchema: z.ZodType<Evidence> = z
  .object({
    id: nonEmptyStringSchema,
    entityType: z.enum(['provider', 'location', 'plan', 'assessment']),
    entityId: nonEmptyStringSchema,
    field: nonEmptyStringSchema,
    sourceUrl: httpsUrlSchema,
    capturedAt: isoTimestampSchema,
    observedValue: nonEmptyStringSchema,
    supportingExcerpt: nonEmptyStringSchema,
    verificationMethod: nonEmptyStringSchema,
    confidence: z.enum(['high', 'medium', 'low']),
  })
  .strict()

export const editorialAssessmentSchema: z.ZodType<EditorialAssessment> = z
  .object({
    id: nonEmptyStringSchema,
    providerId: nonEmptyStringSchema,
    planId: nonEmptyStringSchema,
    recommendedFor: z.array(nonEmptyStringSchema),
    strengths: z.array(nonEmptyStringSchema),
    limitations: z.array(nonEmptyStringSchema),
    rationale: nonEmptyStringSchema,
    reviewedBy: nonEmptyStringSchema,
    reviewedAt: isoTimestampSchema,
  })
  .strict()

export const catalogSchema: z.ZodType<Catalog> = z
  .object({
    providers: z.array(providerSchema),
    locations: z.array(locationSchema),
    plans: z.array(planSchema),
    evidence: z.array(evidenceSchema),
    assessments: z.array(editorialAssessmentSchema),
  })
  .strict()
