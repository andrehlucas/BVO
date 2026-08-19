import { notFound } from 'next/navigation'
import { ComparisonTable } from '@/components/comparison/comparison-table'
import { LocationList } from '@/components/comparison/location-list'
import { NeedSelector } from '@/components/comparison/need-selector'
import { RefinementFilters, workspacePreference } from '@/components/comparison/refinement-filters'
import { RankingResults } from '@/components/comparison/ranking-results'
import { RankingTabs } from '@/components/comparison/ranking-tabs'
import { parseComparisonQuery } from '@/components/comparison/url-state'
import { loadCatalog } from '@/domain/catalog/load-catalog'
import type { Track } from '@/domain/catalog/types'
import { resolveTrack } from '@/domain/questionnaire/resolve-track'
import { rankOverallProviders } from '@/domain/ranking/overall'
import { rankOffers } from '@/domain/ranking/rank'

const cities = [
  { slug: 'orlando', name: 'Orlando' },
  { slug: 'tampa', name: 'Tampa' },
  { slug: 'fort-lauderdale', name: 'Fort Lauderdale' },
  { slug: 'miami', name: 'Miami' },
  { slug: 'boca-raton', name: 'Boca Raton' },
] as const

type SearchParams = Record<string, string | string[] | undefined>
interface CityPageProps { params: Promise<{ city: string }>; searchParams: Promise<SearchParams> }

export function generateStaticParams() { return cities.map(({ slug: city }) => ({ city })) }
export const dynamicParams = false

const trackDescription: Record<Track, string> = {
  'address-mail': 'Compare business-address and mail-handling offers before comparing their costs.',
  'receptionist-phone': 'Compare live-answering and business-phone offers with their verified monthly allowance.',
  'full-office': 'Compare compatible address, mail, receptionist, and workspace combinations.',
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const [{ city: citySlug }, rawSearchParams] = await Promise.all([params, searchParams])
  const city = cities.find((candidate) => candidate.slug === citySlug)
  if (!city) notFound()

  const query = parseComparisonQuery(rawSearchParams)
  const track = resolveTrack({
    selected: query.need,
    needsAddress: query.need === 'full-office' || query.need === 'address-mail',
    needsHumanAnswering: query.need === 'full-office' || query.need === 'receptionist-phone',
  })
  const catalog = loadCatalog()
  const ranking = rankOffers(catalog, citySlug, track, {
    needsMailForwarding: query.mailForwarding,
    needsMailScanning: query.mailScanning,
    needsCallForwarding: query.callVolume === 'steady',
    prefersMonthToMonth: query.monthToMonth,
    ...workspacePreference(query.workspace),
  })
  const overall = rankOverallProviders(catalog, citySlug)

  return (
    <>
      <header className="city-heading"><p className="eyebrow">Florida city comparison</p><h1>Virtual offices in {city!.name}</h1><p>Start with the service you need, then inspect the evidence, price assumptions, and limitations behind each eligible offer.</p><p className="city-evidence-count">{overall.length} provider profile{overall.length === 1 ? '' : 's'} currently has enough verified city evidence for a secondary overview.</p></header>
      <section className="comparison-workflow" aria-labelledby="comparison-workflow-heading"><div className="workflow-heading"><p className="eyebrow">Decision tool</p><h2 id="comparison-workflow-heading">Match your need</h2><p>{trackDescription[track]}</p></div><NeedSelector selectedNeed={query.need} /><RankingTabs activeTrack={track} /><RefinementFilters query={query} track={track} /></section>
      <RankingResults catalog={catalog} citySlug={citySlug} ranking={ranking} track={track} />
      <ComparisonTable catalog={catalog} offers={ranking.ranked} />
      <LocationList catalog={catalog} citySlug={citySlug} />
      <aside className="comparison-limitations" aria-labelledby="comparison-limitations-heading"><h2 id="comparison-limitations-heading">Important limits</h2><p>A business address is not the same as registered-agent service. Whether an address works for registration, banking, licensing, or platform listings depends on your facts and the relevant rules; confirm with the appropriate authority or professional.</p></aside>
    </>
  )
}
