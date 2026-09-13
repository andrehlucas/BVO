import { ArticleLayout } from '@/components/content/article-layout'
import { EditorialPageNotFoundError, loadEditorialPage } from '@/content/load-editorial-page'
import NotFound from '@/pages/not-found'

interface GuidePageProps {
  params: { slug: string }
}

function guideFor(slug: string) {
  try {
    return loadEditorialPage('guides', slug)
  } catch (error) {
    if (error instanceof EditorialPageNotFoundError) {
      return null
    }
    throw error
  }
}

export default function GuidePage({ params }: GuidePageProps) {
  const { slug } = params
  const page = guideFor(slug)
  if (!page) return <NotFound />;
  return <ArticleLayout page={page} sectionLabel="Guide" />
}
