import { GlassSurface } from '@/components/ui/glass-surface'
import type { Metadata } from 'next'
import { trustRoutes } from '@/seo/public-routes'

const route = trustRoutes.find((item) => item.pathname === '/corrections')!
export const metadata: Metadata = { title: route.title, description: route.description, alternates: { canonical: route.pathname } }

function correctionsUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_CORRECTIONS_URL
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : undefined
  } catch { return undefined }
}

function editorialEmail(): string | undefined {
  const value = process.env.NEXT_PUBLIC_EDITORIAL_EMAIL
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined
}

export default function CorrectionsPage() {
  const externalUrl = correctionsUrl()
  const email = editorialEmail()
  return <article className="trust-page"><header className="trust-page-heading"><p className="eyebrow">Prices and plans change</p><h1>Found something we should correct?</h1><p>Send the current source and tell us what changed. We review factual errors, missing context, and outdated provider information.</p></header><GlassSurface as="section" aria-label="Corrections process" className="trust-page-surface"><h2>What happens after a report</h2><p>We check the source, update the evidence first, rerun the affected comparison, and publish only after human review.</p><p>This site does not collect correction reports inside the comparator.</p>{externalUrl ? <p><a href={externalUrl}>Submit an evidence-backed correction</a></p> : null}{!externalUrl && email ? <p><a href={`mailto:${email}`}>Email the editorial team</a></p> : null}{!externalUrl && !email ? <p>Correction contact details are not currently published.</p> : null}</GlassSurface></article>
}
