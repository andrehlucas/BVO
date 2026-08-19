import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Florida Virtual Office Comparison',
  description: 'Compare virtual office providers in Florida.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div className="site-shell">
          <SiteHeader />
          <main className="site-frame site-main" id="main-content">{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
