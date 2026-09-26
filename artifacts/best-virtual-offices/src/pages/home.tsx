import { Link } from 'wouter'
import Image from '@/components/ui/image'

import { HomeComparisonSearch } from '@/components/home/home-comparison-search'
import { HomeNeedJourney } from '@/components/home/home-need-journey'
import { HomeTrackedLink } from '@/components/home/home-tracked-link'
import { listEditorialPages } from '@/content/load-editorial-page'
import type { EditorialPage } from '@/content/types'
import type { HomepageJourney } from '@/analytics/events'

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

export default function HomePage() {
  const [reviewedProviders, reviewedGuides] = [listEditorialPages('providers'), listEditorialPages('guides')]
  const providerPages = orderedEditorialPages(reviewedProviders, providerOrder.map(([slug]) => slug))
  const guidePages = orderedEditorialPages(reviewedGuides, guideOrder)

  return (
    <>
      <header className="home-intro">
        <div className="home-intro-copy">
          <p className="home-intro-kicker"><span aria-hidden="true">●</span> Make a more informed choice</p>
          <h1>Compare virtual offices by the services your business needs</h1>
          <p>See what’s included, spot extra fees, and know where provider details are still missing.</p>
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
              <Image alt="Illustrative Miami waterfront office architecture" fill sizes="(max-width: 767px) 82vw, 22rem" src="/images/bvo-miami-feature.jpg" />
            </div>
            <div className="home-featured-copy">
              <p className="home-featured-location">
                <svg aria-hidden="true" viewBox="0 0 16 16">
                  <path d="M12 6.5c0 4-4 7-4 7s-4-3-4-7a4 4 0 1 1 8 0Z" />
                  <circle cx="8" cy="6.5" r="1.25" />
                </svg>
                Miami, Florida
              </p>
              <h2>Virtual office options in Miami</h2>
              <p>Compare address, mail, phone, and workspace services side by side.</p>
              <ul aria-label="Services to compare" className="home-featured-services">
                <li>Address</li>
                <li>Mail</li>
                <li>Phone</li>
                <li>Workspace</li>
              </ul>
              <Link className="home-featured-link" href="/cities/miami">
                <span>Compare Miami options</span>
                <span aria-hidden="true" className="home-featured-link-icon">→</span>
              </Link>
            </div>
          </article>
        </div>
        <dl className="home-proof-strip">
          <div><dt>4</dt><dd>providers reviewed</dd></div>
          <div><dt>5</dt><dd>Florida cities</dd></div>
          <div><dt>Zero</dt><dd>lead forms</dd></div>
          <div><dt>Independent</dt><dd>rankings</dd></div>
        </dl>
      </header>
      <section className="home-section home-needs" aria-labelledby="home-needs-heading" data-home-section="needs">
        <div className="home-section-heading">
          <p className="eyebrow">Start with the service</p>
          <h2 id="home-needs-heading">Choose what you need. Compare plans that document it.</h2>
          <p>See local providers, what each plan includes, and where details are missing.</p>
        </div>
        <HomeNeedJourney cities={cities.map(([slug, name]) => ({ slug, name }))} />
      </section>

      <section className="home-section home-markets" id="compare-by-city" aria-labelledby="home-markets-heading" data-home-section="cities">
        <div className="home-section-heading">
          <p className="eyebrow">Compare local plans</p>
          <h2 id="home-markets-heading">Find virtual office options in your city</h2>
          <p>Prices, locations, and available services vary by city. Choose a market to see local options.</p>
        </div>
        <ul className="home-market-grid">
          {cities.map(([slug, name]) => (
            <li key={slug}>
              <HomeTrackedLink href={`/cities/${slug}`} journey={`city:${slug}`}>
                <span aria-hidden="true">Local comparison</span>
                <strong>Compare {name} options</strong>
                <span aria-hidden="true">→</span>
              </HomeTrackedLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section home-costs" aria-labelledby="home-costs-heading" data-home-section="costs">
        <div className="home-costs-intro">
          <p className="eyebrow">See the full cost</p>
          <h2 id="home-costs-heading">Know what a plan really costs</h2>
          <p>Monthly rates may not include setup, mail forwarding, call overages, workspace access, or renewal fees. Check each cost before you choose.</p>
          <HomeTrackedLink href="/guides/hidden-fees-in-virtual-office-plans" journey="guide:hidden-fees-in-virtual-office-plans">Check for extra fees <span aria-hidden="true">→</span></HomeTrackedLink>
        </div>
        <ol className="home-cost-grid">
          {['Monthly rate', 'Setup and activation', 'Mail handling', 'Receptionist usage', 'Workspace access', 'Contract and renewal'].map((cost, index) => (
            <li key={cost}><span>0{index + 1}</span>{cost}</li>
          ))}
        </ol>
      </section>

      <section className="home-section home-providers" aria-labelledby="home-providers-heading" data-home-section="providers">
        <div className="home-section-heading">
          <p className="eyebrow">Independent provider reviews</p>
          <h2 id="home-providers-heading">Know what each provider includes</h2>
          <p>Plans with similar names can differ. Check each provider’s published services, limits, and evidence before comparing prices.</p>
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
          <p className="eyebrow">How we rank</p>
          <h2 id="home-method-heading">See how every offer earns its place</h2>
          <p>We compare like-for-like services and published evidence. If a price or allowance is missing, we mark it unknown—not guess.</p>
          </div>
          <dl className="home-method-grid">
            <div><dt>Compare like with like</dt><dd>Address plans are ranked against address plans; receptionist plans against receptionist plans.</dd></div>
            <div><dt>Missing details stay missing</dt><dd>If a provider hasn’t published a price or allowance, we don’t fill the gap with an estimate.</dd></div>
            <div><dt>Affiliate relationships stay separate</dt><dd>Commercial relationships don’t change the scoring or rankings.</dd></div>
          </dl>
          <div className="home-method-actions">
            <HomeTrackedLink href="/methodology" journey="methodology">See our ranking method <span aria-hidden="true">→</span></HomeTrackedLink>
            <HomeTrackedLink href="/affiliate-disclosure" journey="affiliate-disclosure">Read our affiliate disclosure</HomeTrackedLink>
          </div>
        </div>
      </section>

      <section className="home-section home-guides" aria-labelledby="home-guides-heading" data-home-section="guides">
        <div className="home-section-heading">
          <p className="eyebrow">Make an informed choice</p>
          <h2 id="home-guides-heading">Know what to ask before you compare</h2>
          <p>Get clear on the fees, terms, and service details that can change what you pay and what you receive.</p>
        </div>
        <ul className="home-guide-list">
          {guidePages.map((guide, index) => (
            <li key={guide.slug}>
              <span>0{index + 1}</span>
              <HomeTrackedLink href={`/guides/${guide.slug}`} journey={homepageJourneyFor(guideJourneyBySlug, guide.slug)}>
                <strong>{guide.title}</strong>
                <span>Read guide <span aria-hidden="true">→</span></span>
              </HomeTrackedLink>
            </li>
          ))}
        </ul>
        <div className="home-final-cta">
          <div><h3>Find a plan that fits your business</h3><p>Compare Florida options by service, cost, and contract flexibility. No contact form required.</p></div>
          <Link className="button-link button-link--primary" href="/florida">Compare virtual offices <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  )
}
