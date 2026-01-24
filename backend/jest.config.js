export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/docs/**"],
  moduleNameMapper: {
    "^(\\.{1,2}/)+services/(.*)$": "<rootDir>/src/services/$2",
    "^(\\.{1,2}/)+configs/(.*)$": "<rootDir>/src/configs/$2",
  },
};
