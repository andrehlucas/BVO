import type { Plan, PlanFeature, Track } from '@/domain/catalog/types'
import type { Eligibility } from './types'

const includedFeature = (features: PlanFeature[], feature: PlanFeature['feature']): boolean =>
  features.some((planFeature) => planFeature.feature === feature && planFeature.state === 'included')

const addressMailEligibility = (plan: Plan): Eligibility => {
  const reasons: string[] = []

  if (!includedFeature(plan.features, 'business_address')) {
    reasons.push('Business address is not included.')
  }
  if (!includedFeature(plan.features, 'mail_receiving')) {
    reasons.push('Mail receiving is not included.')
  }

  return { eligible: reasons.length === 0, reasons }
}

const receptionistPhoneEligibility = (plan: Plan): Eligibility => {
  const reasons: string[] = []

  if (!includedFeature(plan.features, 'live_receptionist')) {
    reasons.push('Live receptionist is not included.')
  }
  if (
    !includedFeature(plan.features, 'business_phone_number')
    && !includedFeature(plan.features, 'call_forwarding')
  ) {
    reasons.push('Business phone number or call forwarding is not included.')
  }

  return { eligible: reasons.length === 0, reasons }
}

export function getPlanEligibility(plan: Plan, track: Track): Eligibility {
  if (track === 'address-mail') return addressMailEligibility(plan)
  if (track === 'receptionist-phone') return receptionistPhoneEligibility(plan)

  const addressEligibility = addressMailEligibility(plan)
  const receptionistEligibility = receptionistPhoneEligibility(plan)
  const reasons = [...addressEligibility.reasons, ...receptionistEligibility.reasons]

  return { eligible: reasons.length === 0, reasons }
}
