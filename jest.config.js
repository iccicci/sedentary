/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverageFrom:    ["db.ts", "index.ts"],
  preset:                 "ts-jest",
  testEnvironment:        "jest-environment-node-single-context",
  testPathIgnorePatterns: ["/node_modules/", "/sedentary-pg/"],
  testSequencer:          "./testSequencer.js"
};
