import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AffiliateDisclosurePage from '@/app/affiliate-disclosure/page'
import CorrectionsPage from '@/app/corrections/page'
import MethodologyPage from '@/app/methodology/page'
import PrivacyPage from '@/app/privacy/page'

describe('public trust pages', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('publishes the methodology version and the weights users need to inspect a ranking', () => {
    render(<MethodologyPage />)

    expect(screen.getByRole('heading', { name: /see exactly what earns a higher rank/i })).toBeVisible()
    expect(screen.getByText(/version 1\.0\.0/i)).toBeVisible()
    expect(screen.getByText(/comparable total cost/i).closest('li')).toHaveTextContent('30%')
    expect(screen.getByText(/transparency and verifiability/i).closest('li')).toHaveTextContent('25%')
  })

  it('puts an affiliate disclosure next to a plain-language explanation of editorial independence', () => {
    render(<AffiliateDisclosurePage />)

    expect(screen.getByRole('heading', { name: /affiliate links pay us/i })).toBeVisible()
    expect(screen.getByText(/may earn a commission/i)).toBeVisible()
    expect(screen.getByText(/provider compensation never changes a score, rank, or recommendation/i)).toBeVisible()
    expect(screen.getByRole('link', { name: /inspect the ranking rules/i })).toHaveAttribute('href', '/methodology')
  })

  it('describes the no-account flow without promising data collection the app does not perform', () => {
    render(<PrivacyPage />)

    expect(screen.getByRole('heading', { name: /your decision does not require your contact details/i })).toBeVisible()
    expect(screen.getByText(/without creating an account/i)).toBeVisible()
    expect(screen.getByText(/do not collect your name, email address, or phone number/i)).toBeVisible()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('sends corrections to the configured external channel instead of collecting them in the app', () => {
    vi.stubEnv('NEXT_PUBLIC_CORRECTIONS_URL', 'https://example.com/corrections')

    render(<CorrectionsPage />)

    expect(screen.getByRole('heading', { name: /found something we should correct/i })).toBeVisible()
    expect(screen.getByText(/does not collect correction reports inside the comparator/i)).toBeVisible()
    expect(screen.getByRole('link', { name: /submit an evidence-backed correction/i })).toHaveAttribute(
      'href',
      'https://example.com/corrections',
    )
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('uses the editorial email as a mailto fallback when no corrections channel is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_CORRECTIONS_URL', '')
    vi.stubEnv('NEXT_PUBLIC_EDITORIAL_EMAIL', 'editorial@example.com')

    render(<CorrectionsPage />)

    expect(screen.getByRole('link', { name: /email the editorial team/i })).toHaveAttribute(
      'href',
      'mailto:editorial@example.com',
    )
  })
})
