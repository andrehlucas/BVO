import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Link from 'next/link'
import type { Catalog } from '@/domain/catalog/types'

const analytics = vi.hoisted(() => ({ track: vi.fn(), serverTrack: vi.fn(() => Promise.resolve()) }))
const routeCatalog = vi.hoisted(() => ({
  value: {
    providers: [{ id: 'regus', websiteUrl: 'https://example.com/provider' }],
    locations: [], plans: [], evidence: [], assessments: [],
  },
}))

vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null, track: analytics.track }))
vi.mock('@vercel/analytics/server', () => ({ track: analytics.serverTrack }))
vi.mock('@/domain/catalog/load-catalog', () => ({ loadCatalog: () => routeCatalog.value }))
vi.mock('next/navigation', () => ({
  usePathname: () => '/cities/miami',
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import { ComparisonTelemetry } from '@/components/comparison/comparison-telemetry'
import { ComparisonTable } from '@/components/comparison/comparison-table'
import { LocationList } from '@/components/comparison/location-list'
import { MethodologyLink } from '@/components/comparison/methodology-link'
import { NeedSelector } from '@/components/comparison/need-selector'
import { GuideCityNavigationTelemetry } from '@/components/content/guide-city-navigation-telemetry'
import { GET } from '@/app/go/[providerId]/route'

describe('anonymous funnel analytics', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_CUSTOM_EVENTS = 'enabled'
    analytics.track.mockReset()
    analytics.serverTrack.mockClear()
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_CUSTOM_EVENTS
  })

  it('tracks completed city and ranking rendering with only allowlisted context', () => {
    render(<ComparisonTelemetry city="miami" track="address-mail" />)

    expect(analytics.track).toHaveBeenCalledWith('city_page_viewed', { city: 'miami' })
    expect(analytics.track).toHaveBeenCalledWith('ranking_viewed', { city: 'miami', journey: 'address-mail' })
  })

  it('tracks a confirmed need selection after the user makes it', async () => {
    const user = userEvent.setup()
    render(<NeedSelector selectedNeed="address-mail" city="miami" />)

    await user.click(screen.getByRole('radio', { name: /live receptionist & phone/i }))

    expect(analytics.track).toHaveBeenCalledWith('need_selected', {
      city: 'miami',
      journey: 'receptionist-phone',
    })
  })

  it('tracks explicit comparison and location expansion only after interaction', async () => {
    const user = userEvent.setup()
    const catalog = { providers: [], locations: [], plans: [], evidence: [], assessments: [] } as Catalog
    render(<><ComparisonTable catalog={catalog} city="miami" offers={[]} track="address-mail" /><LocationList catalog={catalog} citySlug="miami" track="address-mail" /></>)

    await user.click(screen.getByRole('button', { name: /open offer comparison/i }))
    await user.click(screen.getByRole('button', { name: /show provider locations/i }))

    expect(analytics.track).toHaveBeenCalledWith('comparison_opened', { city: 'miami', journey: 'address-mail' })
    expect(analytics.track).toHaveBeenCalledWith('provider_location_viewed', { city: 'miami', journey: 'address-mail' })
  })

  it('tracks methodology and guide-to-city navigation after the link is selected', async () => {
    render(<><MethodologyLink city="miami" track="address-mail" /><GuideCityNavigationTelemetry guideSlug="what-is-a-virtual-office"><Link href="/cities/miami">Compare Miami</Link></GuideCityNavigationTelemetry></>)

    for (const link of [
      screen.getByRole('link', { name: /ranking methodology/i }),
      screen.getByRole('link', { name: /compare miami/i }),
    ]) {
      const click = createEvent.click(link)
      click.preventDefault()
      fireEvent(link, click)
    }

    expect(analytics.track).toHaveBeenCalledWith('methodology_viewed', { city: 'miami', journey: 'address-mail' })
    expect(analytics.track).toHaveBeenCalledWith('guide_to_city_clicked', { city: 'miami', journey: 'what-is-a-virtual-office' })
  })

  it('does not send custom events when the hosting plan has not enabled them', () => {
    delete process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_CUSTOM_EVENTS
    render(<ComparisonTelemetry city="miami" track="address-mail" />)

    expect(analytics.track).not.toHaveBeenCalled()
  })

  it('sends a qualified affiliate click server-side before redirecting', async () => {
    const response = await GET(
      new Request('https://virtualoffice.test/go/regus?city=miami&track=address-mail&position=1'),
      { params: Promise.resolve({ providerId: 'regus' }) },
    )

    expect(response.status).toBe(302)
    expect(analytics.serverTrack).toHaveBeenCalledWith(
      'affiliate_link_clicked',
      { provider: 'regus', journey: 'miami|address-mail|1' },
    )
  })

  it('still redirects and records an unqualified click when context is missing', async () => {
    const response = await GET(new Request('https://virtualoffice.test/go/regus'), {
      params: Promise.resolve({ providerId: 'regus' }),
    })

    expect(response.status).toBe(302)
    expect(analytics.serverTrack).toHaveBeenCalledWith(
      'affiliate_link_clicked',
      { provider: 'regus', journey: 'unqualified' },
    )
  })
})
