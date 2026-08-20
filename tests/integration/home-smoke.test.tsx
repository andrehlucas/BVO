import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

it('introduces the Florida virtual office comparison', () => {
  render(<HomePage />)
  expect(
    screen.getByRole('heading', { name: /compare virtual offices by what you actually need/i }),
  ).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: /city/i })).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: /service needed/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /compare selected options/i })).toBeInTheDocument()
})
