'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Track } from '@/domain/catalog/types'
import type { ComparisonQuery, WorkspaceChoice } from './url-state'
import { replaceQueryValue } from './url-state'

interface RefinementFiltersProps {
  query: ComparisonQuery
  track: Track
}

export function RefinementFilters({ query, track }: RefinementFiltersProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const update = (key: keyof ComparisonQuery, value: string) =>
    router.replace(replaceQueryValue(pathname, searchParams, key, value), { scroll: false })

  return (
    <fieldset className="refinement-filters">
      <legend>Refine this comparison</legend>
      <p>Only verified details affect the ranking. Unknown information is never treated as unavailable.</p>
      <div className="filter-controls">
        {track === 'address-mail' && <>
          <label><input checked={query.mailForwarding} onChange={(event) => update('mailForwarding', event.target.checked ? 'yes' : 'no')} type="checkbox" /> Mail forwarding</label>
          <label><input checked={query.mailScanning} onChange={(event) => update('mailScanning', event.target.checked ? 'yes' : 'no')} type="checkbox" /> Mail scanning</label>
        </>}
        {track === 'receptionist-phone' && (
          <label>Call volume
            <select aria-label="Call volume" onChange={(event) => update('callVolume', event.target.value)} value={query.callVolume}>
              <option value="light">Light or occasional</option>
              <option value="steady">Steady business calls</option>
            </select>
          </label>
        )}
        {track === 'full-office' && (
          <label>Workspace priority
            <select aria-label="Workspace priority" onChange={(event) => update('workspace', event.target.value)} value={query.workspace}>
              <option value="none">No workspace preference</option>
              <option value="meeting-rooms">Meeting rooms</option>
              <option value="coworking">Coworking access</option>
              <option value="private-office">Private office access</option>
              <option value="guest-reception">Guest reception</option>
            </select>
          </label>
        )}
        <label><input checked={query.monthToMonth} onChange={(event) => update('monthToMonth', event.target.checked ? 'yes' : 'no')} type="checkbox" /> Prefer month-to-month terms</label>
      </div>
    </fieldset>
  )
}

export function workspacePreference(workspace: WorkspaceChoice) {
  return {
    needsMeetingRooms: workspace === 'meeting-rooms',
    needsCoworkingAccess: workspace === 'coworking',
    needsPrivateOfficeAccess: workspace === 'private-office',
    needsGuestReception: workspace === 'guest-reception',
  }
}
