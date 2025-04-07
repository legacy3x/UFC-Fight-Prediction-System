import '@testing-library/jest-dom';
import nock from 'nock';

// Global mocks
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
};

// Clean nock after each test
afterEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

afterAll(() => {
  nock.restore();
});
