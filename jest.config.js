const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['node_modules', path.resolve(__dirname, 'lib')],
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  reporters: [
    'default',
    'jest-junit'
  ]
};