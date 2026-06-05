import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupApiMocks } from './src/test/mocks';

// Setup mocks
setupApiMocks();

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.IASD_API
Object.defineProperty(window, 'IASD_API', {
  value: {
    fetchHome: vi.fn(),
    mapHomeData: vi.fn((data) => data),
    fetchLeadership: vi.fn(),
    apiGet: vi.fn(),
    apiPost: vi.fn(),
  },
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver,
});
