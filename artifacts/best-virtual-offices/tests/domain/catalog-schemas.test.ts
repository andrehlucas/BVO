import { catalogSchema } from '@/domain/catalog/schemas'
import { validCatalogFixture } from '../fixtures/catalog'

describe('catalogSchema', () => {
  it('parses a verified Miami address and mail catalog', () => {
    expect(() => catalogSchema.parse(validCatalogFixture)).not.toThrow()
  })

  it('rejects paid add-ons without a price or quote marker', () => {
    const invalid = structuredClone(validCatalogFixture)
    invalid.plans[0]!.features[0]!.state = 'paid_add_on'

    expect(() => catalogSchema.parse(invalid)).toThrow()
  })

  it('rejects unsupported feature states', () => {
    const invalid = structuredClone(validCatalogFixture)
    invalid.plans[0]!.features[0]!.state = 'sometimes'

    expect(() => catalogSchema.parse(invalid)).toThrow()
  })

  it('rejects negative money values', () => {
    const invalid = structuredClone(validCatalogFixture)
    invalid.plans[0]!.basePrice!.amountCents = -1

    expect(() => catalogSchema.parse(invalid)).toThrow()
  })

  it('rejects non-ISO timestamps and non-HTTPS evidence URLs', () => {
    const invalid = structuredClone(validCatalogFixture)
    invalid.evidence[0]!.capturedAt = 'August 19, 2026'
    invalid.evidence[0]!.sourceUrl = 'http://example.com/provider'

    expect(() => catalogSchema.parse(invalid)).toThrow()
  })

  it('requires evidence for every plan that can be ranked', () => {
    const invalid = structuredClone(validCatalogFixture)
    invalid.plans[0]!.evidenceIds = []

    expect(() => catalogSchema.parse(invalid)).toThrow()
  })
})
