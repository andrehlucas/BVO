import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

it('introduces the Florida virtual office comparison', () => {
  render(<HomePage />)
  expect(
    screen.getByRole('heading', { name: /compare virtual offices in florida/i }),
  ).toBeInTheDocument()
})
