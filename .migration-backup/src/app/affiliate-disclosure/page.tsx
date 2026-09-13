import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateDisclosure } from '@/components/disclosure/affiliate-disclosure'
import { GlassSurface } from '@/components/ui/glass-surface'
import { trustRoutes } from '@/seo/public-routes'

const route = trustRoutes.find((item) => item.pathname === '/affiliate-disclosure')!
export const metadata: Metadata = { title: route.title, description: route.description, alternates: { canonical: route.pathname } }

export default function AffiliateDisclosurePage() {
  return <article className="trust-page"><header className="trust-page-heading"><p className="eyebrow">How this site is funded</p><h1>Affiliate links pay us. They do not rank providers.</h1><p>You should be able to see the commercial relationship without wondering whether it changed the recommendation.</p></header><GlassSurface as="section" aria-label="Affiliate disclosure" className="trust-page-surface"><AffiliateDisclosure /><p>Affiliate configuration is kept outside the ranking system. Scores use the published product evidence and methodology, not commissions, conversion rates, or revenue.</p><p><Link href="/methodology">Inspect the ranking rules</Link>.</p></GlassSurface></article>
}
