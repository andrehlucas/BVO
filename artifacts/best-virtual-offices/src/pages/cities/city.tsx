import { useSearchParams } from '@/hooks/use-next-navigation'

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
import NotFound from '@/pages/not-found'

interface CityPageProps { params: { city: string } }

const trackDescription: Record<Track, string> = {
  'address-mail': 'Find plans that can receive your business mail, then see what forwarding or scanning may add to the cost.',
  'receptionist-phone': 'Compare plans that put a real person on your calls, including any verified minutes and overage limits.',
  'full-office': 'Look for a compatible package that combines address, mail, call handling, and the workspace access you need.',
}

export default function CityPage({ params }: CityPageProps) {
  const { city: citySlug } = params;
  const searchParams = useSearchParams();
  const rawSearchParams = Object.fromEntries(searchParams.entries());
  
  const city = cities.find((candidate) => candidate.slug === citySlug)
  if (!city) {
    return <NotFound />;
  }
  
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
      <header className="city-heading"><p className="eyebrow">Compare before you commit</p><h1>Compare virtual offices in {city!.name} by what you actually need</h1><p>Looking for an address? A receptionist? Both? Start with the job your virtual office must handle, then see which plans document the right combination.</p><p className="city-evidence-count">{overall.length} provider profile{overall.length === 1 ? '' : 's'} currently has enough verified local information for a broader provider overview.</p></header>
      <ComparisonTelemetry city={citySlug as import('@/analytics/events').ProductCity} track={track} />
      <section className="comparison-workflow" aria-labelledby="comparison-workflow-heading"><div className="workflow-heading"><h2 id="comparison-workflow-heading">What should your virtual office do?</h2><p>{trackDescription[track]}</p></div><NeedSelector city={citySlug as import('@/analytics/events').ProductCity} selectedNeed={query.need} /><RankingTabs activeTrack={track} city={citySlug as import('@/analytics/events').ProductCity} /><RefinementFilters query={query} track={track} /></section>
      <RankingResults catalog={catalog} citySlug={citySlug} ranking={ranking} track={track} />
      <ComparisonTable catalog={catalog} city={citySlug as import('@/analytics/events').ProductCity} offers={ranking.ranked} track={track} />
      <LocationList catalog={catalog} citySlug={citySlug as import('@/analytics/events').ProductCity} track={track} />
      <aside className="comparison-limitations" aria-labelledby="comparison-limitations-heading"><h2 id="comparison-limitations-heading">Before you use an address</h2><p>A business address is not the same as registered-agent service. Registration, banking, licensing, and platform rules vary. Confirm the exact use with the organization making the decision.</p></aside>
    </>
  )
}
