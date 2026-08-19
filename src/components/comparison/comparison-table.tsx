import type { Catalog } from '@/domain/catalog/types'
import type { RankedOffer } from '@/domain/ranking/types'

const money = (amount: number | null) => amount === null ? 'Not verified' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
const plansFor = (catalog: Catalog, offer: RankedOffer) => offer.planIds.map((id) => catalog.plans.find((plan) => plan.id === id)?.name ?? id).join(' + ')
const forwardingState = (offer: RankedOffer) => offer.features.find((feature) => feature.feature === 'mail_forwarding')?.state ?? 'not_confirmed'
const displayState = (state: string) => state === 'paid_add_on' ? 'Add-on' : state === 'included' ? 'Included' : state.replaceAll('_', ' ')

interface ComparisonTableProps { catalog: Catalog; offers: RankedOffer[] }

export function ComparisonTable({ catalog, offers }: ComparisonTableProps) {
  const providers = new Map(catalog.providers.map((provider) => [provider.id, provider]))
  return (
    <section className="comparison-table-section" aria-labelledby="comparison-table-heading">
      <div className="section-heading"><p className="eyebrow">Evidence ledger</p><h2 id="comparison-table-heading">Compare ranked offers</h2></div>
      {offers.length === 0 ? <p className="empty-state">No complete offers are available to compare yet.</p> : <>
        <div className="comparison-table-wrap"><table aria-label="Compare ranked offers"><thead><tr><th scope="col">Provider</th><th scope="col">Qualifying plan</th><th scope="col">Recurring cost</th><th scope="col">Mail forwarding</th><th scope="col">Evidence</th></tr></thead><tbody>{offers.map((offer) => <tr key={`${offer.providerId}-${offer.planIds.join('-')}`}><th scope="row">{providers.get(offer.providerId)?.name ?? offer.providerId}</th><td>{plansFor(catalog, offer)}</td><td>{money(offer.normalizedPrice.recurringMonthlyCents)}</td><td>{displayState(forwardingState(offer))}</td><td>{Math.round(offer.evidenceConfidence * 100)}% confidence</td></tr>)}</tbody></table></div>
        <div className="comparison-mobile-list" aria-label="Ranked offer comparison cards">{offers.map((offer) => <article key={`${offer.providerId}-${offer.planIds.join('-')}`}><h3>{providers.get(offer.providerId)?.name ?? offer.providerId}</h3><dl><div><dt>Qualifying plan</dt><dd>{plansFor(catalog, offer)}</dd></div><div><dt>Recurring cost</dt><dd>{money(offer.normalizedPrice.recurringMonthlyCents)}</dd></div><div><dt>Mail forwarding</dt><dd>{displayState(forwardingState(offer))}</dd></div><div><dt>Evidence</dt><dd>{Math.round(offer.evidenceConfidence * 100)}% confidence</dd></div></dl></article>)}</div>
      </>}
    </section>
  )
}
