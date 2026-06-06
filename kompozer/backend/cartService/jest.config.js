/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
};
