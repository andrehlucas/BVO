import Link from 'next/link'
import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/button-link'

export const metadata: Metadata = {
  title: 'Compare virtual offices in Florida',
  description: 'Compare verified virtual office features, limitations, and evidence across five Florida cities.',
  alternates: { canonical: '/' },
}

const cities = [
  ['orlando', 'Orlando'],
  ['tampa', 'Tampa'],
  ['fort-lauderdale', 'Fort Lauderdale'],
  ['miami', 'Miami'],
  ['boca-raton', 'Boca Raton'],
] as const

export default function HomePage() {
  return (
    <>
      <header className="home-intro">
        <p className="eyebrow">Florida virtual office comparison</p>
        <h1>Compare virtual offices in Florida</h1>
        <p>Choose a city, identify the service you need, and compare only functionally equivalent offers with their evidence, costs, add-ons, and limits visible.</p>
        <ButtonLink href="/florida">Choose a Florida city</ButtonLink>
      </header>
      <section className="home-city-list" aria-labelledby="home-city-heading">
        <div className="section-heading"><p className="eyebrow">Start local</p><h2 id="home-city-heading">Five Florida city comparisons</h2></div>
        <ul>{cities.map(([slug, name]) => <li key={slug}><Link href={`/cities/${slug}`}>{name}<span aria-hidden="true">→</span></Link></li>)}</ul>
      </section>
      <section className="product-explainer" aria-labelledby="product-explainer-heading">
        <div className="section-heading"><p className="eyebrow">Compare like with like</p><h2 id="product-explainer-heading">“Virtual office” can mean three different products</h2></div>
        <dl>
          <div><dt>Address &amp; mail</dt><dd>A business address, mail receiving, and optional handling services.</dd></div>
          <div><dt>Live receptionist &amp; phone</dt><dd>Human answering, a business number, and call handling.</dd></div>
          <div><dt>Full virtual office</dt><dd>A compatible combination of address, mail, answering, and workspace access.</dd></div>
        </dl>
      </section>
      <section className="trust-statement" aria-labelledby="trust-statement-heading">
        <h2 id="trust-statement-heading">Built for a decision you can inspect</h2>
        <p>Rankings use verified product evidence and do not change based on affiliate relationships. We do not ask for an account or personal contact details to use the comparator.</p>
        <p><Link href="/methodology">Read the methodology</Link> or <Link href="/guides/what-is-a-virtual-office">start with the core guide</Link>.</p>
      </section>
    </>
  )
}
