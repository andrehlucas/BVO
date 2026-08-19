import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToStaticMarkup } from 'react-dom/server'
import RootLayout from '@/app/layout'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { GlassSurface } from '@/components/ui/glass-surface'

describe('shared site layout', () => {
  it('provides a skip link and one labelled primary navigation landmark', () => {
    const document = renderToStaticMarkup(<RootLayout>Page content</RootLayout>)
    expect(document).toContain('href="#main-content"')
    expect(document).toContain('Skip to main content')

    render(<SiteHeader />)

    expect(
      screen.getByRole('navigation', { name: /primary navigation/i }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('navigation', { name: /primary navigation/i }),
    ).toHaveLength(1)
  })

  it('offers the core editorial routes through keyboard-focusable links', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)
    const primaryNavigation = screen.getByRole('navigation', {
      name: /primary navigation/i,
    })

    for (const [name, href] of [
      ['Cities', '/florida'],
      ['Providers', '/providers'],
      ['Guides', '/guides'],
      ['Methodology', '/methodology'],
    ]) {
      expect(within(primaryNavigation).getByRole('link', { name })).toHaveAttribute(
        'href',
        href,
      )
    }

    await user.tab()
    expect(
      screen.getByRole('link', { name: /florida virtual office comparison/i }),
    ).toHaveFocus()
  })

  it('keeps the affiliate disclosure visible in the shared footer', () => {
    render(<SiteFooter />)

    expect(
      screen.getByText(
        /we may earn a commission if you purchase through a link on this page/i,
      ),
    ).toBeVisible()
    expect(
      screen.getByText(/this never affects our rankings or recommendations/i),
    ).toBeVisible()
  })

  it('uses a semantic glass surface with an explicit solid fallback class', () => {
    render(
      <GlassSurface as="section" aria-label="Comparison controls">
        Controls
      </GlassSurface>,
    )

    expect(
      screen.getByRole('region', { name: /comparison controls/i }),
    ).toHaveClass('glass-surface--solid-fallback')
  })
})
