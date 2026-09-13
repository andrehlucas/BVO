import { validateCatalogIntegrity } from '@/domain/catalog/validate-integrity'
import type { Catalog } from '@/domain/catalog/types'
import { validCatalogFixture } from '../fixtures/catalog'

describe('validateCatalogIntegrity', () => {
  it('accepts a catalog whose references resolve', () => {
    expect(validateCatalogIntegrity(validCatalogFixture as Catalog)).toEqual([])
  })

  it('reports duplicate IDs without discarding either entity', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.providers.push(structuredClone(catalog.providers[0]!))

    expect(validateCatalogIntegrity(catalog)).toContain('Duplicate provider ID example-office')
  })

  it('reports a location that references an unknown provider', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.locations[0]!.providerId = 'missing-provider'

    expect(validateCatalogIntegrity(catalog)).toContain(
      'Location miami-example references unknown provider missing-provider',
    )
  })

  it('reports a plan that references an unknown location', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.plans[0]!.locationIds = ['missing-location']

    expect(validateCatalogIntegrity(catalog)).toContain(
      'Plan miami-address-mail references unknown location missing-location',
    )
  })

  it('reports an assessment that references an unknown plan', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.assessments[0]!.planId = 'missing-plan'

    expect(validateCatalogIntegrity(catalog)).toContain(
      'Assessment miami-address-mail-assessment references unknown plan missing-plan',
    )
  })

  it('reports missing evidence referenced by catalog entities', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.plans[0]!.evidenceIds = ['missing-evidence']

    expect(validateCatalogIntegrity(catalog)).toContain(
      'Plan miami-address-mail references unknown evidence missing-evidence',
    )
  })

  it('reports every error in deterministic sorted order', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.providers.push(structuredClone(catalog.providers[0]!))
    catalog.locations[0]!.providerId = 'missing-provider'
    catalog.plans[0]!.locationIds = ['missing-location']

    const errors = validateCatalogIntegrity(catalog)

    expect(errors).toEqual([...errors].sort((left, right) => left.localeCompare(right)))
  })
})
