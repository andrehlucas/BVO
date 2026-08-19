import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { Catalog } from '@/domain/catalog/types'
import { validCatalogFixture } from '../fixtures/catalog'

const mocked = vi.hoisted(() => ({
  catalog: undefined as Catalog | undefined,
  notFound: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: mocked.notFound,
  usePathname: () => '/cities/miami',
  useRouter: () => ({ replace: mocked.replace }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/domain/catalog/load-catalog', () => ({
  loadCatalog: () => mocked.catalog,
}))

import CityPage, { generateStaticParams } from '@/app/cities/[city]/page'

const money = (amountCents: number) => ({ amountCents, currency: 'USD' as const, billingPeriod: 'month' as const })

const catalogForComparison = (): Catalog => {
  const catalog = structuredClone(validCatalogFixture) as Catalog
  const baseProvider = catalog.providers[0]!
  const baseLocation = catalog.locations[0]!
  const baseEvidence = catalog.evidence
  const commonFeatures = [
    { feature: 'business_address' as const, state: 'included' as const },
    { feature: 'mail_receiving' as const, state: 'included' as const },
  ]

  catalog.providers = ['example-office', 'second-office', 'quote-office'].map((id, index) => ({
    ...baseProvider,
    id,
    slug: id,
    name: ['Example Office', 'Second Office', 'Quote Office'][index]!,
  }))
  catalog.locations = catalog.providers.map((provider) => ({
    ...baseLocation,
    id: `miami-${provider.id}`,
    providerId: provider.id,
  }))
  catalog.evidence = [
    ...baseEvidence,
    ...catalog.providers.slice(1).flatMap((provider) => [
      { ...baseEvidence[0]!, id: `${provider.id}-provider`, entityId: provider.id },
      { ...baseEvidence[1]!, id: `${provider.id}-location`, entityId: `miami-${provider.id}` },
      { ...baseEvidence[2]!, id: `${provider.id}-plan`, entityId: `${provider.id}-plan` },
    ]),
  ]
  catalog.providers = catalog.providers.map((provider) => ({
    ...provider,
    evidenceIds: provider.id === 'example-office' ? baseProvider.evidenceIds : [`${provider.id}-provider`],
  }))
  catalog.locations = catalog.locations.map((location) => ({
    ...location,
    evidenceIds: location.providerId === 'example-office' ? baseLocation.evidenceIds : [`${location.providerId}-location`],
  }))
  catalog.plans = [
    {
      ...catalog.plans[0]!,
      id: 'example-office-plan',
      providerId: 'example-office',
      locationIds: ['miami-example-office'],
      name: 'Address & Mail',
      features: [...commonFeatures, { feature: 'mail_forwarding', state: 'included' }],
    },
    {
      ...catalog.plans[0]!,
      id: 'second-office-plan',
      providerId: 'second-office',
      locationIds: ['miami-second-office'],
      name: 'Address with forwarding add-on',
      basePrice: money(10900),
      features: [...commonFeatures, { feature: 'mail_forwarding', state: 'paid_add_on', price: money(1000) }],
      evidenceIds: ['second-office-plan'],
    },
    {
      ...catalog.plans[0]!,
      id: 'quote-office-plan',
      providerId: 'quote-office',
      locationIds: ['miami-quote-office'],
      name: 'Quote-only address',
      basePrice: null,
      quoteRequired: true,
      features: commonFeatures,
      evidenceIds: ['quote-office-plan'],
    },
  ]
  return catalog
}

describe('Miami city comparison', () => {
  beforeEach(() => {
    mocked.catalog = catalogForComparison()
    mocked.notFound.mockReset()
    mocked.replace.mockReset()
  })

  it('builds static routes for all five Florida cities', () => {
    expect(generateStaticParams()).toEqual([
      { city: 'orlando' },
      { city: 'tampa' },
      { city: 'fort-lauderdale' },
      { city: 'miami' },
      { city: 'boca-raton' },
    ])
  })

  it('rejects a city outside the published route allowlist', async () => {
    mocked.notFound.mockImplementation(() => { throw new Error('not found') })

    await expect(CityPage({ params: Promise.resolve({ city: 'jacksonville' }), searchParams: Promise.resolve({}) }))
      .rejects.toThrow('not found')
    expect(mocked.notFound).toHaveBeenCalledOnce()
  })

  it('renders the evidence-ledger comparison workflow and URL-backed controls', async () => {
    const user = userEvent.setup()
    const page = await CityPage({ params: Promise.resolve({ city: 'miami' }), searchParams: Promise.resolve({}) })
    render(page)

    expect(screen.getByRole('heading', { name: /virtual offices in miami/i })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /what do you need most/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /address & mail/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /live receptionist & phone/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /full virtual office/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /i'm not sure/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /comparison ranking tracks/i })).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /live receptionist & phone/i }))
    expect(mocked.replace).toHaveBeenLastCalledWith('/cities/miami?need=receptionist-phone', { scroll: false })

    await user.click(screen.getByRole('checkbox', { name: /mail forwarding/i }))
    expect(mocked.replace).toHaveBeenLastCalledWith('/cities/miami?mailForwarding=yes', { scroll: false })

    const results = screen.getByRole('region', { name: /^ranked offers$/i })
    expect(within(results).getByText('Example Office')).toBeInTheDocument()
    expect(within(results).getAllByText(/mail forwarding is included/i)).not.toHaveLength(0)
    expect(within(results).getAllByText(/last checked/i)).not.toHaveLength(0)
    expect(within(results).getByRole('link', { name: /view Example Office offer/i })).toHaveAttribute(
      'href',
      '/go/example-office?city=miami&track=address-mail&plan=example-office-plan&position=1',
    )
    expect(screen.getByText(/mail forwarding is an add-on/i)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /offers not ranked/i })).toHaveTextContent(/quote office/i)
    expect(screen.getByRole('region', { name: /offers not ranked/i })).toHaveTextContent(/insufficient verified data/i)
    expect(screen.getByRole('link', { name: /ranking methodology/i })).toBeInTheDocument()

    expect(results.closest('.glass-surface')).toBeNull()
    expect(screen.getByRole('table', { name: /compare ranked offers/i }).closest('.glass-surface')).toBeNull()
  })
})
