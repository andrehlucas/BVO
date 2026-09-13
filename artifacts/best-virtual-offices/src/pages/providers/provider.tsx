import { ArticleLayout } from '@/components/content/article-layout'
import { EditorialPageNotFoundError, loadEditorialPage } from '@/content/load-editorial-page'
import NotFound from '@/pages/not-found'

interface ProviderPageProps {
  params: { slug: string }
}

function providerFor(slug: string) {
  try {
    return loadEditorialPage('providers', slug)
  } catch (error) {
    if (error instanceof EditorialPageNotFoundError) {
      return null
    }
    throw error
  }
}

export default function ProviderPage({ params }: ProviderPageProps) {
  const { slug } = params
  const page = providerFor(slug)
  if (!page) return <NotFound />;
  return <ArticleLayout page={page} sectionLabel="Provider review" />
}
