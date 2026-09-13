import type { Track } from '@/domain/catalog/types'

export interface QuestionnaireAnswers {
  selected: Track | 'unsure'
  needsAddress: boolean
  needsHumanAnswering: boolean
}

export interface TrackResolution {
  track: Track
  explanation: string | null
}
