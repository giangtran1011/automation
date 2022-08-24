### 1. Introduction

* Cypress E2E runner can also test Rest and other APIs

* See related blog post Add GUI to your E2E API tests

* Install Cypress: https://docs.cypress.io/guides/getting-started/installing-cypress

### 2. Structure

```shell
intergration-test/
  ├─  cypress/
  │        │
  │        ├── fixtures/
  │        │   ├── *.json
  │        │   ├── *.csv       
  │        │   └── *.png
  │        │
  │        ├── integration/
  │        │   ├── <category>/
  │        │   │   └── <tests>Tests.spec.js
  │        │   └── <category2>/
  │        │       └── <tests>Tests.spec.js  
  │        │
  │        ├── plugins/
  │        │   └── index.js
  │        │
  │        │
  │        └── support/
  │            ├── utils/
  │            │   ├── common.js
  │            │   ├── globalConstant.js
  │            ├── requests
  │            │   ├── <requests>/Tests.requests.js
  │            ├── Commands.js
  │            └── index.js
  │           
  │ 
  ├── allure-results/
  ├── cypress.env.json
  ├── node_modules/
  ├── cypress.json
  ├── package-lock.json
  ├── package.json
  └── README.md
```

### 3. Config & run testing

#### - Install dependencies
* yarn # or npm install

#### - See scripts in package.json to start the local API server and run the tests. The main ones are

###### Run tests in headless mode
* yarn test: "cypress run --headless"
###### Run tests in headless mode and fail fast
* yarn test:fail-fast: "CYPRESS_FAIL_FAST_ENABLED=true cypress run --headless"
###### Open cypress in interactive browser via GUI
* yarn open: "cypress open" 
###### Open cypress in interactive browservia GUI
* yarn report: "cypress run --reporter mocha-allure-reporter" 
###### Generate report in allure format and open it in browser
* yarn export: "allure generate allure-results --clean -o allure-report && allure open  allure-report" 

