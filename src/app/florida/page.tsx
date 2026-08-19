import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Florida virtual office city comparisons',
  description: 'Choose a Florida city to inspect verified virtual office availability, features, and limitations.',
  alternates: { canonical: '/florida' },
}

const cities = [
  { slug: 'orlando', name: 'Orlando' },
  { slug: 'tampa', name: 'Tampa' },
  { slug: 'fort-lauderdale', name: 'Fort Lauderdale' },
  { slug: 'miami', name: 'Miami' },
  { slug: 'boca-raton', name: 'Boca Raton' },
] as const

export default function FloridaHubPage() {
  return (
    <>
      <header className="hub-heading"><p className="eyebrow">Florida coverage</p><h1>Florida virtual office comparisons</h1><p>Open a city comparison to choose a need and inspect published evidence for qualifying offers. Coverage appears only where a city route is available.</p></header>
      <section className="hub-city-list" aria-labelledby="hub-city-heading"><div className="section-heading"><p className="eyebrow">City routes</p><h2 id="hub-city-heading">Compare by city</h2></div><ul>{cities.map((city) => <li key={city.slug}><Link href={`/cities/${city.slug}`}><strong>{city.name}</strong><span>Open comparison →</span></Link></li>)}</ul></section>
      <section className="hub-note" aria-labelledby="hub-note-heading"><h2 id="hub-note-heading">How city coverage works</h2><p>Each comparison keeps local availability, plan details, pricing, and supporting evidence together. A missing offer is not a claim that no provider exists; it means the evidence needed for this comparison has not been published.</p><p><Link href="/methodology">See the ranking methodology</Link>.</p></section>
    </>
  )
}
