'use client'

import type { MouseEvent, ReactNode } from 'react'
import type { ProductCity } from '@/analytics/events'
import { trackProductEvent } from '@/analytics/track-event'

const cityPath = /^\/cities\/(orlando|tampa|fort-lauderdale|miami|boca-raton)$/

interface GuideCityNavigationTelemetryProps {
  guideSlug: string
  children: ReactNode
}

export function GuideCityNavigationTelemetry({ guideSlug, children }: GuideCityNavigationTelemetryProps) {
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest('a[href]')
    if (link === null) return
    const match = cityPath.exec(new URL(link.getAttribute('href') ?? '', window.location.origin).pathname)
    if (match?.[1] === undefined) return
    trackProductEvent({
      name: 'guide_to_city_clicked',
      properties: { city: match[1] as ProductCity, journey: guideSlug },
    })
  }

  return <div onClick={onClick}>{children}</div>
}
