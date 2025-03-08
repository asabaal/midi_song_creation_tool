// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/e2e/cypress/specs/**/*.cy.{js,jsx}',
    supportFile: 'tests/e2e/cypress/support/e2e.js',
    fixturesFolder: 'tests/fixtures',
    screenshotsFolder: 'tests/e2e/cypress/screenshots',
    videosFolder: 'tests/e2e/cypress/videos',
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/client/**/*.cy.{js,jsx}',
  },
  
  env: {
    apiUrl: 'http://localhost:5000/api',
  },
});