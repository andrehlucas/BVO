'use client'

import { useState } from 'react'
import type { ProductCity, ProductTrack } from '@/analytics/events'
import { trackProductEvent } from '@/analytics/track-event'
import type { Catalog } from '@/domain/catalog/types'

interface LocationListProps { catalog: Catalog; citySlug: ProductCity; track: ProductTrack }

export function LocationList({ catalog, citySlug, track }: LocationListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const providers = new Map(catalog.providers.map((provider) => [provider.id, provider]))
  const locations = catalog.locations.filter((location) => location.citySlug === citySlug)
  return <section className="location-list" aria-labelledby="location-list-heading"><div className="section-heading"><h2 id="location-list-heading">Where these providers operate</h2></div><button aria-expanded={isOpen} onClick={() => {
    if (!isOpen) {
      setIsOpen(true)
      trackProductEvent({ name: 'provider_location_viewed', properties: { city: citySlug, journey: track } })
    }
  }} type="button">See provider addresses</button>{isOpen && (locations.length === 0 ? <p className="empty-state">We have not verified a local provider address for this city yet.</p> : <ul>{locations.map((location) => <li key={location.id}><strong>{providers.get(location.providerId)?.name ?? location.providerId}</strong><span>{location.address}</span><span>{location.availability === 'available' ? 'Location confirmed by a current source' : location.availability === 'not_confirmed' ? 'Current availability not confirmed' : 'Currently unavailable'}</span></li>)}</ul>)}</section>
}
