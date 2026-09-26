import { useRef, useState } from 'react'
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
  const [selectedNeed, setSelectedNeed] = useState<NeedOption | null>(null)
  const citiesRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const selectNeed = (need: NeedOption) => {
    setSelectedNeed(need)
    window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true })
      citiesRef.current?.scrollIntoView({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <div className="home-need-journey">
      <AppleCardCarousel
        cards={needs}
        controlsId="home-need-cities"
        onSelect={selectNeed}
        selectedId={selectedNeed?.id ?? null}
      />
      <div
        aria-labelledby="home-need-cities-heading"
        className="home-need-cities"
        hidden={!selectedNeed}
        id="home-need-cities"
        ref={citiesRef}
        role="region"
      >
        {selectedNeed && (
          <>
            <div className="home-need-cities-heading">
              <div>
                <span className="home-need-step">Step 2 of 2 / Choose a city</span>
                <h3 id="home-need-cities-heading" ref={headingRef} tabIndex={-1}>Which city do you want to compare?</h3>
              </div>
              <span aria-live="polite">Selected: {selectedNeed.category}. Choose a city to see plans.</span>
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
          </>
        )}
      </div>
    </div>
  )
}