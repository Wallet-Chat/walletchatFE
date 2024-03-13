const { defineConfig } = require("cypress");
const synpressPlugins = require("@synthetixio/synpress/plugins");

module.exports = defineConfig({
  userAgent: "synpress",
  chromeWebSecurity: true,
  // defaultCommandTimeout: 30000,
  // pageLoadTimeout: 30000,
  // requestTimeout: 30000,
  e2e: {
    testIsolation: false,
    setupNodeEvents(on, config) {
      synpressPlugins(on, config);
    },
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/index.js",
  },
});