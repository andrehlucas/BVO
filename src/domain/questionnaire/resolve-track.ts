import type { Track } from '@/domain/catalog/types'
import type { QuestionnaireAnswers, TrackResolution } from './types'

const fallbackExplanation =
  'We selected address and mail as a starting point. You can change this choice anytime.'

export function resolveTrackWithExplanation(answers: QuestionnaireAnswers): TrackResolution {
  if (answers.selected !== 'unsure') {
    return { track: answers.selected, explanation: null }
  }

  if (answers.needsAddress && answers.needsHumanAnswering) {
    return { track: 'full-office', explanation: null }
  }

  if (answers.needsHumanAnswering) {
    return { track: 'receptionist-phone', explanation: null }
  }

  if (answers.needsAddress) {
    return { track: 'address-mail', explanation: null }
  }

  return { track: 'address-mail', explanation: fallbackExplanation }
}

export function resolveTrack(answers: QuestionnaireAnswers): Track {
  return resolveTrackWithExplanation(answers).track
}
