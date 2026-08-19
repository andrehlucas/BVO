import { GlassSurface } from '@/components/ui/glass-surface'
import type { EditorialPage } from '@/content/types'

interface ArticleLayoutProps {
  page: EditorialPage
  sectionLabel: string
}

export function ArticleLayout({ page, sectionLabel }: ArticleLayoutProps) {
  return (
    <article className="article-layout">
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
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      </GlassSurface>
    </article>
  )
}
