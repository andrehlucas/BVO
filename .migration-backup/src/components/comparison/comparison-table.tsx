'use client'

import { useState } from 'react'
import type { ProductCity } from '@/analytics/events'
import { trackProductEvent } from '@/analytics/track-event'
import type { Catalog, FeatureKey, FeatureState, Track } from '@/domain/catalog/types'
import type { RankedOffer } from '@/domain/ranking/types'

const featureLabels: Record<FeatureKey, string> = {
  business_address: 'Business address', mail_receiving: 'Mail receiving', mail_forwarding: 'Mail forwarding', mail_scanning: 'Mail scanning', local_mail_pickup: 'Local mail pickup', live_receptionist: 'Live receptionist', business_phone_number: 'Business phone number', call_forwarding: 'Call forwarding', appointment_scheduling: 'Appointment scheduling', business_email: 'Business email', administrative_support: 'Administrative support', meeting_rooms: 'Meeting rooms', coworking_access: 'Coworking access', private_office_access: 'Private office access', guest_reception: 'Guest reception', registered_agent: 'Registered agent', company_formation_assistance: 'Company formation assistance',
}

const criteriaByTrack: Record<Track, FeatureKey[]> = {
  'address-mail': ['business_address', 'mail_receiving', 'mail_forwarding', 'mail_scanning', 'local_mail_pickup'],
  'receptionist-phone': ['live_receptionist', 'business_phone_number', 'call_forwarding', 'appointment_scheduling', 'administrative_support'],
  'full-office': ['business_address', 'mail_receiving', 'live_receptionist', 'call_forwarding', 'meeting_rooms', 'coworking_access', 'private_office_access', 'guest_reception'],
}

const money = (amount: number | null) => amount === null ? 'Not verified' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
const plansFor = (catalog: Catalog, offer: RankedOffer) => offer.planIds.map((id) => catalog.plans.find((plan) => plan.id === id)?.name ?? id).join(' + ')
const stateFor = (offer: RankedOffer, feature: FeatureKey): FeatureState | undefined => offer.features.find((item) => item.feature === feature)?.state
const displayState = (state: FeatureState) => state === 'paid_add_on' ? 'Add-on' : state === 'included' ? 'Included' : state === 'usage_based' ? 'Usage-based' : state === 'not_available' ? 'Not available' : 'Not confirmed'

interface ComparisonTableProps { catalog: Catalog; offers: RankedOffer[]; track: Track }

export function ComparisonTable({ catalog, city, offers, track }: ComparisonTableProps & { city: ProductCity }) {
  const [isOpen, setIsOpen] = useState(false)
  const providers = new Map(catalog.providers.map((provider) => [provider.id, provider]))
  const criteria = criteriaByTrack[track].filter((feature) => offers.some((offer) => stateFor(offer, feature) !== undefined))
  const fields = [
    { key: 'plan', label: 'Qualifying plan', value: (offer: RankedOffer) => plansFor(catalog, offer) },
    { key: 'price', label: 'Recurring cost', value: (offer: RankedOffer) => money(offer.normalizedPrice.recurringMonthlyCents) },
    ...criteria.map((feature) => ({ key: feature, label: featureLabels[feature], value: (offer: RankedOffer) => {
      const state = stateFor(offer, feature)
      return state === undefined ? 'Not listed' : displayState(state)
    } })),
    { key: 'evidence', label: 'Evidence', value: (offer: RankedOffer) => `${Math.round(offer.evidenceConfidence * 100)}% confidence` },
  ]

  return (
    <section className="comparison-table-section" aria-labelledby="comparison-table-heading">
      <div className="section-heading"><h2 id="comparison-table-heading">See what each ranked offer includes</h2></div>
      <button aria-expanded={isOpen} onClick={() => {
        if (!isOpen) {
          setIsOpen(true)
          trackProductEvent({ name: 'comparison_opened', properties: { city, journey: track } })
        }
      }} type="button">Compare offer details</button>
      {isOpen && (offers.length === 0 ? <p className="empty-state">There are no fully verified offers to place side by side yet. Review the unranked options to see which details are still missing.</p> : <>
        <div className="comparison-table-wrap"><table aria-label="Compare ranked offers"><thead><tr><th scope="col">Provider</th>{fields.map((field) => <th key={field.key} scope="col">{field.label}</th>)}</tr></thead><tbody>{offers.map((offer) => <tr key={`${offer.providerId}-${offer.planIds.join('-')}`}><th scope="row">{providers.get(offer.providerId)?.name ?? offer.providerId}</th>{fields.map((field) => <td key={field.key}>{field.value(offer)}</td>)}</tr>)}</tbody></table></div>
        <div className="comparison-mobile-list" aria-label="Ranked offer comparison cards">{offers.map((offer) => <article key={`${offer.providerId}-${offer.planIds.join('-')}`}><h3>{providers.get(offer.providerId)?.name ?? offer.providerId}</h3><dl>{fields.map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{field.value(offer)}</dd></div>)}</dl></article>)}</div>
      </>)}
    </section>
  )
}
