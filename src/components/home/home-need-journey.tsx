'use client'

import { useState } from 'react'
import type { ProductTrack } from '@/analytics/events'
import { HomeTrackedLink } from '@/components/home/home-tracked-link'

interface CityOption {
  slug: 'orlando' | 'tampa' | 'fort-lauderdale' | 'miami' | 'boca-raton'
  name: string
}

interface NeedOption {
  description: string
  id: ProductTrack
  linkLabel: string
  title: string
}

const needs: NeedOption[] = [
  {
    id: 'address-mail',
    title: 'Keep your home address private',
    description: 'Compare business address and mail plans, including handling and forwarding details.',
    linkLabel: 'address plans',
  },
  {
    id: 'receptionist-phone',
    title: 'Make sure every business call is answered',
    description: 'Compare live receptionist plans, business numbers, routing and documented usage limits.',
    linkLabel: 'receptionist plans',
  },
  {
    id: 'full-office',
    title: 'Run mail, calls and workspace in one place',
    description: 'Compare plans that combine address, phone and physical workspace access.',
    linkLabel: 'full-service plans',
  },
]

export function HomeNeedJourney({ cities }: { cities: CityOption[] }) {
  const [selectedNeed, setSelectedNeed] = useState<ProductTrack>('address-mail')

  return (
    <ol className="home-need-list">
      {needs.map((need, index) => {
        const selected = selectedNeed === need.id
        const panelId = `home-need-cities-${need.id}`

        return (
          <li className={selected ? 'is-selected' : undefined} key={need.id}>
            <button
              aria-controls={selected ? panelId : undefined}
              aria-expanded={selected}
              className="home-need-choice"
              onClick={() => setSelectedNeed(need.id)}
              type="button"
            >
              <span className="home-need-number" aria-hidden="true">0{index + 1}</span>
              <span className="home-need-copy">
                <strong>{need.title}</strong>
                <span>{need.description}</span>
              </span>
              <span className="home-need-action" aria-hidden="true">
                {selected ? 'Choose your city' : 'Select this need'}
                <span className="home-need-arrow">→</span>
              </span>
            </button>

            {selected && (
              <div className="home-need-cities" id={panelId}>
                <div className="home-need-cities-heading">
                  <p>Where should your business show up?</p>
                  <span>Open a local comparison filtered to this service.</span>
                </div>
                <ul>
                  {cities.map((city) => (
                    <li key={city.slug}>
                      <HomeTrackedLink
                        href={`/cities/${city.slug}?need=${need.id}`}
                        journey={`city:${city.slug}`}
                      >
                        <span>{city.name}</span>
                        <strong>Compare {need.linkLabel}</strong>
                        <span aria-hidden="true">→</span>
                      </HomeTrackedLink>
                    </li>
                  ))}
                </ul>
                <p className="home-need-privacy">No signup. No contact details required.</p>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
