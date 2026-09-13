import { validateCatalogEvidenceTraceability } from '@/domain/catalog/validate-evidence-traceability'
import type { Catalog } from '@/domain/catalog/types'
import { validCatalogFixture } from '../fixtures/catalog'

describe('validateCatalogEvidenceTraceability', () => {
  it('accepts evidence maps for every factual ranking input', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.locations[0]!.evidenceByField = {
      address: ['miami-location'],
      availability: ['miami-location'],
      'physicalFeatures.meeting_rooms': ['miami-location'],
    }
    catalog.plans[0]!.evidenceByField = {
      basePrice: ['miami-address-mail-price'],
      minimumTermMonths: ['miami-address-mail-price'],
      renewalTerms: ['miami-address-mail-price'],
      cancellationTerms: ['miami-address-mail-price'],
      'features.business_address': ['miami-address-mail-price'],
      'features.mail_receiving': ['miami-address-mail-price'],
    }

    expect(validateCatalogEvidenceTraceability(catalog)).toEqual([])
  })

  it('rejects a required plan field with no evidence mapping', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.plans[0]!.evidenceByField = {
      minimumTermMonths: ['miami-address-mail-price'],
      renewalTerms: ['miami-address-mail-price'],
      cancellationTerms: ['miami-address-mail-price'],
      'features.business_address': ['miami-address-mail-price'],
      'features.mail_receiving': ['miami-address-mail-price'],
    }

    expect(validateCatalogEvidenceTraceability(catalog)).toContain(
      'Plan miami-address-mail field basePrice lacks field-level evidence',
    )
  })

  it('rejects evidence for the wrong entity', () => {
    const catalog = structuredClone(validCatalogFixture) as Catalog
    catalog.locations[0]!.evidenceByField = {
      address: ['provider-website'],
      availability: ['miami-location'],
      'physicalFeatures.meeting_rooms': ['miami-location'],
    }

    expect(validateCatalogEvidenceTraceability(catalog)).toContain(
      'Location miami-example field address references evidence provider-website for provider example-office',
    )
  })
})
