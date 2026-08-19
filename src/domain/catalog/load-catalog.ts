import assessments from '../../../content/catalog/assessments.json'
import evidence from '../../../content/catalog/evidence.json'
import locations from '../../../content/catalog/locations.json'
import plans from '../../../content/catalog/plans.json'
import providers from '../../../content/catalog/providers.json'
import { catalogSchema } from './schemas'
import type { Catalog } from './types'
import { validateCatalogIntegrity } from './validate-integrity'
import { validateCatalogEvidenceTraceability } from './validate-evidence-traceability'

export function loadCatalog(): Catalog {
  const catalog = catalogSchema.parse({
    providers,
    locations,
    plans,
    evidence,
    assessments,
  })
  const integrityErrors = [
    ...validateCatalogIntegrity(catalog),
    ...validateCatalogEvidenceTraceability(catalog),
  ].sort()

  if (integrityErrors.length > 0) {
    throw new Error(`Catalog integrity validation failed:\n${integrityErrors.join('\n')}`)
  }

  return catalog
}
