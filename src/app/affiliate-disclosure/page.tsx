import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateDisclosure } from '@/components/disclosure/affiliate-disclosure'
import { GlassSurface } from '@/components/ui/glass-surface'
import { trustRoutes } from '@/seo/public-routes'

const route = trustRoutes.find((item) => item.pathname === '/affiliate-disclosure')!
export const metadata: Metadata = { title: route.title, description: route.description, alternates: { canonical: route.pathname } }

export default function AffiliateDisclosurePage() {
  return <article className="trust-page"><header className="trust-page-heading"><p className="eyebrow">How this site is funded</p><h1>Affiliate disclosure</h1><p>Our goal is to make the commercial relationship easy to see before you choose an outbound provider link.</p></header><GlassSurface as="section" aria-label="Affiliate disclosure" className="trust-page-surface"><AffiliateDisclosure /><p>That means a provider may compensate us after an eligible purchase, but compensation does not change our rankings or recommendations. Rankings use the published methodology, not commissions or conversion performance.</p><p><Link href="/methodology">Read the ranking methodology</Link>.</p></GlassSurface></article>
}
