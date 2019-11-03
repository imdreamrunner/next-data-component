module.exports = {
  'Server-side rendering': function(browser) {
    browser
      .url('http://localhost:3000')
      .waitForElementVisible('#welcome-message')
      .assert.containsText('#welcome-message', 'Hello world from server')
      .end();
  },

  'Client-side rendering': function(browser) {
    browser
      .url('http://localhost:3000/about')
      .waitForElementVisible('#link-to-index')
      .click('#link-to-index')
      .assert.containsText('#welcome-message', 'Hello world from browser')
      .end();
  }
};
