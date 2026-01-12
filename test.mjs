import { jest } from '@jest/globals';

// Mock oracledb dynamically
await jest.unstable_mockModule('oracledb', () => ({
  default: {
    initOracleClient: jest.fn(),
    getConnection: jest.fn(),
    execute: jest.fn()
  }
}));

// Import the mocked module
const { default: oracledb } = await import('oracledb');

test('oracledb is mocked', () => {
  expect(oracledb.getConnection).toBeDefined();
});
