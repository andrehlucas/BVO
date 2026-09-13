import type { FeatureKey, Plan } from '@/domain/catalog/types'

export interface NormalizedPrice {
  advertisedMonthlyCents: number | null
  firstMonthCents: number | null
  recurringMonthlyCents: number | null
  mandatoryUpfrontCents: number
  optionalAddOns: Array<{ feature: FeatureKey; amountCents: number | null }>
  usageBasedFeatures: FeatureKey[]
  promotion: Plan['promotion'] | null
  isComplete: boolean
  explanation: string
}
