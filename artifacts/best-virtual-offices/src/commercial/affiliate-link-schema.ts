import { z } from 'zod'

export interface AffiliateLink {
  providerId: string
  destinationUrl: string
  trackingParameters: Record<string, string>
  active: boolean
  disclosureLabel: string
}

const nonEmptyStringSchema = z.string().trim().min(1)
const httpsUrlSchema = nonEmptyStringSchema.url().refine((value) => new URL(value).protocol === 'https:', {
  message: 'Expected an HTTPS URL',
})

export const affiliateLinkSchema: z.ZodType<AffiliateLink> = z
  .object({
    providerId: nonEmptyStringSchema,
    destinationUrl: httpsUrlSchema,
    trackingParameters: z.record(nonEmptyStringSchema, nonEmptyStringSchema),
    active: z.boolean(),
    disclosureLabel: nonEmptyStringSchema,
  })
  .strict()

export const affiliateLinksSchema = z.array(affiliateLinkSchema)
