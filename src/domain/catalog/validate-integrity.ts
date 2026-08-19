import type { Catalog } from './types'

type EntityName = 'Provider' | 'Location' | 'Plan' | 'Evidence' | 'Assessment'

function collectDuplicateIdErrors(entityName: EntityName, ids: readonly string[]): string[] {
  const counts = new Map<string, number>()

  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  return [...counts]
    .filter(([, count]) => count > 1)
    .map(([id]) => `Duplicate ${entityName.toLowerCase()} ID ${id}`)
}

function collectUnknownEvidenceErrors(
  entityName: 'Provider' | 'Location' | 'Plan',
  entities: ReadonlyArray<{ id: string; evidenceIds: string[] }>,
  evidenceIds: ReadonlySet<string>,
): string[] {
  return entities.flatMap((entity) =>
    entity.evidenceIds
      .filter((evidenceId) => !evidenceIds.has(evidenceId))
      .map((evidenceId) => `${entityName} ${entity.id} references unknown evidence ${evidenceId}`),
  )
}

/**
 * Validates references between already schema-validated catalog entities.
 * The returned errors are sorted so validation output is stable across runs.
 */
export function validateCatalogIntegrity(catalog: Catalog): string[] {
  const providerIds = new Set(catalog.providers.map((provider) => provider.id))
  const locationIds = new Set(catalog.locations.map((location) => location.id))
  const planIds = new Set(catalog.plans.map((plan) => plan.id))
  const evidenceIds = new Set(catalog.evidence.map((evidence) => evidence.id))
  const assessmentIds = new Set(catalog.assessments.map((assessment) => assessment.id))

  const errors = [
    ...collectDuplicateIdErrors('Provider', catalog.providers.map((provider) => provider.id)),
    ...collectDuplicateIdErrors('Location', catalog.locations.map((location) => location.id)),
    ...collectDuplicateIdErrors('Plan', catalog.plans.map((plan) => plan.id)),
    ...collectDuplicateIdErrors('Evidence', catalog.evidence.map((evidence) => evidence.id)),
    ...collectDuplicateIdErrors('Assessment', catalog.assessments.map((assessment) => assessment.id)),
    ...catalog.locations
      .filter((location) => !providerIds.has(location.providerId))
      .map((location) => `Location ${location.id} references unknown provider ${location.providerId}`),
    ...catalog.plans
      .filter((plan) => !providerIds.has(plan.providerId))
      .map((plan) => `Plan ${plan.id} references unknown provider ${plan.providerId}`),
    ...catalog.plans.flatMap((plan) =>
      plan.locationIds
        .filter((locationId) => !locationIds.has(locationId))
        .map((locationId) => `Plan ${plan.id} references unknown location ${locationId}`),
    ),
    ...catalog.assessments
      .filter((assessment) => !providerIds.has(assessment.providerId))
      .map((assessment) => `Assessment ${assessment.id} references unknown provider ${assessment.providerId}`),
    ...catalog.assessments
      .filter((assessment) => !planIds.has(assessment.planId))
      .map((assessment) => `Assessment ${assessment.id} references unknown plan ${assessment.planId}`),
    ...collectUnknownEvidenceErrors('Provider', catalog.providers, evidenceIds),
    ...collectUnknownEvidenceErrors('Location', catalog.locations, evidenceIds),
    ...collectUnknownEvidenceErrors('Plan', catalog.plans, evidenceIds),
    ...catalog.evidence.flatMap((evidence) => {
      const idsByEntityType = {
        provider: providerIds,
        location: locationIds,
        plan: planIds,
        assessment: assessmentIds,
      }
      const referencedIds = idsByEntityType[evidence.entityType]

      return referencedIds.has(evidence.entityId)
        ? []
        : [`Evidence ${evidence.id} references unknown ${evidence.entityType} ${evidence.entityId}`]
    }),
  ]

  return errors.sort()
}
