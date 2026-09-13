import { Link } from 'wouter'
import { listEditorialPages } from '@/content/load-editorial-page'

export default function ProvidersPage() {
  const providers = listEditorialPages('providers')

  return (
    <div className="editorial-hub">
      <header className="hub-heading">
        <p className="eyebrow">Provider reviews</p>
        <h1>Compare the providers behind the plans</h1>
        <p>See what each provider documents, what may cost extra, and which details still need confirmation.</p>
      </header>
      <section className="editorial-index" aria-labelledby="providers-index-heading">
        <div className="section-heading"><h2 id="providers-index-heading">Reviewed provider profiles</h2></div>
        <ul>{providers.map((provider) => <li key={provider.slug}><Link href={`/providers/${provider.slug}`}><strong>{provider.title}</strong><span>{provider.description}</span><small>Reviewed {provider.reviewedAt}</small></Link></li>)}</ul>
      </section>
    </div>
  )
}
