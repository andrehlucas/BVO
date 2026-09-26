import { useState } from 'react'
import type { ProductTrack } from '@/analytics/events'
import { HomeTrackedLink } from '@/components/home/home-tracked-link'
import AppleCardCarousel from '@/components/ui/carousel-08'

interface CityOption {
  slug: 'orlando' | 'tampa' | 'fort-lauderdale' | 'miami' | 'boca-raton'
  name: string
}

interface NeedOption {
  category: string
  description: string
  id: ProductTrack
  imageSrc: string
  linkLabel: string
  title: string
}

const needs: NeedOption[] = [
  {
    id: 'address-mail',
    category: 'Address & mail',
    title: 'Use a business address for mail',
    description: 'Compare address plans and check what’s included for mail receipt, forwarding, and handling.',
    imageSrc: '/images/bvo-carousel-mail.jpg',
    linkLabel: 'address & mail plans',
  },
  {
    id: 'receptionist-phone',
    category: 'Receptionist & phone',
    title: 'Have calls answered by a receptionist',
    description: 'Compare live answering, business numbers, call routing, and published usage limits.',
    imageSrc: '/images/bvo-carousel-receptionist.jpg',
    linkLabel: 'receptionist plans',
  },
  {
    id: 'full-office',
    category: 'Full virtual office',
    title: 'Bring address, calls, and workspace together',
    description: 'Compare bundled services and check where access or usage may be limited.',
    imageSrc: '/images/bvo-carousel-workspace.jpg',
    linkLabel: 'full-service plans',
  },
]

export function HomeNeedJourney({ cities }: { cities: CityOption[] }) {
  const [selectedNeed, setSelectedNeed] = useState<NeedOption>(needs[0])

  return (
    <div className="home-need-journey">
      <AppleCardCarousel
        cards={needs}
        controlsId="home-need-cities"
        onSelect={(need: NeedOption) => setSelectedNeed(need)}
        selectedId={selectedNeed.id}
      />
      <div aria-labelledby="home-need-cities-heading" className="home-need-cities" id="home-need-cities" role="region">
        <div className="home-need-cities-heading">
          <div>
            <span className="home-need-step">Next / choose a city</span>
            <p id="home-need-cities-heading">Which city do you want to compare?</p>
          </div>
          <span aria-live="polite">Showing {selectedNeed.linkLabel} by city.</span>
        </div>
        <ul>
          {cities.map((city) => (
            <li key={city.slug}>
              <HomeTrackedLink
                href={`/cities/${city.slug}?need=${selectedNeed.id}`}
                journey={`city:${city.slug}`}
              >
                <span>{city.name}</span>
                <strong>Compare {selectedNeed.linkLabel}</strong>
                <span aria-hidden="true">→</span>
              </HomeTrackedLink>
            </li>
          ))}
        </ul>
        <p className="home-need-privacy">No signup. No contact details required.</p>
      </div>
    </div>
  )
}