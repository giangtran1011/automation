import { Given, Then, Before } from "cypress-cucumber-preprocessor/steps";

function isItFriday(today) {
    // Tạm thời để trống phần này
  }
  
  Given('today is Sunday', function () {
    this.today = 'Sunday';
  });
  
  When('I ask whether it\'s Friday yet', function () {
    this.actualAnswer = isItFriday(this.today);
  });
  
  Then('I should be told {string}', function (expectedAnswer) {
    assert.equal(this.actualAnswer, expectedAnswer);
  });