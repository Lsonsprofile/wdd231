// js/main.js
import { displayFeaturedFood } from './foodData.js';
import { createCartModal, renderCartModal, updateCartBadge } from './cartModal.js';
import { cart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing app');
  
  displayFeaturedFood();

  const modalContainer = document.querySelector('#cart-modal-container');
  const cartModal = createCartModal(modalContainer);
  
  const cartButton = document.querySelector('#shopcart');
  
  if (cartButton) {
    cartButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Cart button clicked');
      
      renderCartModal(cartModal);
      
    
      cartModal.showModal(); 
    });
  }

  document.addEventListener('cartUpdated', () => {
    updateCartBadge();
  });

  updateCartBadge();
});