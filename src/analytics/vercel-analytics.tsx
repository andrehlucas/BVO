'use client'

import { Analytics } from '@vercel/analytics/react'
import { redactAnalyticsBeforeSend } from './before-send'

export function VercelAnalytics() {
  return <Analytics beforeSend={redactAnalyticsBeforeSend} />
}
