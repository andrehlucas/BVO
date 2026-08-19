import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ComparisonTable } from '@/components/comparison/comparison-table'
import { ComparisonTelemetry } from '@/components/comparison/comparison-telemetry'
import { LocationList } from '@/components/comparison/location-list'
import { NeedSelector } from '@/components/comparison/need-selector'
import { RefinementFilters } from '@/components/comparison/refinement-filters'
import { RankingResults } from '@/components/comparison/ranking-results'
import { RankingTabs } from '@/components/comparison/ranking-tabs'
import { parseComparisonQuery, workspacePreference } from '@/components/comparison/url-state'
import { loadCatalog } from '@/domain/catalog/load-catalog'
import type { Track } from '@/domain/catalog/types'
import { resolveTrack } from '@/domain/questionnaire/resolve-track'
import { rankOverallProviders } from '@/domain/ranking/overall'
import { rankOffers } from '@/domain/ranking/rank'
import { JsonLd } from '@/components/seo/json-ld'
import { absoluteUrl } from '@/seo/site-url'
import { cities } from '@/seo/public-routes'

type SearchParams = Record<string, string | string[] | undefined>
interface CityPageProps { params: Promise<{ city: string }>; searchParams: Promise<SearchParams> }

export function generateStaticParams() { return cities.map(({ slug: city }) => ({ city })) }
export const dynamicParams = false

export async function generateMetadata({ params }: Pick<CityPageProps, 'params'>): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = cities.find((candidate) => candidate.slug === citySlug)
  if (!city) notFound()

  return {
    title: `Virtual offices in ${city.name}`,
    description: `Compare verified virtual office features, limitations, and evidence for ${city.name}, Florida.`,
    alternates: { canonical: `/cities/${city.slug}` },
  }
}

const trackDescription: Record<Track, string> = {
  'address-mail': 'Compare business-address and mail-handling offers before comparing their costs.',
  'receptionist-phone': 'Compare live-answering and business-phone offers with their verified monthly allowance.',
  'full-office': 'Compare compatible address, mail, receptionist, and workspace combinations.',
}

const trackLabel: Record<Track, string> = {
  'address-mail': 'Address & mail',
  'receptionist-phone': 'Live receptionist & phone',
  'full-office': 'Full virtual office',
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
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Virtual offices in ${city.name}`,
        description: `Verified virtual office comparison for ${city.name}, Florida.`,
        url: absoluteUrl(`/cities/${city.slug}`),
        inLanguage: 'en-US',
      }} />
      <header className="city-heading"><p className="eyebrow">Florida city comparison</p><h1>Virtual offices in {city!.name}: {trackLabel[track]}</h1><p>Start with the service you need, then inspect the evidence, price assumptions, and limitations behind each eligible offer.</p><p className="city-evidence-count">{overall.length} provider profile{overall.length === 1 ? '' : 's'} currently has enough verified city evidence for a secondary overview.</p></header>
      <ComparisonTelemetry city={citySlug as import('@/analytics/events').ProductCity} track={track} />
      <section className="comparison-workflow" aria-labelledby="comparison-workflow-heading"><div className="workflow-heading"><p className="eyebrow">Decision tool</p><h2 id="comparison-workflow-heading">Match your need</h2><p>{trackDescription[track]}</p></div><NeedSelector city={citySlug as import('@/analytics/events').ProductCity} selectedNeed={query.need} /><RankingTabs activeTrack={track} city={citySlug as import('@/analytics/events').ProductCity} /><RefinementFilters query={query} track={track} /></section>
      <RankingResults catalog={catalog} citySlug={citySlug} ranking={ranking} track={track} />
      <ComparisonTable catalog={catalog} city={citySlug as import('@/analytics/events').ProductCity} offers={ranking.ranked} track={track} />
      <LocationList catalog={catalog} citySlug={citySlug as import('@/analytics/events').ProductCity} track={track} />
      <aside className="comparison-limitations" aria-labelledby="comparison-limitations-heading"><h2 id="comparison-limitations-heading">Important limits</h2><p>A business address is not the same as registered-agent service. Whether an address works for registration, banking, licensing, or platform listings depends on your facts and the relevant rules; confirm with the appropriate authority or professional.</p></aside>
    </>
  )
}
