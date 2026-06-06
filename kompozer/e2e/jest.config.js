/** @type {import('jest').Config} */
module.exports = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  testMatch:       ['**/__tests__/**/*.test.ts'],
  globalSetup:     './globalSetup.js',
  testTimeout:     30000,  // I/O reale: i container possono impiegare più tempo a rispondere
  verbose:         true,
};
