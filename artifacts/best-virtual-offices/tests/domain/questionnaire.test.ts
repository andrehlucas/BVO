import {
  resolveTrack,
  resolveTrackWithExplanation,
} from '@/domain/questionnaire/resolve-track'

describe('resolveTrack', () => {
  it('keeps a directly selected track', () => {
    expect(
      resolveTrack({
        selected: 'receptionist-phone',
        needsAddress: true,
        needsHumanAnswering: false,
      }),
    ).toBe('receptionist-phone')
  })

  it.each([
    [{ selected: 'unsure', needsAddress: true, needsHumanAnswering: false }, 'address-mail'],
    [{ selected: 'unsure', needsAddress: false, needsHumanAnswering: true }, 'receptionist-phone'],
    [{ selected: 'unsure', needsAddress: true, needsHumanAnswering: true }, 'full-office'],
  ] as const)('resolves unsure answers %o to %s', (answers, expectedTrack) => {
    expect(resolveTrack(answers)).toBe(expectedTrack)
  })

  it('defaults unanswered unsure choices to address and mail with change guidance', () => {
    expect(
      resolveTrackWithExplanation({
        selected: 'unsure',
        needsAddress: false,
        needsHumanAnswering: false,
      }),
    ).toEqual({
      track: 'address-mail',
      explanation: 'We selected address and mail as a starting point. You can change this choice anytime.',
    })
  })
})
