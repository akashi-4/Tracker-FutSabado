import '@testing-library/jest-dom'

// Add polyfills for Node.js environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock MongoDB ObjectId for tests
jest.mock('mongodb', () => ({
  ...jest.requireActual('mongodb'),
  ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || 'mock-object-id' }))
})); 