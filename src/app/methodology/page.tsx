import methodology from '../../../content/methodology/ranking-v1.json'
import type { Metadata } from 'next'
import { GlassSurface } from '@/components/ui/glass-surface'
import { trustRoutes } from '@/seo/public-routes'

const route = trustRoutes.find((item) => item.pathname === '/methodology')!
export const metadata: Metadata = { title: route.title, description: route.description, alternates: { canonical: route.pathname } }

const trackLabels = {
  'address-mail': 'Address & mail',
  'receptionist-phone': 'Live receptionist & phone',
  'full-office': 'Full virtual office',
} as const

const weightLabels: Record<string, string> = {
  comparableTotalCost: 'Comparable total cost', mailManagement: 'Mail management', addressAndLocalConvenience: 'Address and local convenience',
  totalCostAndMinuteAllowance: 'Total cost and minute allowance', humanAnsweringScope: 'Human answering scope', phoneFeaturesAndForwarding: 'Phone features and forwarding',
  totalPackageCost: 'Total package cost', addressAndMail: 'Address and mail', phoneAndLiveReceptionist: 'Phone and live receptionist', workspaceAndLocalPresence: 'Workspace and local presence',
  contractFlexibility: 'Contract flexibility', transparencyAndEvidence: 'Transparency and evidence', productLineValue: 'Product line value',
  coverageAcrossNeeds: 'Coverage across needs', flexibility: 'Flexibility', localPresenceAndOptions: 'Local presence and options', transparencyAndVerifiability: 'Transparency and verifiability',
}

function WeightList({ weights }: { weights: Record<string, number> }) {
  return <ul className="methodology-weights">{Object.entries(weights).map(([key, value]) => <li key={key}><span>{weightLabels[key] ?? key}</span><strong>{value}%</strong></li>)}</ul>
}

export default function MethodologyPage() {
  return (
    <article className="trust-page">
      <header className="trust-page-heading"><p className="eyebrow">No black-box recommendations</p><h1>See exactly what earns a higher rank</h1><p>Each service type is scored differently because an address plan and a receptionist plan do different jobs. These are the published weights for version {methodology.version}, effective {methodology.effectiveDate}.</p></header>
      <div className="methodology-grid">
        {Object.entries(methodology.tracks).map(([track, weights]) => <GlassSurface as="section" key={track} aria-labelledby={`${track}-heading`} className="methodology-card"><h2 id={`${track}-heading`}>{trackLabels[track as keyof typeof trackLabels]}</h2><WeightList weights={weights} /></GlassSurface>)}
      </div>
      <GlassSurface as="section" aria-labelledby="overall-methodology-heading" className="methodology-card methodology-overall"><h2 id="overall-methodology-heading">What the overall provider rating means</h2><p>This secondary score looks at the provider’s broader product line. It does not replace the ranking for the service you actually need.</p><WeightList weights={methodology.overallProviderRating} /></GlassSurface>
    </article>
  )
}
