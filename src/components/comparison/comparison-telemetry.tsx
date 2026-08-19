'use client'

import { useEffect } from 'react'
import type { ProductCity, ProductTrack } from '@/analytics/events'
import { trackProductEvent } from '@/analytics/track-event'

interface ComparisonTelemetryProps {
  city: ProductCity
  track: ProductTrack
}

export function ComparisonTelemetry({ city, track }: ComparisonTelemetryProps) {
  useEffect(() => {
    trackProductEvent({ name: 'city_page_viewed', properties: { city } })
    trackProductEvent({ name: 'ranking_viewed', properties: { city, journey: track } })
  }, [city, track])

  return null
}
