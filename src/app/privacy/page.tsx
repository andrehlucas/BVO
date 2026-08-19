import { GlassSurface } from '@/components/ui/glass-surface'
import type { Metadata } from 'next'
import { trustRoutes } from '@/seo/public-routes'

const route = trustRoutes.find((item) => item.pathname === '/privacy')!
export const metadata: Metadata = { title: route.title, description: route.description, alternates: { canonical: route.pathname } }

export default function PrivacyPage() {
  return <article className="trust-page"><header className="trust-page-heading"><p className="eyebrow">Compare without becoming a lead</p><h1>Your decision does not require your contact details</h1><p>Browse plans, change preferences, and inspect the methodology without creating an account.</p></header><GlassSurface as="section" aria-label="Privacy practices" className="trust-page-surface"><h2>What we do not ask for</h2><p>We do not collect your name, email address, or phone number through this app. There are no sign-up forms, lead forms, checkout flows, or user profiles.</p><p>Your comparison choices stay in the page URL so you can change or share the view without creating a record with us.</p><p>When you leave for a provider, that provider’s own privacy practices apply to the destination site.</p></GlassSurface></article>
}
