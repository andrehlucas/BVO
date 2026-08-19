'use client'

import { track } from '@vercel/analytics/react'
import { customProductEventsEnabled } from './custom-events-enabled'
import { validateProductEvent, type ProductEvent } from './events'

export { customProductEventsEnabled } from './custom-events-enabled'

/** Sends only validated, anonymous product context when custom events are enabled. */
export function trackProductEvent(event: ProductEvent): void {
  const validated = validateProductEvent(event)
  if (!customProductEventsEnabled()) return
  track(validated.name, validated.properties)
}
