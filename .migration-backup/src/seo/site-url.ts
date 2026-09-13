const localSiteUrl = 'http://localhost:3000'

export function getSiteUrl(): URL {
  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (vercelProductionHost ? `https://${vercelProductionHost}` : undefined)

  if (process.env.NODE_ENV !== 'production') {
    if (!configuredUrl) return new URL(localSiteUrl)

    const url = new URL(configuredUrl)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('NEXT_PUBLIC_SITE_URL must use http or https outside production')
    }

    return url
  }

  if (!configuredUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is required for production metadata')
  }

  const url = new URL(configuredUrl)
  if (url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS in production')
  }

  return url
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString()
}
