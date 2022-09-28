const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "AutomationLH",

  //"reporter": "cypress-mochawesome-reporter",
  reporter: "../node_modules/mochawesome/src/mochawesome.js",

  reporterOptions: {
    charts: true,
    reportPageTitle: "Report Test Case",
    inlineAssets: true,
    reportFilename: "[status]_[datetime]-[name]-report",
    timestamp: "longDate",
    overwrite: false,
    html: false,
    json: true,
  },

  video: false,
  chromeWebSecurity: false,

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    port: 8080,
    specPattern: "**/*.feature",
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
  },
});
