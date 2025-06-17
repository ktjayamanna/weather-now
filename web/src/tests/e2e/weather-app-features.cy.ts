/// <reference types="cypress" />

describe('Weather App Features', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-testid="search-bar"]').should('be.visible')
  })

  it('should load the app and show search functionality', () => {
    // Basic test - app loads and search is available
    cy.get('[data-testid="search-input"]').should('be.visible')
    cy.get('[data-testid="settings-button"]').should('be.visible')
    cy.contains('No cities added yet').should('be.visible')
  })

  it('should have search input present', () => {
    // Search input should be visible (may be disabled without API key)
    cy.get('[data-testid="search-input"]').should('be.visible')
    cy.get('[data-testid="search-input"]').should('have.attr', 'placeholder', 'Search for a city or airport')
  })

  it('should open settings modal', () => {
    // Click settings button
    cy.get('[data-testid="settings-button"]').click()

    // Settings modal should open
    cy.get('[data-testid="settings-modal"]').should('be.visible')

    // Close settings
    cy.get('[data-testid="close-settings-button"]').click()
    cy.get('[data-testid="settings-modal"]').should('not.exist')
  })

})
