import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { HomeComparisonSearch } from '@/components/home/home-comparison-search'
import { HomeTrackedLink } from '@/components/home/home-tracked-link'
import { listEditorialPages } from '@/content/load-editorial-page'
import type { EditorialPage } from '@/content/types'
import type { HomepageJourney } from '@/analytics/events'

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

const providerOrder = [
  ['regus', 'Regus'],
  ['opus-virtual-offices', 'Opus Virtual Offices'],
  ['alliance-virtual-offices', 'Alliance Virtual Offices'],
  ['davinci-virtual', 'Davinci Virtual'],
] as const

const guideOrder = [
  'what-is-a-virtual-office',
  'hidden-fees-in-virtual-office-plans',
  'mail-handling-vs-live-receptionist',
] as const

const providerJourneyBySlug: Record<string, HomepageJourney> = {
  regus: 'provider:regus',
  'opus-virtual-offices': 'provider:opus-virtual-offices',
  'alliance-virtual-offices': 'provider:alliance-virtual-offices',
  'davinci-virtual': 'provider:davinci-virtual',
}

const guideJourneyBySlug: Record<string, HomepageJourney> = {
  'what-is-a-virtual-office': 'guide:what-is-a-virtual-office',
  'hidden-fees-in-virtual-office-plans': 'guide:hidden-fees-in-virtual-office-plans',
  'mail-handling-vs-live-receptionist': 'guide:mail-handling-vs-live-receptionist',
}

function homepageJourneyFor(map: Record<string, HomepageJourney>, slug: string): HomepageJourney {
  const journey = map[slug]
  if (!journey) throw new Error(`Missing homepage analytics journey for ${slug}`)
  return journey
}

function orderedEditorialPages<T extends readonly string[]>(pages: EditorialPage[], slugs: T) {
  const pageBySlug = new Map(pages.map((page) => [page.slug, page]))
  return slugs.flatMap((slug) => {
    const page = pageBySlug.get(slug)
    return page ? [page] : []
  })
}

function reviewDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export default async function HomePage() {
  const [reviewedProviders, reviewedGuides] = await Promise.all([
    listEditorialPages('providers'),
    listEditorialPages('guides'),
  ])
  const providerPages = orderedEditorialPages(reviewedProviders, providerOrder.map(([slug]) => slug))
  const guidePages = orderedEditorialPages(reviewedGuides, guideOrder)

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
      <section className="home-section home-needs" aria-labelledby="home-needs-heading" data-home-section="needs">
        <div className="home-section-heading">
          <p className="eyebrow">Start with the job</p>
          <h2 id="home-needs-heading">Choose the service before you compare the price</h2>
          <p>An address plan and a receptionist plan solve different problems. Pick the job first so you do not pay for the wrong package.</p>
        </div>
        <ol className="home-need-list">
          <li>
            <div><strong>Protect your home address</strong><p>Business address, mail receipt and available mail handling.</p></div>
            <a href="#compare-by-city">Choose a city <span aria-hidden="true">↓</span></a>
          </li>
          <li>
            <div><strong>Stop missing business calls</strong><p>Live answering, business number and call routing.</p></div>
            <a href="#compare-by-city">Choose a city <span aria-hidden="true">↓</span></a>
          </li>
          <li>
            <div><strong>Handle mail, calls and occasional workspace</strong><p>A verified combination of address, phone and physical access.</p></div>
            <a href="#compare-by-city">Choose a city <span aria-hidden="true">↓</span></a>
          </li>
        </ol>
      </section>

      <section className="home-section home-markets" id="compare-by-city" aria-labelledby="home-markets-heading" data-home-section="cities">
        <div className="home-section-heading">
          <p className="eyebrow">Compare locally</p>
          <h2 id="home-markets-heading">Find the right option in your Florida city</h2>
          <p>Availability, pricing and address choices change by location. Start where your business needs to show up.</p>
        </div>
        <ul className="home-market-grid">
          {cities.map(([slug, name]) => (
            <li key={slug}>
              <HomeTrackedLink href={`/cities/${slug}`} journey={`city:${slug}`}>
                <span aria-hidden="true">Florida city</span>
                <strong>Compare {name} options</strong>
                <span aria-hidden="true">→</span>
              </HomeTrackedLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section home-costs" aria-labelledby="home-costs-heading" data-home-section="costs">
        <div className="home-costs-intro">
          <p className="eyebrow">Read beyond the rate</p>
          <h2 id="home-costs-heading">Avoid the fees that change the real price</h2>
          <p>Headline rates may leave out setup, forwarding, call overages, workspace and renewal costs. We separate them before you compare.</p>
          <HomeTrackedLink href="/guides/hidden-fees-in-virtual-office-plans" journey="guide:hidden-fees-in-virtual-office-plans">See what can cost extra <span aria-hidden="true">→</span></HomeTrackedLink>
        </div>
        <ol className="home-cost-grid">
          {['Monthly rate', 'Setup and activation', 'Mail handling', 'Receptionist usage', 'Workspace access', 'Contract and renewal'].map((cost, index) => (
            <li key={cost}><span>0{index + 1}</span>{cost}</li>
          ))}
        </ol>
      </section>

      <section className="home-section home-providers" aria-labelledby="home-providers-heading" data-home-section="providers">
        <div className="home-section-heading">
          <p className="eyebrow">Provider reviews</p>
          <h2 id="home-providers-heading">See how the four providers really differ</h2>
          <p>The same label can describe four different products. Review what each provider documents before comparing its price.</p>
        </div>
        <div className="home-provider-grid">
          {providerPages.map((provider) => {
            const name = providerOrder.find(([slug]) => slug === provider.slug)?.[1] ?? provider.title
            return (
              <article className="home-provider-profile" key={provider.slug}>
                <div>
                  <p className="home-provider-reviewed">Reviewed <time dateTime={provider.reviewedAt}>{reviewDate(provider.reviewedAt)}</time></p>
                  <h3>{name}</h3>
                  <p>{provider.description}</p>
                </div>
                <HomeTrackedLink href={`/providers/${provider.slug}`} journey={homepageJourneyFor(providerJourneyBySlug, provider.slug)}>Read the {name} review <span aria-hidden="true">→</span></HomeTrackedLink>
              </article>
            )
          })}
        </div>
      </section>

      <section className="home-section home-method" aria-labelledby="home-method-heading" data-home-section="methodology">
        <div className="home-method-panel">
          <div className="home-section-heading">
            <p className="eyebrow">The reasoning is visible</p>
            <h2 id="home-method-heading">See why one offer ranks above another</h2>
            <p>Every recommendation must trace back to comparable services, published evidence and visible limitations.</p>
          </div>
          <dl className="home-method-grid">
            <div><dt>Like-for-like comparisons</dt><dd>Address plans compete with address plans. Receptionist plans compete with receptionist plans.</dd></div>
            <div><dt>Unknown stays unknown</dt><dd>Missing prices or allowances do not become estimates.</dd></div>
            <div><dt>Rankings cannot access affiliate data</dt><dd>Commercial relationships remain outside the scoring domain.</dd></div>
          </dl>
          <div className="home-method-actions">
            <HomeTrackedLink href="/methodology" journey="methodology">Review the ranking method <span aria-hidden="true">→</span></HomeTrackedLink>
            <HomeTrackedLink href="/affiliate-disclosure" journey="affiliate-disclosure">See how affiliate links work</HomeTrackedLink>
          </div>
        </div>
      </section>

      <section className="home-section home-guides" aria-labelledby="home-guides-heading" data-home-section="guides">
        <div className="home-section-heading">
          <p className="eyebrow">Prepare your comparison</p>
          <h2 id="home-guides-heading">Compare with a checklist, not a guess</h2>
          <p>Know which questions change the bill, the contract and the service you receive.</p>
        </div>
        <ul className="home-guide-list">
          {guidePages.map((guide, index) => (
            <li key={guide.slug}>
              <span>0{index + 1}</span>
              <HomeTrackedLink href={`/guides/${guide.slug}`} journey={homepageJourneyFor(guideJourneyBySlug, guide.slug)}>
                <strong>{guide.title}</strong>
                <span>Read the guide <span aria-hidden="true">→</span></span>
              </HomeTrackedLink>
            </li>
          ))}
        </ul>
        <div className="home-final-cta">
          <div><h3>Ready to compare?</h3><p>Choose a Florida city and see which offers match the service you need.</p></div>
          <Link className="button-link button-link--primary" href="/florida">Compare Florida options <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  )
}
