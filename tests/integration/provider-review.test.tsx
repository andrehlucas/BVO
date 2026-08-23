import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProviderPage, { generateMetadata } from '@/app/providers/[slug]/page'

describe('national provider review', () => {
  it('presents Opus as a national provider profile with an evidence-led fit decision', async () => {
    render(await ProviderPage({ params: Promise.resolve({ slug: 'opus-virtual-offices' }) }))

    expect(screen.getByRole('heading', { level: 1, name: /opus virtual offices review/i })).toBeVisible()
    expect(screen.getByRole('heading', { name: /where opus fits in the national market/i })).toBeVisible()
    expect(screen.getByRole('heading', { name: /opus may fit if/i })).toBeVisible()
    expect(screen.getByRole('heading', { name: /think twice if/i })).toBeVisible()
    expect(screen.getByRole('heading', { name: /advantages and tradeoffs/i })).toBeVisible()

    const article = screen.getByRole('region', { name: /opus virtual offices review.*article/i })
    expect(within(article).getByText(/provider says it offers more than 650 locations/i)).toBeVisible()
    expect(within(article).getByText(/does not treat that number as independently verified/i)).toBeVisible()
    expect(within(article).queryByRole('link', { name: /get started|sign up|buy now/i })).not.toBeInTheDocument()
    expect(within(article).queryAllByRole('link').some((link) => link.getAttribute('href')?.startsWith('/go/'))).toBe(false)
  })

  it('uses national SEO metadata instead of framing Opus as a Florida-only offer', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'opus-virtual-offices' }) })

    expect(metadata.title).toMatch(/national services and tradeoffs/i)
    expect(metadata.description).toMatch(/nationwide/i)
    expect(metadata.description).not.toMatch(/published Florida package/i)
    expect(metadata.alternates).toEqual({ canonical: '/providers/opus-virtual-offices' })
  })
})
