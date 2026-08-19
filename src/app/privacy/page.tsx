import { GlassSurface } from '@/components/ui/glass-surface'
import type { Metadata } from 'next'
import { trustRoutes } from '@/seo/public-routes'

const route = trustRoutes.find((item) => item.pathname === '/privacy')!
export const metadata: Metadata = { title: route.title, description: route.description, alternates: { canonical: route.pathname } }

export default function PrivacyPage() {
  return <article className="trust-page"><header className="trust-page-heading"><p className="eyebrow">Privacy by design</p><h1>Privacy</h1><p>Use the comparison without handing us a profile.</p></header><GlassSurface as="section" aria-label="Privacy practices" className="trust-page-surface"><h2>No-account comparison</h2><p>You do not need an account to browse city comparisons, inspect methodology, or follow a provider link.</p><p>We do not collect your name, email address, or phone number through this app. The comparison does not include sign-up forms, lead forms, checkout, or a user profile.</p><p>When you leave for a provider, that provider’s own privacy practices apply to the destination site.</p></GlassSurface></article>
}
