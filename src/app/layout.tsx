import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { VercelAnalytics } from '@/analytics/vercel-analytics'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { JsonLd } from '@/components/seo/json-ld'
import { absoluteUrl, getSiteUrl } from '@/seo/site-url'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: 'Florida Virtual Office Comparison',
    template: '%s | Florida Virtual Office Comparison',
  },
  description: 'Compare verified virtual office features, limitations, and evidence across Florida cities.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en">
      <body>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Florida Virtual Office Comparison',
          url: absoluteUrl('/'),
          inLanguage: 'en-US',
        }} />
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div className="site-shell">
          <SiteHeader />
          <main className="site-frame site-main" id="main-content">{children}</main>
          <SiteFooter />
        </div>
        <VercelAnalytics />
      </body>
    </html>
  )
}
