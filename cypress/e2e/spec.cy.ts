import "cypress-localstorage-commands";

describe('GA4 Test Spec', () => {
  beforeEach(() => {
    // Set the "jwt" item in localStorage to "test" before visiting the page
    cy.setLocalStorage('jwt', JSON.stringify({"0x2ba7478c2f09612e3b75bb7779138b5da04e87e3":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3dhbGxldGNoYXQuZnVuIiwic3ViIjoiMHgyYmE3NDc4YzJmMDk2MTJlM2I3NWJiNzc3OTEzOGI1ZGEwNGU4N2UzIiwiZXhwIjoxNjkyODc1NDUyLCJpYXQiOjE2OTAyODM0NTJ9.0H7M7g2s1m1Vspbzn7lVsz3OpZXHq6X4LAS5t7U_3HA"}))
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('SignIn_ValidJWT', function() {
    cy.setLocalStorage('jwt', JSON.stringify({"0x2ba7478c2f09612e3b75bb7779138b5da04e87e3":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3dhbGxldGNoYXQuZnVuIiwic3ViIjoiMHgyYmE3NDc4YzJmMDk2MTJlM2I3NWJiNzc3OTEzOGI1ZGEwNGU4N2UzIiwiZXhwIjoxNjkyODc1NDUyLCJpYXQiOjE2OTAyODM0NTJ9.0H7M7g2s1m1Vspbzn7lVsz3OpZXHq6X4LAS5t7U_3HA"}))
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('https://app.walletchat.fun');
    cy.setLocalStorage('jwt', JSON.stringify({"0x2ba7478c2f09612e3b75bb7779138b5da04e87e3":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3dhbGxldGNoYXQuZnVuIiwic3ViIjoiMHgyYmE3NDc4YzJmMDk2MTJlM2I3NWJiNzc3OTEzOGI1ZGEwNGU4N2UzIiwiZXhwIjoxNjkyODc1NDUyLCJpYXQiOjE2OTAyODM0NTJ9.0H7M7g2s1m1Vspbzn7lVsz3OpZXHq6X4LAS5t7U_3HA"}))
    cy.get('.chakra-button').click();
    cy.setLocalStorage('jwt', JSON.stringify({"0x2ba7478c2f09612e3b75bb7779138b5da04e87e3":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3dhbGxldGNoYXQuZnVuIiwic3ViIjoiMHgyYmE3NDc4YzJmMDk2MTJlM2I3NWJiNzc3OTEzOGI1ZGEwNGU4N2UzIiwiZXhwIjoxNjkyODc1NDUyLCJpYXQiOjE2OTAyODM0NTJ9.0H7M7g2s1m1Vspbzn7lVsz3OpZXHq6X4LAS5t7U_3HA"}))
    cy.get('[data-testid="rk-wallet-option-metaMask"]').click();
    /* ==== End Cypress Studio ==== */
  });
})