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
  return <article className="trust-page"><header className="trust-page-heading"><p className="eyebrow">Editorial accountability</p><h1>Corrections</h1><p>We welcome evidence-backed reports of factual errors, missing context, or outdated information.</p></header><GlassSurface as="section" aria-label="Corrections process" className="trust-page-surface"><h2>How a correction is handled</h2><p>We review the supplied evidence and publish approved changes through the same editorial process used for other updates.</p><p>This site does not collect correction reports in this app.</p>{externalUrl ? <p><a href={externalUrl}>Report a correction</a></p> : null}{!externalUrl && email ? <p><a href={`mailto:${email}`}>Email the editorial team</a></p> : null}{!externalUrl && !email ? <p>Correction contact details are not currently published.</p> : null}</GlassSurface></article>
}
