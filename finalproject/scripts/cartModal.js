// js/cartModal.js
import { cart, removeSelectedItems, updateQuantity, toggleSelectItem, getCartTotals, getCartItemCount } from './cart.js';

export function createCartModal(container) {
  // Check if modal already exists
  let modal = document.querySelector('.cart-modal');
  if (modal) {
    return modal;
  }

  // Use <dialog> element instead of div
  modal = document.createElement('dialog');
  modal.classList.add('cart-modal');
  
  // Append to the provided container or body as fallback
  if (container) {
    container.appendChild(modal);
  } else {
    document.body.appendChild(modal);
  }
  
  return modal;
}

export function renderCartModal(modal) {
  const { totalItems, totalPrice } = getCartTotals();

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>&#128722; Your Cart</h2>
        <button class="close-modal" id="close-modal-btn" aria-label="Close cart">✕</button>
      </div>

      <div class="cart-items-list">
        ${cart.length === 0 
          ? '<p class="empty-cart">Your cart is empty</p>' 
          : cart.map(item => `
            <div class="cart-item">
              <input type="checkbox" ${item.selected ? 'checked' : ''} data-id="${item.id}" class="select-item">
              <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/50x50'">
              <div class="item-info">
                <div><strong>${item.name}</strong></div>
                <div class="item-price">₦${item.price.toLocaleString()}</div>
              </div>
              <div class="qty-controls">
                <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
                <input type="number" class="qty-input" value="${item.quantity}" min="1" data-id="${item.id}">
                <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
              </div>
              <div class="item-total">₦${(item.price * item.quantity).toLocaleString()}</div>
            </div>
          `).join('')}
      </div>

      <div class="modal-footer">
        <div class="footer-row">
          <span>Items: ${totalItems}</span>
          <span>Total: ₦${totalPrice.toLocaleString()}</span>
        </div>
        <div class="action-row">
          <button class="btn-remove" id="remove-selected" ${cart.length === 0 ? 'disabled' : ''}>Remove Selected</button>
          <button class="btn-place-order" ${cart.length === 0 ? 'disabled' : ''}>Place Order →</button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  attachModalEventListeners(modal);
}

function attachModalEventListeners(modal) {
  // Close modal - using dialog's close method
  const closeBtn = modal.querySelector('#close-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.close(); 
    });
  }

  // Close modal when clicking the backdrop (for dialog)
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    
    if (!isInDialog) {
      modal.close(); // Close if clicked outside
    }
  });

  // Prevent clicks inside modal content from closing
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Quantity buttons
  modal.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateQuantity(btn.dataset.id, btn.dataset.action);
      renderCartModal(modal);
    });
  });

  // Quantity input changes
  modal.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      e.stopPropagation();
      const newQty = parseInt(e.target.value);
      const id = e.target.dataset.id;
      const item = cart.find(item => item.id == id);
      
      if (item && newQty >= 1) {
        const diff = newQty - item.quantity;
        if (diff > 0) {
          for (let i = 0; i < diff; i++) {
            updateQuantity(id, 'plus');
          }
        } else if (diff < 0) {
          for (let i = 0; i < Math.abs(diff); i++) {
            updateQuantity(id, 'minus');
          }
        }
      }
      renderCartModal(modal);
    });
  });

  // Checkbox toggle
  modal.querySelectorAll('.select-item').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleSelectItem(cb.dataset.id);
    });
  });

  // Remove selected
  const removeBtn = modal.querySelector('#remove-selected');
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeSelectedItems();
      renderCartModal(modal);
    });
  }

  // Place Order button
  const placeOrderBtn = modal.querySelector('.btn-place-order');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (cart.length > 0) {
        localStorage.setItem('pendingOrder', JSON.stringify(cart));
        localStorage.setItem('orderTotal', JSON.stringify(getCartTotals()));
        window.location.href = 'order-form.html';
      }
    });
  }
}

export function updateCartBadge() {
  const cartButton = document.querySelector('#shopcart');
  if (!cartButton) {
    return;
  }

  const count = getCartItemCount();
  
  const existingBadge = cartButton.querySelector('.cart-badge');
  if (existingBadge) existingBadge.remove();

  if (count > 0) {
    const badge = document.createElement('span');
    badge.classList.add('cart-badge');
    badge.textContent = count;
    cartButton.style.position = 'relative';
    cartButton.appendChild(badge);
  }
}