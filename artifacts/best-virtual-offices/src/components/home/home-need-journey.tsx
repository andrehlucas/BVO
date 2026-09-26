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
    title: 'Use a business address for mail',
    description: 'Compare address plans and check what’s included for mail receipt, forwarding, and handling.',
    linkLabel: 'address & mail plans',
  },
  {
    id: 'receptionist-phone',
    title: 'Have calls answered by a receptionist',
    description: 'Compare live answering, business numbers, call routing, and published usage limits.',
    linkLabel: 'receptionist plans',
  },
  {
    id: 'full-office',
    title: 'Bring address, calls, and workspace together',
    description: 'Compare bundled services and check where access or usage may be limited.',
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
                {selected ? 'Choose a city' : 'Choose this need'}
                <span className="home-need-arrow">→</span>
              </span>
            </button>

            {selected && (
              <div className="home-need-cities" id={panelId}>
                <div className="home-need-cities-heading">
                  <p>Which city do you want to compare?</p>
                  <span>See local providers and plans for this service.</span>
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