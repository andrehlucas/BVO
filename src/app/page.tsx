import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { HomeComparisonSearch } from '@/components/home/home-comparison-search'

export const metadata: Metadata = {
  title: 'Compare Virtual Offices in Florida by Service',
  description: 'Compare Florida virtual offices by what you need: business address and mail, live receptionist and phone, or a full office package.',
  alternates: { canonical: '/' },
}

const cities = [
  ['orlando', 'Orlando'],
  ['tampa', 'Tampa'],
  ['fort-lauderdale', 'Fort Lauderdale'],
  ['miami', 'Miami'],
  ['boca-raton', 'Boca Raton'],
] as const

const miamiBuildings = [1, 2, 3, 4, 5] as const

export default function HomePage() {
  return (
    <>
      <header className="home-intro">
        <div className="home-intro-copy">
          <p className="home-intro-kicker"><span aria-hidden="true">●</span> Compare before you commit</p>
          <h1>Compare virtual offices by what you actually need</h1>
          <p>See what is included, what costs extra, and what providers have not confirmed.</p>
          <HomeComparisonSearch cities={cities.map(([slug, name]) => ({ slug, name }))} />
        </div>
        <div className="home-map" aria-label="Illustrated map of Miami with office buildings">
          <Image
            alt=""
            className="home-map-background"
            fill
            sizes="(max-width: 1216px) 100vw, 1216px"
            src="/images/miami-map-light.jpg"
          />
          {miamiBuildings.map((building) => (
            <span aria-hidden="true" className={`home-building-marker home-building-marker--${building}`} key={building}>
              <Image alt="" fill sizes="4rem" src={`/images/miami-building-${building}.jpg`} />
            </span>
          ))}
          <article className="home-featured-city">
            <div className="home-featured-image">
              <Image alt="Modern waterfront office building in Miami" fill sizes="(max-width: 767px) 82vw, 22rem" src="/images/miami-building-3.jpg" />
            </div>
            <div className="home-featured-copy">
              <h2>Compare Miami virtual offices</h2>
              <p>Address, mail, receptionist, and workspace details in one place.</p>
              <Link href="/cities/miami">View Miami options <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        </div>
        <dl className="home-proof-strip">
          <div><dt>4</dt><dd>providers reviewed</dd></div>
          <div><dt>5</dt><dd>Florida cities</dd></div>
          <div><dt>Zero</dt><dd>lead forms</dd></div>
          <div><dt>Independent</dt><dd>ranking logic</dd></div>
        </dl>
      </header>
      <section className="home-city-list" aria-labelledby="home-city-heading">
        <div className="section-heading"><h2 id="home-city-heading">Where do you need a business presence?</h2></div>
        <ul>{cities.map(([slug, name]) => <li key={slug}><Link href={`/cities/${slug}`}>{name}<span aria-hidden="true">→</span></Link></li>)}</ul>
      </section>
      <section className="product-explainer" aria-labelledby="product-explainer-heading">
        <div className="section-heading"><h2 id="product-explainer-heading">Compare the service you actually need</h2></div>
        <dl>
          <div><dt>Address &amp; mail</dt><dd>Receive business mail without publishing your home address.</dd></div>
          <div><dt>Live receptionist &amp; phone</dt><dd>Have calls answered in your business name and routed to you.</dd></div>
          <div><dt>Full virtual office</dt><dd>Combine an address, call handling, and occasional workspace in one compatible setup.</dd></div>
        </dl>
      </section>
      <section className="trust-statement" aria-labelledby="trust-statement-heading">
        <h2 id="trust-statement-heading">Know what you are paying for before you choose</h2>
        <p>See what is included, what costs extra, and what a provider has not confirmed. No signup or lead form. Affiliate relationships never change the rankings.</p>
        <p><Link href="/methodology">See how we rank offers</Link> or <Link href="/guides/what-is-a-virtual-office">learn what “virtual office” really covers</Link>.</p>
      </section>
    </>
  )
}
