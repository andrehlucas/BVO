import type { BeforeSend, BeforeSendEvent } from '@vercel/analytics/react'

/** Removes user-controlled URL query and fragment data before Vercel receives it. */
export function redactAnalyticsUrl(url: string): string {
  const firstUnapprovedPart = url.search(/[?#]/)
  return firstUnapprovedPart === -1 ? url : url.slice(0, firstUnapprovedPart)
}

export const redactAnalyticsBeforeSend: BeforeSend = (event: BeforeSendEvent) => ({
  ...event,
  url: redactAnalyticsUrl(event.url),
})
