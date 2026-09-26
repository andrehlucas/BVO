// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'

vi.mock('@/components/ui/image', () => ({ default: () => null }))
vi.mock('wouter', () => ({ Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => <a href={href} {...props}>{children}</a> }))
vi.mock('@/components/home/home-need-journey', () => ({ HomeNeedJourney: () => <div>Service first journey</div> }))
vi.mock('@/components/home/home-tracked-link', () => ({ HomeTrackedLink: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a> }))
vi.mock('@/content/load-editorial-page', () => ({ listEditorialPages: () => [] }))
vi.mock('@/components/home/home-comparison-search', () => ({ HomeComparisonSearch: () => <form aria-label="Quick compare">Quick compare controls</form> }))

import HomePage from '../../src/pages/home'

it('makes service selection the primary path and keeps comparison search as a secondary quick compare shortcut', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  try {
    await act(async () => {
      root.render(<HomePage />)
    })

    const needs = container.querySelector('[data-home-section="needs"]')!
    const quickCompare = container.querySelector('[data-home-section="quick-compare"]')!

    expect(needs.compareDocumentPosition(quickCompare) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(container.querySelector('.home-intro form')).toBeNull()
    expect(quickCompare.querySelector('h2')?.textContent).toBe('Quick compare')
    expect(quickCompare.querySelector('form')?.getAttribute('aria-label')).toBe('Quick compare')
  } finally {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.unstubAllGlobals()
  }
})
