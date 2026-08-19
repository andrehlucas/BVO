import Link from 'next/link'
import type { Catalog, FeatureKey, FeatureState, Track } from '@/domain/catalog/types'
import { explainRecommendation } from '@/domain/ranking/explain'
import type { RankingResult } from '@/domain/ranking/types'
import { AffiliateDisclosure } from '@/components/disclosure/affiliate-disclosure'

const featureLabels: Record<FeatureKey, string> = {
  business_address: 'Business address', mail_receiving: 'Mail receiving', mail_forwarding: 'Mail forwarding', mail_scanning: 'Mail scanning', local_mail_pickup: 'Local mail pickup', live_receptionist: 'Live receptionist', business_phone_number: 'Business phone number', call_forwarding: 'Call forwarding', appointment_scheduling: 'Appointment scheduling', business_email: 'Business email', administrative_support: 'Administrative support', meeting_rooms: 'Meeting rooms', coworking_access: 'Coworking access', private_office_access: 'Private office access', guest_reception: 'Guest reception', registered_agent: 'Registered agent', company_formation_assistance: 'Company formation assistance',
}

const formatMoney = (amountCents: number | null): string => amountCents === null ? 'Price not verified' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountCents / 100)
const formatDate = (value: string): string => value === '' ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value))
const planName = (catalog: Catalog, planIds: string[]): string => planIds.map((id) => catalog.plans.find((plan) => plan.id === id)?.name ?? id).join(' + ')
const stateLabel = (feature: FeatureKey, state: FeatureState): string => `${featureLabels[feature]} is ${state === 'included' ? 'included' : state === 'paid_add_on' ? 'an add-on' : state === 'usage_based' ? 'usage-based' : state === 'not_available' ? 'not available' : 'not confirmed'}`

interface RankingResultsProps { catalog: Catalog; citySlug: string; ranking: RankingResult; track: Track }

export function RankingResults({ catalog, citySlug, ranking, track }: RankingResultsProps) {
  const providers = new Map(catalog.providers.map((provider) => [provider.id, provider]))
  return (
    <>
      <AffiliateDisclosure className="comparison-disclosure" />
      <section aria-label="Ranked offers" className="ranking-results" id="ranked-offers">
        <div className="section-heading"><p className="eyebrow">Verified match</p><h2>Ranked offers</h2><a href="/methodology">Ranking methodology</a></div>
        {ranking.ranked.length === 0 ? <p className="empty-state">No offers have enough verified information for a numbered recommendation yet. Check the methodology and return when the evidence ledger is updated.</p> : (
          <ol className="offer-list">
            {ranking.ranked.map((offer, index) => {
              const provider = providers.get(offer.providerId)
              const explanation = explainRecommendation(offer, catalog)
              const featureStates = [...new Map(offer.features.map((feature) => [feature.feature, feature.state])).entries()]
              return (
                <li className="offer-row" key={`${offer.providerId}-${offer.planIds.join('-')}`}>
                  <div className="offer-rank" aria-label={`Position ${index + 1}`}>{String(index + 1).padStart(2, '0')}</div>
                  <div className="offer-main"><h3>{provider?.name ?? offer.providerId}</h3><p>{planName(catalog, offer.planIds)}</p><p className="price-line"><strong>{formatMoney(offer.normalizedPrice.recurringMonthlyCents)}</strong> recurring normalized cost <span>{offer.normalizedPrice.mandatoryUpfrontCents > 0 ? `+ ${formatMoney(offer.normalizedPrice.mandatoryUpfrontCents)} setup` : ''}</span></p></div>
                  <div className="offer-evidence"><p><strong>Why it ranks</strong></p><ul>{explanation.strengths.map((strength) => <li key={strength}>{strength}</li>)}</ul><p><strong>Limitation:</strong> {explanation.limitation}</p><p className="verification-date">Last checked: {formatDate(explanation.verifiedAt)}</p></div>
                  <div className="offer-statuses" aria-label={`${provider?.name ?? offer.providerId} feature statuses`}>
                    {featureStates.map(([feature, state]) => <span className={`feature-status feature-status--${state}`} key={feature}>{stateLabel(feature, state)}</span>)}
                  </div>
                  <Link aria-label={`View ${provider?.name ?? offer.providerId} offer`} className="button-link button-link--primary" href={`/go/${offer.providerId}?city=${citySlug}&track=${track}&plan=${offer.planIds.join(',')}&position=${index + 1}`}>View offer</Link>
                </li>
              )
            })}
          </ol>
        )}
      </section>
      {ranking.unranked.length > 0 && <section aria-label="Offers not ranked" className="unranked-offers"><h2>Offers not ranked</h2><p>These eligible offers remain separate because a price, term, availability, or linked evidence record is incomplete.</p><ul>{ranking.unranked.map(({ candidate }) => <li key={`${candidate.providerId}-${candidate.planIds.join('-')}`}><strong>{providers.get(candidate.providerId)?.name ?? candidate.providerId}</strong> — {planName(catalog, candidate.planIds)}</li>)}</ul></section>}
    </>
  )
}
