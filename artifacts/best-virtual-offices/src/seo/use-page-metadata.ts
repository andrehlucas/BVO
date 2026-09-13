import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { loadEditorialPage, EditorialPageNotFoundError } from '@/content/load-editorial-page'
import { cities, trustRoutes } from '@/seo/public-routes'

const siteName = 'Best Virtual Offices'
const defaultDescription = 'Compare verified virtual office features, limitations, and evidence across Florida cities.'

const fixedPages: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Compare Virtual Offices in Florida by Service',
    description: 'Compare Florida virtual offices by what you need: business address and mail, live receptionist and phone, or a full office package.',
  },
  '/florida': {
    title: 'Compare Virtual Offices Across Florida',
    description: 'Choose a Florida city and compare documented virtual office services, limitations, and pricing evidence.',
  },
  '/providers': {
    title: 'Virtual Office Provider Reviews',
    description: 'Compare what each virtual office provider documents, what may cost extra, and which details still need confirmation.',
  },
  '/guides': {
    title: 'Virtual Office Buying Guides',
    description: 'Understand virtual office services, fees, contracts, and limitations before comparing providers.',
  },
  ...Object.fromEntries(trustRoutes.map((route) => [route.pathname, {
    title: route.title,
    description: route.description,
  }])),
}

export function pageMetadata(pathname: string): { title: string; description: string; noindex?: boolean } {
  const fixed = fixedPages[pathname]
  if (fixed) return fixed

  const citySlug = pathname.match(/^\/cities\/([^/]+)$/)?.[1]
  if (citySlug) {
    const city = cities.find((candidate) => candidate.slug === citySlug)
    if (city) {
      return {
        title: `Virtual Offices in ${city.name}: Compare Plans`,
        description: `Compare virtual offices in ${city.name} by address and mail, receptionist and phone, or full-office services.`,
      }
    }
  }

  for (const kind of ['providers', 'guides'] as const) {
    const slug = pathname.match(new RegExp(`^/${kind}/([^/]+)$`))?.[1]
    if (!slug) continue
    try {
      const page = loadEditorialPage(kind, slug)
      return { title: page.title, description: page.description }
    } catch (error) {
      if (!(error instanceof EditorialPageNotFoundError)) throw error
    }
  }

  return {
    title: 'Page Not Found',
    description: defaultDescription,
    noindex: true,
  }
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
}

export function usePageMetadata() {
  const [pathname] = useLocation()

  useEffect(() => {
    const metadata = pageMetadata(pathname)
    const fullTitle = metadata.title === siteName ? siteName : `${metadata.title} | ${siteName}`
    document.title = fullTitle

    upsertMeta('meta[name="description"]', { name: 'description', content: metadata.description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metadata.description })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: metadata.description })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: 'noindex' in metadata && metadata.noindex ? 'noindex, nofollow' : 'index, follow',
    })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = new URL(pathname, window.location.origin).toString()
  }, [pathname])
}