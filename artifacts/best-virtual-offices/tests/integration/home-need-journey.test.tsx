// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import { HomeNeedJourney } from '../../src/components/home/home-need-journey'

vi.mock('@/components/ui/carousel-08', () => ({
  default: ({
    cards,
    onSelect,
    selectedId,
  }: {
    cards: { id: string; title: string }[]
    onSelect: (card: { id: string; title: string }) => void
    selectedId: string | null
  }) => (
    <div>
      {cards.map((card) => (
        <button aria-pressed={selectedId === card.id} key={card.id} onClick={() => onSelect(card)} type="button">
          {card.title}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('@/components/home/home-tracked-link', () => ({
  HomeTrackedLink: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

it('reveals and scrolls to city selection only after choosing a service', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const frames: FrameRequestCallback[] = []
  const scrollIntoView = vi.fn()
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView
  HTMLElement.prototype.scrollIntoView = scrollIntoView
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback)
    return frames.length
  })
  vi.stubGlobal('matchMedia', () => ({ matches: false }))

  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  try {
    await act(async () => {
      root.render(<HomeNeedJourney cities={[{ name: 'Miami', slug: 'miami' }]} />)
    })

    const cityStep = container.querySelector<HTMLDivElement>('#home-need-cities')!
    expect(cityStep.hidden).toBe(true)
    expect(cityStep.querySelector('a')).toBeNull()
    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(0)

    const fullOfficeCard = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Bring address, calls, and workspace together'),
    )!
    await act(async () => {
      fullOfficeCard.click()
    })
    await act(async () => {
      frames.shift()?.(0)
    })

    expect(cityStep.hidden).toBe(false)
    expect(cityStep.querySelector('a')?.getAttribute('href')).toBe('/cities/miami?need=full-office')
    expect(cityStep.querySelector('h3')?.textContent).toBe('Which city do you want to compare?')
    expect(document.activeElement).toBe(cityStep.querySelector('h3'))
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(fullOfficeCard.getAttribute('aria-pressed')).toBe('true')

    const mailCard = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Use a business address for mail'),
    )!
    await act(async () => {
      mailCard.click()
    })
    await act(async () => {
      frames.shift()?.(0)
    })

    expect(cityStep.querySelector('a')?.getAttribute('href')).toBe('/cities/miami?need=address-mail')
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
  } finally {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView
    vi.unstubAllGlobals()
  }
})