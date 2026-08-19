import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/button-link'

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

export default function HomePage() {
  return (
    <>
      <header className="home-intro">
        <div className="home-intro-copy">
          <p className="eyebrow">Compare before you commit</p>
          <h1>A “virtual office” can mean three different things.</h1>
          <p>Some plans give you a business address. Others include live call answering. A few combine both with workspace access. Compare what each provider actually includes in your Florida city, and see what may cost extra before you sign.</p>
          <ButtonLink href="/florida">Compare options in my city</ButtonLink>
        </div>
        <figure className="home-hero-visual" aria-hidden="true">
          <Image
            alt=""
            fill
            fetchPriority="high"
            priority
            sizes="(max-width: 1216px) 100vw, 1216px"
            src="/images/florida-glass-architecture.png"
          />
        </figure>
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
