import Image from 'next/image'
import Link from 'next/link'
import type { EditorialPage } from '@/content/types'
import { JsonLd } from '@/components/seo/json-ld'
import { GlassSurface } from '@/components/ui/glass-surface'
import { absoluteUrl } from '@/seo/site-url'
import { EditorialHtml } from './editorial-html'

interface ProviderProfileLayoutProps {
  page: EditorialPage
}

interface EditorialSection {
  heading: string
  html: string
  key: string
}

interface EditorialSubsection {
  heading: string
  html: string
}

function textFromHeading(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x201C;', '“')
    .replaceAll('&#x201D;', '”')
}

function sectionKey(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[“”'’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function splitSections(html: string, level: 2 | 3): { leadHtml: string; sections: EditorialSection[] } {
  const expression = new RegExp(`<h${level}>([\\s\\S]*?)<\\/h${level}>`, 'g')
  const matches = Array.from(html.matchAll(expression))

  if (matches.length === 0) return { leadHtml: html, sections: [] }

  const firstMatch = matches[0]!
  const leadHtml = html.slice(0, firstMatch.index ?? 0).trim()
  const sections = matches.map((match, index) => {
    const heading = textFromHeading(match[1] ?? '')
    const bodyStart = (match.index ?? 0) + match[0].length
    const bodyEnd = matches[index + 1]?.index ?? html.length

    return {
      heading,
      html: html.slice(bodyStart, bodyEnd).trim(),
      key: sectionKey(heading),
    }
  })

  return { leadHtml, sections }
}

function splitSubsections(html: string): { introHtml: string; subsections: EditorialSubsection[] } {
  const { leadHtml, sections } = splitSections(html, 3)
  return {
    introHtml: leadHtml,
    subsections: sections.map(({ heading, html: subsectionHtml }) => ({ heading, html: subsectionHtml })),
  }
}

function DecisionSection({ section }: { section: EditorialSection }) {
  const { introHtml, subsections } = splitSubsections(section.html)

  return (
    <section className="provider-section provider-market" aria-labelledby={`provider-${section.key}`}>
      <div className="provider-section-heading">
        <h2 id={`provider-${section.key}`}>{section.heading}</h2>
      </div>
      <EditorialHtml html={introHtml} className="provider-market-intro provider-prose" />
      <div className="provider-decision-grid">
        {subsections.map((subsection, index) => (
          <section className={index === 0 ? 'provider-fit-panel' : 'provider-caution-panel'} key={subsection.heading}>
            <h3>{subsection.heading}</h3>
            <EditorialHtml html={subsection.html} className="provider-list-copy" />
          </section>
        ))}
      </div>
    </section>
  )
}

function AdvantagesSection({ section }: { section: EditorialSection }) {
  const { introHtml, subsections } = splitSubsections(section.html)

  return (
    <section className="provider-section provider-advantages" aria-labelledby={`provider-${section.key}`}>
      <h2 id={`provider-${section.key}`}>{section.heading}</h2>
      {introHtml ? <EditorialHtml html={introHtml} className="provider-prose" /> : null}
      <div className="provider-advantages-grid">
        {subsections.map((subsection, index) => (
          <section className={index === 0 ? 'provider-advantage-panel' : 'provider-tradeoff-panel'} key={subsection.heading}>
            <h3>{subsection.heading}</h3>
            <EditorialHtml html={subsection.html} className="provider-list-copy" />
          </section>
        ))}
      </div>
    </section>
  )
}

function EditorialContentSection({ section }: { section: EditorialSection }) {
  if (section.key === 'where-opus-fits-in-the-national-market') return <DecisionSection section={section} />
  if (section.key === 'advantages-and-tradeoffs') return <AdvantagesSection section={section} />

  if (section.key === 'the-quick-verdict') {
    return (
      <GlassSurface as="section" className="provider-section provider-verdict" aria-labelledby={`provider-${section.key}`}>
        <p className="provider-verdict-label">Editorial verdict</p>
        <h2 id={`provider-${section.key}`}>{section.heading}</h2>
        <EditorialHtml html={section.html} className="provider-prose" />
      </GlassSurface>
    )
  }

  if (section.key === 'workspace-is-available-not-universal') {
    return (
      <section className="provider-section provider-workspace" aria-labelledby={`provider-${section.key}`}>
        <figure className="provider-workspace-visual">
          <Image
            src="/images/florida-glass-architecture-card.jpg"
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 44vw"
            alt="Illustrative modern office building exterior"
          />
          <figcaption>Illustrative environment. Meeting facilities vary by address.</figcaption>
        </figure>
        <div className="provider-workspace-copy">
          <h2 id={`provider-${section.key}`}>{section.heading}</h2>
          <EditorialHtml html={section.html} className="provider-prose" />
        </div>
      </section>
    )
  }

  const classNames = [
    'provider-section',
    `provider-section--${section.key}`,
    section.key === 'the-unlimited-call-answering-question' ? 'provider-attention' : undefined,
    section.key === 'bottom-line' ? 'provider-bottom-line' : undefined,
    section.key === 'sources-reviewed' ? 'provider-sources' : undefined,
  ].filter(Boolean).join(' ')

  return (
    <section
      className={classNames}
      id={section.key === 'bottom-line' ? 'compare-locally' : undefined}
      aria-labelledby={`provider-${section.key}`}
    >
      <h2 id={`provider-${section.key}`}>{section.heading}</h2>
      <EditorialHtml html={section.html} className="provider-prose" />
    </section>
  )
}

export function ProviderProfileLayout({ page }: ProviderProfileLayoutProps) {
  const { leadHtml, sections } = splitSections(page.html, 2)

  return (
    <article className="provider-profile-page">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: page.title,
        description: page.description,
        datePublished: page.publishedAt,
        dateModified: page.reviewedAt,
        inLanguage: 'en-US',
        mainEntityOfPage: absoluteUrl(`/providers/${page.slug}`),
      }} />

      <header className="provider-profile-hero">
        <div className="provider-profile-hero-copy">
          <p className="eyebrow">National provider review</p>
          <h1>Opus Virtual Offices review</h1>
          <p className="provider-profile-deck">{page.description}</p>
          <div className="provider-profile-actions">
            <Link className="button-link button-link--primary" href="#compare-locally">Compare Florida locations</Link>
            <Link className="provider-profile-method-link" href="/methodology">Review methodology</Link>
          </div>
          <p className="provider-profile-byline">
            Published <time dateTime={page.publishedAt}>{page.publishedAt}</time>. Reviewed <time dateTime={page.reviewedAt}>{page.reviewedAt}</time> by {page.reviewer}.
          </p>
        </div>

        <figure className="provider-profile-hero-visual">
          <Image
            src="/images/opus-provider-review-hero.jpg"
            width={1448}
            height={1086}
            sizes="(max-width: 768px) 100vw, 48vw"
            priority
            alt="Illustrative virtual office reception area"
          />
          <figcaption>Editorial illustration, not an identified Opus location.</figcaption>
        </figure>
      </header>

      <dl className="provider-fact-strip">
        <div><dt>Claimed network</dt><dd>650+</dd></div>
        <div><dt>Advertised bundle</dt><dd>$99/mo</dd></div>
        <div><dt>Initial term</dt><dd>3 months</dd></div>
        <div><dt>Evidence posture</dt><dd>Verify locally</dd></div>
      </dl>

      <section className="provider-profile-content" aria-label={`${page.title} article`}>
        {leadHtml ? <EditorialHtml html={leadHtml} className="provider-prose" /> : null}
        {sections.map((section) => <EditorialContentSection key={section.key} section={section} />)}
      </section>
    </article>
  )
}
