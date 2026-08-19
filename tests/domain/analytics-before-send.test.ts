import { describe, expect, it } from 'vitest'
import { redactAnalyticsBeforeSend, redactAnalyticsUrl } from '@/analytics/before-send'

describe('Vercel analytics URL redaction', () => {
  it('removes query strings and fragments from automatic page-view URLs', () => {
    expect(redactAnalyticsUrl('/cities/miami?email=person@example.com#results')).toBe('/cities/miami')
    expect(redactAnalyticsBeforeSend({ type: 'pageview', url: '/cities/miami?email=person@example.com#results' }))
      .toEqual({ type: 'pageview', url: '/cities/miami' })
  })

  it('also removes unapproved URL data from custom-event URLs', () => {
    expect(redactAnalyticsBeforeSend({ type: 'event', url: 'https://virtualoffice.test/go/regus?query=private#affiliate' }))
      .toEqual({ type: 'event', url: 'https://virtualoffice.test/go/regus' })
  })
})
