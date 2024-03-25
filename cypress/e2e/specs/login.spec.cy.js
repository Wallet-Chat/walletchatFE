describe('Test User Login', () => {
      beforeEach(() => {
        cy.visit('/')
      })
 
      it('check for page title', () => {
            const ourMotto = 'Log in to start chatting & earning 🏆'
            cy.get('[data-cy=page-title]').contains(ourMotto);
      })

      it('check the sign in button', () => {
            cy.get('[data-cy=connect-button]')
      })
      
      // it('Click the connect wallet button', () => {
      //       cy.get('[data-cy=connect-button]').click();
      //       //   assuming there is only metamask popping up 
      //       // always important to switch between metamask and cypress window
      //       cy.switchToMetamaskWindow();
      //       // connect to dapp
      //       cy.acceptMetamaskAccess().should("be.true");
      //       cy.confirmMetamaskSignatureRequest();
      //       // switch back to cypress window (your dApp)
      //       cy.switchToCypressWindow();
      //       // check UI change
      //       cy.contains('...').should('be.visible');

      // })
})