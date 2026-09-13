import { track } from '@vercel/analytics/server'
import { customProductEventsEnabled } from './custom-events-enabled'
import { validateProductEvent, type ProductEvent } from './events'

/**
 * Server delivery is best-effort so analytics availability never prevents the
 * outbound redirect. The explicit flag keeps custom events off until the Vercel
 * project is on a plan that supports them.
 */
export async function trackServerProductEvent(event: ProductEvent): Promise<void> {
  const validated = validateProductEvent(event)
  if (!customProductEventsEnabled()) return
  try {
    await track(validated.name, validated.properties)
  } catch {
    // Preserve the user-visible redirect when analytics transport is unavailable.
  }
}
