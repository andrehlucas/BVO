import type { MetadataRoute } from 'next'
import { listEditorialPages } from '@/content/load-editorial-page'
import { absoluteUrl } from '@/seo/site-url'
import { cities, trustRoutes } from '@/seo/public-routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [guides, providers] = await Promise.all([
    listEditorialPages('guides'),
    listEditorialPages('providers'),
  ])

  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/florida'), changeFrequency: 'weekly', priority: 0.9 },
    ...cities.map(({ slug }) => ({ url: absoluteUrl(`/cities/${slug}`), changeFrequency: 'weekly' as const, priority: 0.9 })),
    ...providers.map(({ slug, reviewedAt }) => ({ url: absoluteUrl(`/providers/${slug}`), lastModified: reviewedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...guides.map(({ slug, reviewedAt }) => ({ url: absoluteUrl(`/guides/${slug}`), lastModified: reviewedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...trustRoutes.map(({ pathname }) => ({ url: absoluteUrl(pathname), changeFrequency: 'yearly' as const, priority: 0.5 })),
  ]
}
