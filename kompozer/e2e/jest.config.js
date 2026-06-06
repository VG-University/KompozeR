/** @type {import('jest').Config} */
module.exports = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  testMatch:       ['**/__tests__/**/*.test.ts'],
  globalSetup:     './globalSetup.js',
  testTimeout:     15000,  // I/O reale: timeout generoso
  verbose:         true,
};
