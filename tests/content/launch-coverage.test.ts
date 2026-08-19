import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@/domain/catalog/load-catalog'

const launchCities = ['miami', 'orlando', 'tampa', 'fort-lauderdale', 'boca-raton']
const launchProviders = [
  'regus',
  'opus-virtual-offices',
  'alliance-virtual-offices',
  'davinci-virtual',
]
const editorialRoot = path.resolve(process.cwd(), 'content/editorial')

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
    for (const plan of catalog.plans) {
      expect(plan.evidenceIds.length, `${plan.id} needs direct plan evidence`).toBeGreaterThan(0)
      expect(plan.evidenceIds.every((id) => evidenceIds.has(id)), `${plan.id} has unresolved evidence`).toBe(true)
    }

    expect(catalog.assessments).toHaveLength(4)
    expect(catalog.assessments.map((assessment) => assessment.providerId).sort())
      .toEqual([...launchProviders].sort())
    expect(cityPages.map((page) => page.slug).sort()).toEqual([...launchCities].sort())
    expect(providerPages.map((page) => page.slug).sort()).toEqual([...launchProviders].sort())
    expect(guides).toHaveLength(8)

    for (const page of [...cityPages, ...providerPages, ...guides]) {
      expect(page.status).toBe('reviewed')
      expect(page.reviewer).toEqual(expect.any(String))
      expect(page.reviewer.trim()).not.toBe('')
    }
  })
})
