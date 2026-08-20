import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '@/app/page'

it('introduces the Florida virtual office comparison with accessible custom dropdowns', async () => {
  const user = userEvent.setup()
  render(<HomePage />)
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
