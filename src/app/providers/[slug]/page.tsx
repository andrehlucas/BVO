import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/content/article-layout'
import { EditorialPageNotFoundError, listEditorialPages, loadEditorialPage } from '@/content/load-editorial-page'

interface ProviderPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const pages = await listEditorialPages('providers')
  return pages.map(({ slug }) => ({ slug }))
}

async function providerFor(slug: string) {
  try {
    return await loadEditorialPage('providers', slug)
  } catch (error) {
    if (error instanceof EditorialPageNotFoundError) notFound()
    throw error
  }
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { slug } = await params
  const page = await providerFor(slug)
  return <ArticleLayout page={page} sectionLabel="Provider review" />
}
