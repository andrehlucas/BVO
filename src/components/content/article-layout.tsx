import { GlassSurface } from '@/components/ui/glass-surface'
import type { EditorialPage } from '@/content/types'
import { GuideCityNavigationTelemetry } from './guide-city-navigation-telemetry'
import { JsonLd } from '@/components/seo/json-ld'
import { absoluteUrl } from '@/seo/site-url'

interface ArticleLayoutProps {
  page: EditorialPage
  sectionLabel: string
}

export function ArticleLayout({ page, sectionLabel }: ArticleLayoutProps) {
  return (
    <article className="article-layout">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: page.title,
        description: page.description,
        datePublished: page.publishedAt,
        dateModified: page.reviewedAt,
        inLanguage: 'en-US',
        mainEntityOfPage: absoluteUrl(`/${sectionLabel === 'Guide' ? 'guides' : 'providers'}/${page.slug}`),
      }} />
      <header className="article-heading">
        <p className="eyebrow">{sectionLabel}</p>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <dl className="article-meta">
          <div><dt>Published</dt><dd><time dateTime={page.publishedAt}>{page.publishedAt}</time></dd></div>
          <div><dt>Reviewed</dt><dd><time dateTime={page.reviewedAt}>{page.reviewedAt}</time></dd></div>
          <div><dt>Reviewer</dt><dd>{page.reviewer}</dd></div>
        </dl>
      </header>
      <GlassSurface as="section" aria-label={`${page.title} article`} className="article-body">
        {sectionLabel === 'Guide'
          ? <GuideCityNavigationTelemetry guideSlug={page.slug}><div dangerouslySetInnerHTML={{ __html: page.html }} /></GuideCityNavigationTelemetry>
          : <div dangerouslySetInnerHTML={{ __html: page.html }} />}
      </GlassSurface>
    </article>
  )
}
