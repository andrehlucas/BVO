import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Catalog } from '@/domain/catalog/types'
import { ComparisonTable } from '@/components/comparison/comparison-table'
import type { RankedOffer } from '@/domain/ranking/types'
import { validCatalogFixture } from '../fixtures/catalog'

const baseOffer = (): RankedOffer => ({
  providerId: 'example-office',
  planIds: ['miami-address-mail'],
  locationId: 'miami-example',
  track: 'address-mail',
  normalizedPrice: {
    advertisedMonthlyCents: 9900,
    firstMonthCents: 9900,
    recurringMonthlyCents: 9900,
    mandatoryUpfrontCents: 0,
    optionalAddOns: [],
    usageBasedFeatures: [],
    promotion: null,
    isComplete: true,
    explanation: 'Verified.',
  },
  features: [
    { feature: 'business_address', state: 'included' },
    { feature: 'mail_receiving', state: 'included' },
  ],
  evidenceIds: ['miami-address-mail-price'],
  score: 80,
  breakdown: [],
  evidenceConfidence: 1,
  closeAlternative: false,
})

describe('comparison table', () => {
  it('shows only recorded, track-relevant criteria without inventing a feature state', async () => {
    const user = userEvent.setup()
    const catalog = structuredClone(validCatalogFixture) as Catalog
    const receptionistOffer: RankedOffer = {
      ...baseOffer(),
      track: 'receptionist-phone',
      features: [
        { feature: 'live_receptionist', state: 'included' },
        { feature: 'call_forwarding', state: 'paid_add_on', quoteRequired: true },
      ],
    }

    const sparsePhoneOffer: RankedOffer = {
      ...receptionistOffer,
      providerId: 'sparse-office',
      planIds: ['sparse-phone'],
      features: [{ feature: 'live_receptionist', state: 'included' }],
    }
    catalog.plans.push({ ...catalog.plans[0]!, id: 'sparse-phone', providerId: 'sparse-office' })

    render(<ComparisonTable catalog={catalog} city="miami" offers={[receptionistOffer, sparsePhoneOffer]} track="receptionist-phone" />)
    await user.click(screen.getByRole('button', { name: /open offer comparison/i }))

    expect(screen.getByRole('columnheader', { name: /live receptionist/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /call forwarding/i })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: /mail forwarding/i })).not.toBeInTheDocument()
    expect(screen.getAllByText('Add-on')).not.toHaveLength(0)
    expect(screen.getAllByText('—')).not.toHaveLength(0)
    expect(screen.queryByText(/not confirmed/i)).not.toBeInTheDocument()
  })
})
