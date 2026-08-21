'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { trackProductEvent } from '@/analytics/track-event'
import type { HomepageJourney } from '@/analytics/events'

type HomeTrackedLinkProps = ComponentProps<typeof Link> & {
  journey: HomepageJourney
}

export function HomeTrackedLink({ journey, onClick, ...props }: HomeTrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          trackProductEvent({ name: 'homepage_navigation_clicked', properties: { journey } })
        }
      }}
    />
  )
}
