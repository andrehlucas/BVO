/**
 * This is deliberately opt-in. Set the public flag only after confirming that
 * the deployed Vercel plan supports custom events.
 */
export function customProductEventsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_CUSTOM_EVENTS === 'enabled'
}
