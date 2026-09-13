import { useEffect } from 'react'
import { useParams } from 'wouter'
import { useSearchParams } from '@/hooks/use-next-navigation'
import { affiliateClickEvent, isProductProvider } from '@/analytics/events'
import { resolveOutboundUrl } from '@/commercial/resolve-outbound-url'
import { loadCatalog } from '@/domain/catalog/load-catalog'
import { trackClientProductEvent } from '@/analytics/track-event'

export default function GoRedirect() {
  const params = useParams()
  const searchParams = useSearchParams()
  const providerId = params.providerId || ''

  useEffect(() => {
    const provider = loadCatalog().providers.find((p) => p.id === providerId)
    if (!provider) return

    if (isProductProvider(provider.id)) {
      trackClientProductEvent(
        affiliateClickEvent(
          provider.id,
          searchParams.get('city') || null,
          searchParams.get('track') || null,
          searchParams.get('position') || null,
        ),
      )
    }

    window.location.replace(resolveOutboundUrl(provider.id, provider.websiteUrl))
  }, [providerId, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to provider...</p>
    </div>
  )
}
