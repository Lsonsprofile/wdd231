// scripts/main.js

import { displayFeaturedFood } from './foodData.js';
import { createCartModal, renderCartModal, updateCartBadge } from './cartModal.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded - initializing app');
        
        // Display featured food items (only if container exists)
        initializeFeaturedFood();
        
        // Initialize cart modal (only if container exists)
        initializeCartModal();
        
        // Setup cart button (always try to set this up)
        setupCartButton();
        
        // Setup cart update listener
        setupCartUpdateListener();
        
        // Initial badge update
        updateCartBadge();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showErrorMessage('Failed to initialize application. Please refresh the page.');
    }
});

/**
 * Initialize featured food section
 */
async function initializeFeaturedFood() {
    try {
        await displayFeaturedFood();
    } catch (error) {
        console.error('Error displaying featured food:', error);
    }
}

/**
 * Initialize cart modal - only if container exists
 */
function initializeCartModal() {
    try {
        const modalContainer = document.querySelector('#cart-modal-container');
        
        // ✅ FIX: Exit silently if container doesn't exist
        if (!modalContainer) {
            console.log('Cart modal container not present on this page - skipping');
            return;
        }
        
        const cartModal = createCartModal(modalContainer);
        
        if (!cartModal) {
            console.warn('Failed to create cart modal');
        } else {
            console.log('Cart modal initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing cart modal:', error);
    }
}

/**
 * Setup cart button click handler
 */
function setupCartButton() {
    try {
        const cartButton = document.querySelector('#shopcart');
        
        if (!cartButton) {
            console.log('Cart button not present on this page - skipping');
            return;
        }
        
        // Remove any existing listeners to prevent duplicates
        cartButton.removeEventListener('click', handleCartClick);
        cartButton.addEventListener('click', handleCartClick);
        
        console.log('Cart button handler setup successfully');
        
    } catch (error) {
        console.error('Error setting up cart button:', error);
    }
}

/**
 * Handle cart button click
 */
function handleCartClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
        console.log('Cart button clicked');
        
        const cartModal = document.querySelector('.cart-modal');
        
        if (!cartModal) {
            console.error('Cart modal not found');
            alert('Unable to open cart. Please try again.');
            return;
        }
        
        // Render cart contents and show modal
        renderCartModal(cartModal);
        cartModal.showModal();
        
    } catch (error) {
        console.error('Error handling cart click:', error);
        alert('Failed to open cart. Please try again.');
    }
}

/**
 * Setup cart update event listener
 */
function setupCartUpdateListener() {
    try {
        // Remove existing listener to prevent duplicates
        document.removeEventListener('cartUpdated', handleCartUpdate);
        document.addEventListener('cartUpdated', handleCartUpdate);
        console.log('Cart update listener setup successfully');
    } catch (error) {
        console.error('Error setting up cart update listener:', error);
    }
}

/**
 * Handle cart update events
 */
function handleCartUpdate() {
    try {
        updateCartBadge();
    } catch (error) {
        console.error('Error handling cart update:', error);
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0 0.5rem;
    `;
    closeBtn.setAttribute('aria-label', 'Close error message');
    closeBtn.onclick = () => errorDiv.remove();
    
    errorDiv.appendChild(closeBtn);
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}