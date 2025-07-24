module.exports = {
  preset: "ts-jest",
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  setupFiles: ['reflect-metadata'],
  coverageDirectory: "../coverage",
  testTimeout: 30000,
  maxWorkers: 1,
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "src/index.ts",
    "src/api/api.router.ts",
    "src/api/index.ts"
  ]
};