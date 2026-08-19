import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('geist/font/sans', () => ({ GeistSans: { variable: 'font-geist-sans' } }))
vi.mock('geist/font/mono', () => ({ GeistMono: { variable: 'font-geist-mono' } }))
