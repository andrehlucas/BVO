'use client'

import Link from 'next/link'
import type { ProductCity, ProductTrack } from '@/analytics/events'
import { trackProductEvent } from '@/analytics/track-event'

interface MethodologyLinkProps {
  city: ProductCity
  track: ProductTrack
}

export function MethodologyLink({ city, track }: MethodologyLinkProps) {
  return <Link href="/methodology" onClick={() => trackProductEvent({ name: 'methodology_viewed', properties: { city, journey: track } })}>Ranking methodology</Link>
}
