'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { NeedChoice } from './url-state'
import { replaceQueryValue } from './url-state'

const choices: Array<{ value: NeedChoice; label: string; detail: string }> = [
  { value: 'address-mail', label: 'Address & mail', detail: 'A local business address and mail handling.' },
  { value: 'receptionist-phone', label: 'Live receptionist & phone', detail: 'Human call answering and business phone support.' },
  { value: 'full-office', label: 'Full virtual office', detail: 'Address, mail, phone, and workspace options together.' },
  { value: 'unsure', label: "I'm not sure", detail: 'Start with a guided default you can refine.' },
]

interface NeedSelectorProps { selectedNeed: NeedChoice }

export function NeedSelector({ selectedNeed }: NeedSelectorProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectNeed = (value: NeedChoice) => {
    router.replace(replaceQueryValue(pathname, searchParams, 'need', value), { scroll: false })
  }

  return (
    <fieldset className="need-selector" aria-describedby="need-selector-note">
      <legend>What do you need most?</legend>
      <p id="need-selector-note">Choose a starting point. This choice stays only in this page’s URL.</p>
      <div className="need-selector-options" role="radiogroup" aria-label="What do you need most?">
        {choices.map((choice) => (
          <label className="need-choice" key={choice.value}>
            <input
              checked={selectedNeed === choice.value}
              name="need"
              onChange={() => selectNeed(choice.value)}
              type="radio"
              value={choice.value}
            />
            <span><strong>{choice.label}</strong><small>{choice.detail}</small></span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
