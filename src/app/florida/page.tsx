import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Virtual Offices by Florida City',
  description: 'Choose a Florida city and compare virtual office plans by service, price, add-ons, contract terms, and verified local availability.',
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
      <header className="hub-heading"><p className="eyebrow">Start with the city</p><h1>Where do you need your virtual office?</h1><p>Prices, addresses, and available services can change by location. Choose a Florida city first, then compare providers that document what they offer there.</p></header>
      <section className="hub-city-list" aria-labelledby="hub-city-heading"><div className="section-heading"><h2 id="hub-city-heading">Choose your market</h2></div><ul>{cities.map((city) => <li key={city.slug}><Link href={`/cities/${city.slug}`}><strong>{city.name}</strong><span>Compare {city.name} options →</span></Link></li>)}</ul></section>
      <section className="hub-note" aria-labelledby="hub-note-heading"><h2 id="hub-note-heading">No evidence, no assumption</h2><p>If an offer is missing, we are not saying the provider does not operate there. We are saying we could not verify enough location, plan, or pricing information to compare it responsibly.</p><p><Link href="/methodology">See how that rule shapes the rankings</Link>.</p></section>
    </>
  )
}
