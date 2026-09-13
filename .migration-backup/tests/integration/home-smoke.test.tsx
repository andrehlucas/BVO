import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '@/app/page'

it('introduces the Florida virtual office comparison with accessible custom dropdowns', async () => {
  const user = userEvent.setup()
  render(await HomePage())
  expect(
    screen.getByRole('heading', { name: /compare virtual offices by what you actually need/i }),
  ).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: /city/i })).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: /service needed/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /compare selected options/i })).toBeInTheDocument()
  const city = screen.getByRole('combobox', { name: /city/i })
  await user.click(city)
  expect(screen.getByRole('listbox', { name: /city/i })).toBeInTheDocument()
  await user.keyboard('{ArrowDown}{Enter}')
  expect(city).toHaveTextContent('Orlando')
  expect(screen.queryByRole('listbox', { name: /city/i })).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /compare miami virtual offices/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /view miami options/i })).toHaveAttribute('href', '/cities/miami')
})

it('moves from service choice to local comparison, cost, providers, proof, and guides', async () => {
  const { container } = render(await HomePage())
  const sections = [...container.querySelectorAll<HTMLElement>('[data-home-section]')]

  expect(sections.map((section) => section.dataset.homeSection)).toEqual([
    'needs',
    'cities',
    'costs',
    'providers',
    'methodology',
    'guides',
  ])
  expect(screen.getByRole('heading', { name: 'Choose the service before you compare the price' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Avoid the fees that change the real price' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'See how the four providers really differ' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'See why one offer ranks above another' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Compare with a checklist, not a guess' })).toBeInTheDocument()

  for (const [slug, name] of [
    ['orlando', 'Orlando'],
    ['tampa', 'Tampa'],
    ['fort-lauderdale', 'Fort Lauderdale'],
    ['miami', 'Miami'],
    ['boca-raton', 'Boca Raton'],
  ]) {
    expect(screen.getByRole('link', { name: new RegExp(`compare ${name} options`, 'i') })).toHaveAttribute('href', `/cities/${slug}`)
  }

  for (const [slug, name] of [
    ['regus', 'Regus'],
    ['opus-virtual-offices', 'Opus Virtual Offices'],
    ['alliance-virtual-offices', 'Alliance Virtual Offices'],
    ['davinci-virtual', 'Davinci Virtual'],
  ]) {
    expect(screen.getByRole('link', { name: new RegExp(`read the ${name} review`, 'i') })).toHaveAttribute('href', `/providers/${slug}`)
  }

  expect(screen.getByRole('link', { name: /what is a virtual office/i })).toHaveAttribute('href', '/guides/what-is-a-virtual-office')
  expect(screen.getByRole('link', { name: /virtual office fees/i })).toHaveAttribute('href', '/guides/hidden-fees-in-virtual-office-plans')
  expect(screen.getByRole('link', { name: /mail handling vs\. live receptionist/i })).toHaveAttribute('href', '/guides/mail-handling-vs-live-receptionist')
  expect(screen.getByRole('link', { name: /review the ranking method/i })).toHaveAttribute('href', '/methodology')
  expect(screen.getByRole('link', { name: /see how affiliate links work/i })).toHaveAttribute('href', '/affiliate-disclosure')
  expect(container.querySelector('a[href^="/go/"]')).not.toBeInTheDocument()
  expect(container.querySelector('a[href*="business-address-vs-registered-agent"]')).not.toBeInTheDocument()
})
