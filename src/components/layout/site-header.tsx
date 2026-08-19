import Link from 'next/link'
import { GlassSurface } from '@/components/ui/glass-surface'

const primaryLinks = [
  { href: '/florida', label: 'Cities' },
  { href: '/providers', label: 'Providers' },
  { href: '/guides', label: 'Guides' },
  { href: '/methodology', label: 'Methodology' },
]

export function SiteHeader() {
  return (
    <GlassSurface as="header" className="site-header" aria-label="Site header">
      <div className="site-frame site-header-content">
        <Link className="site-brand" href="/">Florida virtual office comparison</Link>
        <nav aria-label="Primary navigation">
          <ul className="site-nav-list">
            {primaryLinks.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
          </ul>
        </nav>
      </div>
    </GlassSurface>
  )
}
