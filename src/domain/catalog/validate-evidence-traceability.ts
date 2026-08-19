import type { Catalog, Location, Plan } from './types'

const planFields = (plan: Plan): string[] => [
  ...(plan.basePrice ? ['basePrice'] : []),
  ...(plan.publishedStartingPrice ? ['publishedStartingPrice'] : []),
  ...(plan.mandatoryFees.length > 0 ? ['mandatoryFees'] : []),
  ...(plan.deposit ? ['deposit'] : []),
  ...(plan.includedReceptionistMinutes !== null ? ['includedReceptionistMinutes'] : []),
  ...(plan.minimumTermMonths !== null ? ['minimumTermMonths'] : []),
  ...(plan.renewalTerms !== null ? ['renewalTerms'] : []),
  ...(plan.cancellationTerms !== null ? ['cancellationTerms'] : []),
  ...plan.features
    .filter((feature) => feature.state !== 'not_confirmed')
    .map((feature) => `features.${feature.feature}`),
  ...plan.limits.map((limit) => `limits.${limit.feature}`),
]

const locationFields = (location: Location): string[] => [
  'address',
  'availability',
  ...location.physicalFeatures.map((feature) => `physicalFeatures.${feature}`),
]

function traceEntityFields(
  entity: Plan | Location,
  entityType: 'plan' | 'location',
  fields: string[],
  catalog: Catalog,
): string[] {
  const evidenceById = new Map(catalog.evidence.map((evidence) => [evidence.id, evidence]))
  const entityName = entityType === 'plan' ? 'Plan' : 'Location'
  const errors: string[] = []

  for (const field of fields) {
    const evidenceIds = entity.evidenceByField?.[field]
    if (!evidenceIds || evidenceIds.length === 0) {
      errors.push(`${entityName} ${entity.id} field ${field} lacks field-level evidence`)
      continue
    }

    for (const evidenceId of evidenceIds) {
      const evidence = evidenceById.get(evidenceId)
      if (!evidence) {
        errors.push(`${entityName} ${entity.id} field ${field} references unknown evidence ${evidenceId}`)
      } else if (evidence.entityType !== entityType || evidence.entityId !== entity.id) {
        errors.push(
          `${entityName} ${entity.id} field ${field} references evidence ${evidenceId} for ${evidence.entityType} ${evidence.entityId}`,
        )
      }
    }
  }

  return errors
}

/**
 * Ensures every non-unknown input that can affect a catalog-backed ranking has
 * an explicit evidence mapping to a source record for that exact entity.
 */
export function validateCatalogEvidenceTraceability(catalog: Catalog): string[] {
  return [
    ...catalog.locations.flatMap((location) => traceEntityFields(location, 'location', locationFields(location), catalog)),
    ...catalog.plans.flatMap((plan) => traceEntityFields(plan, 'plan', planFields(plan), catalog)),
  ].sort()
}
