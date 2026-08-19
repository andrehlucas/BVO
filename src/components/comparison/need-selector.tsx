'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ProductCity } from '@/analytics/events'
import { trackProductEvent } from '@/analytics/track-event'
import type { NeedChoice } from './url-state'
import { replaceQueryValue } from './url-state'

const choices: Array<{ value: NeedChoice; label: string; detail: string }> = [
  { value: 'address-mail', label: 'Address & mail', detail: 'Receive business mail without publishing your home address.' },
  { value: 'receptionist-phone', label: 'Live receptionist & phone', detail: 'Have calls answered in your business name and routed to you.' },
  { value: 'full-office', label: 'Full virtual office', detail: 'Combine address, call handling, and occasional workspace.' },
  { value: 'unsure', label: "I'm not sure yet", detail: 'Start with address and mail, then adjust what matters.' },
]

interface NeedSelectorProps { selectedNeed: NeedChoice; city: ProductCity }

export function NeedSelector({ selectedNeed, city }: NeedSelectorProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectNeed = (value: NeedChoice) => {
    router.replace(replaceQueryValue(pathname, searchParams, 'need', value), { scroll: false })
    if (value !== 'unsure') trackProductEvent({ name: 'need_selected', properties: { city, journey: value } })
  }

  return (
    <fieldset className="need-selector" aria-describedby="need-selector-note">
      <legend>What do you need your virtual office to do?</legend>
      <p id="need-selector-note">Pick the closest match. You can change it without creating an account or sharing contact details.</p>
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
