import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'

const analytics = vi.hoisted(() => ({ beforeSend: undefined as ((event: { type: 'pageview'; url: string }) => { type: 'pageview'; url: string }) | undefined }))

vi.mock('@vercel/analytics/react', () => ({
  Analytics: ({ beforeSend }: { beforeSend: typeof analytics.beforeSend }) => {
    analytics.beforeSend = beforeSend
    return null
  },
}))

import RootLayout from '@/app/layout'

it('mounts Vercel Analytics with URL redaction before page views are sent', () => {
  renderToStaticMarkup(<RootLayout>Page content</RootLayout>)

  expect(analytics.beforeSend?.({ type: 'pageview', url: '/cities/miami?email=person@example.com#results' }))
    .toEqual({ type: 'pageview', url: '/cities/miami' })
})
