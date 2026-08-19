import Link from 'next/link'
import { AffiliateDisclosure } from '@/components/disclosure/affiliate-disclosure'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-frame site-footer-grid">
        <nav aria-label="Footer navigation">
          <ul className="footer-nav-list">
            <li><Link href="/methodology">Methodology</Link></li>
            <li><Link href="/affiliate-disclosure">Affiliate disclosure</Link></li>
            <li><Link href="/corrections">Corrections</Link></li>
          </ul>
        </nav>
        <AffiliateDisclosure />
      </div>
    </footer>
  )
}
