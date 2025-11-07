import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Mock ResizeObserver for Recharts (must be a class for Vitest 4+)
globalThis.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

afterEach(() => {
  cleanup()
})
