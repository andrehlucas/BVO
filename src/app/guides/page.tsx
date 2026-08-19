import Link from 'next/link'
import type { Metadata } from 'next'
import { listEditorialPages } from '@/content/load-editorial-page'

export const metadata: Metadata = {
  title: 'Virtual Office Guides for Florida Businesses',
  description: 'Understand virtual office services, fees, mail handling, live reception, and selection criteria before comparing Florida providers.',
  alternates: { canonical: '/guides' },
}

export default async function GuidesPage() {
  const guides = await listEditorialPages('guides')

  return (
    <div className="editorial-hub">
      <header className="hub-heading">
        <p className="eyebrow">Practical buying guides</p>
        <h1>Understand what you are actually buying</h1>
        <p>Learn how virtual office services, fees, and limitations work before you compare a provider in your city.</p>
      </header>
      <section className="editorial-index" aria-labelledby="guides-index-heading">
        <div className="section-heading"><h2 id="guides-index-heading">Start with the question you need answered</h2></div>
        <ul>{guides.map((guide) => <li key={guide.slug}><Link href={`/guides/${guide.slug}`}><strong>{guide.title}</strong><span>{guide.description}</span><small>Reviewed {guide.reviewedAt}</small></Link></li>)}</ul>
      </section>
    </div>
  )
}
