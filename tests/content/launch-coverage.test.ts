import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { listEditorialPages } from '@/content/load-editorial-page'
import { loadCatalog } from '@/domain/catalog/load-catalog'
import type { Location, Plan } from '@/domain/catalog/types'

const launchCities = ['miami', 'orlando', 'tampa', 'fort-lauderdale', 'boca-raton']
const launchProviders = [
  'regus',
  'opus-virtual-offices',
  'alliance-virtual-offices',
  'davinci-virtual',
]
const editorialRoot = path.resolve(process.cwd(), 'content/editorial')
const legallySensitiveGuideSlugs = [
  'business-address-vs-registered-agent',
  'can-you-use-a-virtual-office-address-for-your-business',
]

async function frontmatterFor(kind: 'cities' | 'providers' | 'guides') {
  const files = (await readdir(path.join(editorialRoot, kind))).filter((file) => file.endsWith('.md'))
  return Promise.all(files.map(async (file) => {
    const source = await readFile(path.join(editorialRoot, kind, file), 'utf8')
    return matter(source).data
  }))
}

describe('launch content coverage', () => {
  it('contains the reviewed Florida launch catalog and editorial corpus', async () => {
    const catalog = loadCatalog()
    const cityPages = await frontmatterFor('cities')
    const providerPages = await frontmatterFor('providers')
    const guides = await frontmatterFor('guides')

    expect([...new Set(catalog.locations.map((location) => location.citySlug))].sort()).toEqual(
      [...launchCities].sort(),
    )
    expect(catalog.providers.map((provider) => provider.id).sort()).toEqual([...launchProviders].sort())

    const evidenceIds = new Set(catalog.evidence.map((evidence) => evidence.id))
    const evidenceFor = (entityId: string, field: string, ids: string[] | undefined) => {
      expect(ids, `${entityId}.${field} needs field-level evidence`).toBeDefined()
      expect(ids?.length, `${entityId}.${field} needs at least one evidence record`).toBeGreaterThan(0)
      expect(ids?.every((id) => evidenceIds.has(id)), `${entityId}.${field} has unresolved evidence`).toBe(true)
    }
    const planFields = (plan: Plan) => [
      ...(plan.basePrice ? ['basePrice'] : []),
      ...(plan.publishedStartingPrice ? ['publishedStartingPrice'] : []),
      ...(plan.mandatoryFees.length ? ['mandatoryFees'] : []),
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
    const locationFields = (location: Location) => [
      'address',
      'availability',
      ...location.physicalFeatures.map((feature) => `physicalFeatures.${feature}`),
    ]

    for (const location of catalog.locations) {
      for (const field of locationFields(location)) {
        evidenceFor(location.id, field, location.evidenceByField?.[field])
      }
    }
    for (const plan of catalog.plans) {
      expect(plan.evidenceIds.length, `${plan.id} needs direct plan evidence`).toBeGreaterThan(0)
      expect(plan.evidenceIds.every((id) => evidenceIds.has(id)), `${plan.id} has unresolved evidence`).toBe(true)
      for (const field of planFields(plan)) {
        evidenceFor(plan.id, field, plan.evidenceByField?.[field])
      }
    }

    expect(catalog.assessments).toHaveLength(4)
    expect(catalog.assessments.map((assessment) => assessment.providerId).sort())
      .toEqual([...launchProviders].sort())
    expect(cityPages.map((page) => page.slug).sort()).toEqual([...launchCities].sort())
    expect(providerPages.map((page) => page.slug).sort()).toEqual([...launchProviders].sort())
    expect(guides).toHaveLength(8)

    for (const page of [...cityPages, ...providerPages, ...guides.filter((guide) => !legallySensitiveGuideSlugs.includes(guide.slug))]) {
      expect(page.status).toBe('reviewed')
      expect(page.reviewer).toEqual(expect.any(String))
      expect(page.reviewer.trim()).not.toBe('')
    }

    for (const slug of legallySensitiveGuideSlugs) {
      expect(guides.find((guide) => guide.slug === slug)?.status).toBe('draft')
    }

    const publicGuides = await listEditorialPages('guides')
    expect(publicGuides).toHaveLength(6)
    expect(publicGuides.every((guide) => guide.status === 'reviewed')).toBe(true)
    expect(publicGuides.map((guide) => guide.slug)).not.toEqual(
      expect.arrayContaining(legallySensitiveGuideSlugs),
    )
  })
})
