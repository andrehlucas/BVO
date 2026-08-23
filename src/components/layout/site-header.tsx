import Link from 'next/link'
import Image from 'next/image'
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
        <Link className="site-brand" href="/" aria-label="Best Virtual Offices — home">
          <span className="site-brand-mark" aria-hidden="true">
            <Image
              className="site-brand-logo"
              src="/brand/bvo-logo.svg"
              alt=""
              width={674}
              height={271}
              priority
            />
          </span>
          <span className="site-brand-name">Best Virtual Offices</span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="site-nav-list">
            {primaryLinks.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
          </ul>
        </nav>
      </div>
    </GlassSurface>
  )
}
