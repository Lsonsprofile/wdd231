// scripts/main.js

import { createCartModal, renderCartModal } from './cartModal.js';
import { displayFeaturedFood } from './foodData.js'; 
import { addToCart, getCartItemCount } from './cart.js';


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
async function handleCartClick(e) {  // Add 'async' here
    e.preventDefault();
    e.stopPropagation();
    
    try {
        console.log('Cart button clicked');
        
        // Try to find by ID first (more specific), then by class
        let cartModal = document.querySelector('#shoppingCartModal');
        
        // If not found by ID, try by class
        if (!cartModal) {
            cartModal = document.querySelector('.cart-modal');
        }
        
        if (!cartModal) {
            console.error('Cart modal not found');
            // Don't show alert - just log error
            console.log('Creating cart modal...');
            
            // Try to create the modal if it doesn't exist
            const modalContainer = document.querySelector('#cart-modal-container') || document.body;
            const { createCartModal } = await import('./cartModal.js');
            cartModal = createCartModal(modalContainer);
            
            if (!cartModal) {
                console.error('Failed to create cart modal');
                return;
            }
        }
        
        // Render cart contents and show modal
        const { renderCartModal } = await import('./cartModal.js');
        renderCartModal(cartModal);
        cartModal.showModal();
        
    } catch (error) {
        console.error('Error handling cart click:', error);
        // Remove the alert - just log the error
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

function attachAddToCartListeners() {
    const buttons = document.querySelectorAll('.add-to-cart-btn'); // make sure buttons have this class
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Grab item data from dataset attributes or your JS object
            const item = {
                id: Number(btn.dataset.id),
                name: btn.dataset.name,
                price: Number(btn.dataset.price),
                image: btn.dataset.image
            };
            
            const success = addToCart(item);
            if (success) {
                console.log(`Added ${item.name} to cart`);
            } else {
                console.error(`Failed to add ${item.name} to cart`);
            }
        });
    });
}


function updateCartBadge() {
    const badge = document.querySelector('#cart-counter-bubble');
    if (!badge) return;

    const count = getCartItemCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});


