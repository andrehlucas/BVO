const localSiteUrl = 'http://localhost:3000'

export function getSiteUrl(): URL {
  const configuredUrl = import.meta.env.VITE_SITE_URL
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : undefined

  if (!configuredUrl) {
    return new URL(browserOrigin ?? localSiteUrl)
  }

  const url = new URL(configuredUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_SITE_URL must use HTTP or HTTPS')
  }

  return url
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString()
}