/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: 'src',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '.*/config/env(\\.ts)?$': '<rootDir>/config/env.jest.ts',
  },
  testMatch: ['**/*.spec.(ts|tsx)'],
  collectCoverageFrom: [
    '**/*.(ts|tsx)',
    '!**/*.spec.(ts|tsx)',
    '!main.tsx',
    '!vite-env.d.ts',
    '!config/env.ts',
    '!config/env.jest.ts',
    '!**/*.d.ts',
    '!test-utils/**',
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
