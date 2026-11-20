/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/tests/setup.js'],
    testMatch: ['**/tests/**/*.test.js'],
    testTimeout: 30000,
    forceExit: true,
    detectOpenHandles: true,
    collectCoverageFrom: ['src/**/*.js', '!src/migrations/**', '!src/config/**'],
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov', 'text'],
};
