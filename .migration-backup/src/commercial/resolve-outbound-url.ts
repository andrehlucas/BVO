import affiliateLinksConfig from '../../config/affiliate-links.json'
import { affiliateLinksSchema } from './affiliate-link-schema'

function toHttpsUrl(value: string): URL {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('Outbound URLs must be valid HTTPS URLs')
  }

  if (url.protocol !== 'https:') {
    throw new Error('Outbound URLs must use HTTPS')
  }

  return url
}

export function resolveOutboundUrl(providerId: string, fallbackUrl: string): URL {
  const affiliateLinks = affiliateLinksSchema.parse(affiliateLinksConfig)
  const activeAffiliateLink = affiliateLinks.find(
    (affiliateLink) => affiliateLink.providerId === providerId && affiliateLink.active,
  )
  const destination = toHttpsUrl(activeAffiliateLink?.destinationUrl ?? fallbackUrl)

  for (const [key, value] of Object.entries(activeAffiliateLink?.trackingParameters ?? {})) {
    destination.searchParams.set(key, value)
  }

  return destination
}
