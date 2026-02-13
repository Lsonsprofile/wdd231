// js/main.js
import { displayFeaturedFood } from './foodData.js';
import { createCartModal, renderCartModal, updateCartBadge } from './cartModal.js';
import { cart } from './cart.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  // Display featured food items
  await displayFeaturedFood();

  // Create cart modal
  const cartModal = createCartModal();

  // Get cart button
  const cartButton = document.querySelector('#shopcart');
  
  if (cartButton) {
    // Open modal when cart button is clicked
    cartButton.addEventListener('click', (e) => {
      e.preventDefault();
      renderCartModal(cartModal);
      cartModal.style.display = 'flex';
    });
  }

  // Listen for cart updates to refresh badge
  document.addEventListener('cartUpdated', () => {
    updateCartBadge();
  });

  // Initial badge update
  updateCartBadge();
});