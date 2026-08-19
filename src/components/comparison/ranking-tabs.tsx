'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Track } from '@/domain/catalog/types'
import { replaceQueryValue } from './url-state'

const tabs: Array<{ track: Track; label: string }> = [
  { track: 'address-mail', label: 'Address & mail' },
  { track: 'receptionist-phone', label: 'Live receptionist & phone' },
  { track: 'full-office', label: 'Full virtual office' },
]

interface RankingTabsProps { activeTrack: Track }

export function RankingTabs({ activeTrack }: RankingTabsProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  return (
    <div aria-label="Comparison ranking tracks" className="ranking-tabs" role="group">
      {tabs.map((tab) => (
        <button
          aria-pressed={activeTrack === tab.track}
          className={activeTrack === tab.track ? 'is-current' : undefined}
          key={tab.track}
          onClick={() => router.replace(replaceQueryValue(pathname, searchParams, 'need', tab.track), { scroll: false })}
          type="button"
        >{tab.label}</button>
      ))}
    </div>
  )
}
