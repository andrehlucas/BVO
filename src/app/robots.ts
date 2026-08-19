import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/seo/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/go/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
