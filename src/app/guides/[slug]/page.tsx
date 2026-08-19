import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArticleLayout } from '@/components/content/article-layout'
import { EditorialPageNotFoundError, listEditorialPages, loadEditorialPage } from '@/content/load-editorial-page'

interface GuidePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const pages = await listEditorialPages('guides')
  return pages.map(({ slug }) => ({ slug }))
}

async function guideFor(slug: string) {
  try {
    return await loadEditorialPage('guides', slug)
  } catch (error) {
    if (error instanceof EditorialPageNotFoundError) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await guideFor(slug)
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/guides/${page.slug}` },
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const page = await guideFor(slug)
  return <ArticleLayout page={page} sectionLabel="Guide" />
}
