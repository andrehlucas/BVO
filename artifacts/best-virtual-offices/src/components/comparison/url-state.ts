import type { Track } from '@/domain/catalog/types'

export type NeedChoice = Track | 'unsure'
export type WorkspaceChoice = 'none' | 'meeting-rooms' | 'coworking' | 'private-office' | 'guest-reception'

export interface ComparisonQuery {
  need: NeedChoice
  mailForwarding: boolean
  mailScanning: boolean
  callVolume: 'light' | 'steady'
  workspace: WorkspaceChoice
  monthToMonth: boolean
}

type SearchParams = Record<string, string | string[] | undefined>

const needChoices = new Set<NeedChoice>(['address-mail', 'receptionist-phone', 'full-office', 'unsure'])
const workspaceChoices = new Set<WorkspaceChoice>(['none', 'meeting-rooms', 'coworking', 'private-office', 'guest-reception'])
const firstValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

export function parseComparisonQuery(searchParams: SearchParams): ComparisonQuery {
  const need = firstValue(searchParams.need)
  const workspace = firstValue(searchParams.workspace)
  const callVolume = firstValue(searchParams.callVolume)

  return {
    need: need !== undefined && needChoices.has(need as NeedChoice) ? need as NeedChoice : 'address-mail',
    mailForwarding: firstValue(searchParams.mailForwarding) === 'yes',
    mailScanning: firstValue(searchParams.mailScanning) === 'yes',
    callVolume: callVolume === 'steady' ? 'steady' : 'light',
    workspace: workspace !== undefined && workspaceChoices.has(workspace as WorkspaceChoice)
      ? workspace as WorkspaceChoice
      : 'none',
    monthToMonth: firstValue(searchParams.monthToMonth) === 'yes',
  }
}

export function replaceQueryValue(
  pathname: string,
  searchParams: URLSearchParams,
  key: keyof ComparisonQuery,
  value: string,
): string {
  const next = new URLSearchParams(searchParams)
  if (value === '' || value === 'no' || value === 'none' || value === 'light') next.delete(key)
  else next.set(key, value)
  const query = next.toString()
  return query.length > 0 ? `${pathname}?${query}` : pathname
}

export function workspacePreference(workspace: WorkspaceChoice) {
  return {
    needsMeetingRooms: workspace === 'meeting-rooms',
    needsCoworkingAccess: workspace === 'coworking',
    needsPrivateOfficeAccess: workspace === 'private-office',
    needsGuestReception: workspace === 'guest-reception',
  }
}
