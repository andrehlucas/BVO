import type { Money, Plan, PlanFeature } from '@/domain/catalog/types'
import type { NormalizedPrice } from './types'

const monthlyEquivalentCents = (price: Money): number | null => {
  if (price.billingPeriod === 'month') return price.amountCents
  if (price.billingPeriod === 'year') return Math.round(price.amountCents / 12)
  return null
}

const optionalAddOn = (feature: PlanFeature) => ({
  feature: feature.feature,
  amountCents: feature.price ? monthlyEquivalentCents(feature.price) : null,
})

export const normalizePlanPrice = (plan: Plan): NormalizedPrice => {
  const advertisedMonthlyCents = plan.basePrice
    ? monthlyEquivalentCents(plan.basePrice)
    : null
  const optionalFeatures = plan.features.filter(
    (feature) => feature.state === 'paid_add_on' || feature.state === 'usage_based',
  )
  const usageBasedFeatures = plan.features
    .filter((feature) => feature.state === 'usage_based')
    .map((feature) => feature.feature)
  const mandatoryUpfrontCents = plan.mandatoryFees.reduce(
    (total, fee) => total + (fee.price?.billingPeriod === 'one_time' ? fee.price.amountCents : 0),
    0,
  )
  const requiredAmountIsUnknown = plan.quoteRequired
    || !plan.basePrice
    || plan.basePrice.billingPeriod === 'usage'
    || plan.basePrice.billingPeriod === 'one_time'
    || plan.mandatoryFees.some((fee) => !fee.price || fee.quoteRequired || fee.price.billingPeriod === 'usage')
  const recurringFeeCents = plan.mandatoryFees.reduce<number | null>((total, fee) => {
    if (total === null || !fee.price) return null
    const amountCents = monthlyEquivalentCents(fee.price)
    return fee.price.billingPeriod === 'one_time' ? total : amountCents === null ? null : total + amountCents
  }, 0)
  const isComplete = !requiredAmountIsUnknown && advertisedMonthlyCents !== null && recurringFeeCents !== null
  const firstMonthCents = isComplete ? advertisedMonthlyCents + mandatoryUpfrontCents : null
  const recurringMonthlyCents = isComplete ? advertisedMonthlyCents + recurringFeeCents : null

  return {
    advertisedMonthlyCents,
    firstMonthCents,
    recurringMonthlyCents,
    mandatoryUpfrontCents,
    optionalAddOns: optionalFeatures.map(optionalAddOn),
    usageBasedFeatures,
    promotion: plan.promotion,
    isComplete,
    explanation: isComplete
      ? 'Monthly equivalents include required recurring fees; temporary promotions and usage-based charges are separate.'
      : 'A required price is unavailable, quote-only, or usage-based, so fixed totals cannot be calculated.',
  }
}
