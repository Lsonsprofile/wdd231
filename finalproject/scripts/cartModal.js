// scripts/cartModal.js
import { cart, removeSelectedItems, updateQuantity, toggleSelectItem, getCartTotals, getCartItemCount } from './cart.js';
console.log('cartModal.js loaded');

// Listen for cart updates to refresh the modal if it's open
document.addEventListener('cartUpdated', () => {
    console.log('🔄 cartUpdated event received in cartModal');
    const openModal = document.querySelector('.cart-modal[open]');
    if (openModal) {
        console.log('🔄 Refreshing open modal');
        renderCartModal(openModal);
    }
});

export function createCartModal(container) {
    try {
        // Check if modal already exists
        let modal = document.querySelector('.cart-modal');
        if (modal) {
            return modal;
        }

        // Use <dialog> element
        modal = document.createElement('dialog');
        modal.classList.add('cart-modal');
        
        // Validate container before appending
        if (container && container instanceof HTMLElement) {
            container.appendChild(modal);
            console.log('Cart modal created and appended to container');
        } else {
            // Fallback to body with info log (not warning)
            console.log('Cart modal container not found, appending to body');
            document.body.appendChild(modal);
        }
        
        return modal;
    } catch (error) {
        console.error('Error creating cart modal:', error);
        return null;
    }
}

export function renderCartModal(modal) {
    // Validate modal exists
    if (!modal || !(modal instanceof HTMLElement)) {
        console.error('Invalid modal element provided to renderCartModal');
        return;
    }

    try {
        const { totalItems, totalPrice } = getCartTotals();
        const hasItems = cart.length > 0;

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>&#128722; Your Cart</h2>
                    <button class="close-modal" id="close-modal-btn" aria-label="Close cart">✕</button>
                </div>

                <div class="cart-items-list">
                    ${!hasItems 
                        ? '<p class="empty-cart">Your cart is empty</p>' 
                        : cart.map(item => renderCartItem(item)).join('')}
                </div>

                <div class="modal-footer">
                    <div class="footer-row">
                        <span>Items: ${totalItems}</span>
                        <span>Total: ₦${totalPrice.toLocaleString()}</span>
                    </div>
                    <div class="action-row">
                        <button class="btn-remove" id="remove-selected" ${!hasItems ? 'disabled' : ''}>
                            Remove Selected
                        </button>
                        <button class="btn-place-order" ${!hasItems ? 'disabled' : ''}>
                            Place Order →
                        </button>
                    </div>
                </div>
            </div>
        `;

        attachModalEventListeners(modal);
    } catch (error) {
        console.error('Error rendering cart modal:', error);
        showModalError(modal);
    }
}

// Helper function to render individual cart item
function renderCartItem(item) {
    try {
        console.log(`Rendering item ${item.id} (${item.name}): selected = ${item.selected}`);
        
        const itemTotal = (item.price * item.quantity).toLocaleString();
        const checkedAttr = item.selected ? 'checked' : '';
        
        return `
            <div class="cart-item" data-item-id="${item.id}">
                <input type="checkbox" ${checkedAttr} 
                       data-id="${item.id}" class="select-item" 
                       aria-label="Select ${item.name}">
                <img src="${item.image || 'https://placehold.co/50x50'}" 
                     alt="${item.name}" 
                     onerror="this.src='https://placehold.co/50x50'"
                     loading="lazy">
                <div class="item-info">
                    <div><strong>${escapeHtml(item.name)}</strong></div>
                    <div class="item-price">₦${item.price.toLocaleString()}</div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-action="minus" data-id="${item.id}" 
                            aria-label="Decrease quantity">−</button>
                    <input type="number" class="qty-input" value="${item.quantity}" 
                           min="1" data-id="${item.id}" aria-label="Quantity">
                    <button class="qty-btn" data-action="plus" data-id="${item.id}" 
                            aria-label="Increase quantity">+</button>
                </div>
                <div class="item-total">₦${itemTotal}</div>
            </div>
        `;
    } catch (error) {
        console.error('Error rendering cart item:', error);
        return '<div class="cart-item-error">Error displaying item</div>';
    }
}

// Simple HTML escape function to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Show error message in modal
function showModalError(modal) {
    if (!modal) return;
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Error</h2>
                <button class="close-modal" id="close-modal-btn">✕</button>
            </div>
            <div class="error-message" style="padding: 2rem; text-align: center;">
                <p>Sorry, there was an error loading your cart.</p>
                <button onclick="location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        </div>
    `;
    
    const closeBtn = modal.querySelector('#close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.close());
    }
}

function attachModalEventListeners(modal) {
    if (!modal) return;

    try {
        // Close modal button
        const closeBtn = modal.querySelector('#close-modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                try { modal.close(); } catch (e) { console.error('Error closing modal:', e); }
            });
        }

        // Close modal when clicking backdrop
        modal.addEventListener('click', handleBackdropClick);

        // Prevent clicks inside modal content from closing
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => e.stopPropagation());
        }

        // Attach item-specific event listeners
        attachItemEventListeners(modal);

        // Remove selected button - FIXED: No confirmation alert
        const removeBtn = modal.querySelector('#remove-selected');
        if (removeBtn && !removeBtn.disabled) {
            // Remove any existing listeners first
            removeBtn.removeEventListener('click', handleRemoveSelected);
            removeBtn.addEventListener('click', handleRemoveSelected);
        }

        // Place Order button
        const placeOrderBtn = modal.querySelector('.btn-place-order');
        if (placeOrderBtn && !placeOrderBtn.disabled) {
            attachPlaceOrderListener(placeOrderBtn, modal);
        }

    } catch (error) {
        console.error('Error attaching modal event listeners:', error);
    }
}

function handleBackdropClick(e) {
    try {
        const modal = e.currentTarget;
        const rect = modal.getBoundingClientRect();
        const isInDialog = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
        );
        
        if (!isInDialog) {
            modal.close();
        }
    } catch (error) {
        console.error('Error handling backdrop click:', error);
    }
}

function attachItemEventListeners(modal) {
    if (!modal) return;
    
    try {
        // Quantity buttons
        modal.querySelectorAll('.qty-btn').forEach(btn => {
            // Remove old listeners first
            btn.removeEventListener('click', handleQuantityBtnClick);
            btn.addEventListener('click', handleQuantityBtnClick);
        });

        // Quantity input changes
        modal.querySelectorAll('.qty-input').forEach(input => {
            // Remove old listeners first
            input.removeEventListener('change', handleQuantityInputChange);
            input.addEventListener('change', handleQuantityInputChange);
        });

        // Checkbox toggle - SINGLE IMPLEMENTATION
        modal.querySelectorAll('.select-item').forEach(cb => {
            console.log('📋 Found checkbox for item:', {
                id: cb.dataset.id,
                checked: cb.checked
            });
            
            // Remove old listener first to prevent duplicates
            cb.removeEventListener('change', handleCheckboxChange);
            cb.addEventListener('change', handleCheckboxChange);
        });
        
    } catch (error) {
        console.error('Error in attachItemEventListeners:', error);
    }
}

// Handle quantity button clicks
function handleQuantityBtnClick(e) {
    e.stopPropagation();
    try {
        const modal = e.currentTarget.closest('.cart-modal');
        updateQuantity(e.currentTarget.dataset.id, e.currentTarget.dataset.action);
        if (modal) renderCartModal(modal);
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Handle quantity input changes
function handleQuantityInputChange(e) {
    e.stopPropagation();
    try {
        const modal = e.currentTarget.closest('.cart-modal');
        const newQty = parseInt(e.target.value);
        const id = e.target.dataset.id;
        const item = cart.find(item => item.id === Number(id));
        
        if (item && newQty >= 1 && !isNaN(newQty)) {
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
        if (modal) renderCartModal(modal);
    } catch (error) {
        console.error('Error handling quantity change:', error);
    }
}

// Handle checkbox change events
function handleCheckboxChange(e) {
    e.stopPropagation();
    const checkbox = e.target;
    const itemId = checkbox.dataset.id;
    
    console.log('📋 Checkbox changed:', {
        id: itemId,
        checked: checkbox.checked,
        itemId: itemId,
        idType: typeof itemId
    });
    
    try {
        // Pass the ID directly - toggleSelectItem will convert to number
        toggleSelectItem(itemId);
    } catch (error) {
        console.error('Error toggling item selection:', error);
    }
}

// FIXED: Removed confirmation alert - now removes silently with visual feedback
function handleRemoveSelected(e) {
    e.stopPropagation();
    console.log('🗑️ Remove Selected button clicked');
    
    try {
        // Check current state before removal
        const selectedItems = cart.filter(item => item.selected);
        console.log('Currently selected items:', selectedItems.map(item => ({
            name: item.name,
            selected: item.selected
        })));
        
        if (selectedItems.length === 0) {
            console.log('⚠️ No items selected to remove');
            // Show subtle tooltip instead of alert
            showRemoveTooltip(e.currentTarget, 'No items selected');
            return;
        }
        
        // NO CONFIRMATION ALERT - Remove immediately
        console.log('✅ Removing selected items silently');
        
        // Call removeSelectedItems
        removeSelectedItems();
        
        // Show success feedback
        showRemoveSuccess(e.currentTarget);
        
        // Manually refresh the modal after a short delay to ensure cart is updated
        setTimeout(() => {
            console.log('🔄 Manually refreshing modal after removal');
            const modal = document.querySelector('.cart-modal');
            if (modal && modal.hasAttribute('open')) {
                renderCartModal(modal);
            }
        }, 100);
        
    } catch (error) {
        console.error('Error removing selected items:', error);
        showRemoveTooltip(e.currentTarget, 'Error removing items');
    }
}

// Show subtle tooltip instead of alert
function showRemoveTooltip(button, message) {
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 10000;
        transform: translateY(-100%);
        margin-top: -8px;
    `;
    
    const rect = button.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = rect.top - 10 + 'px';
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
        if (tooltip.parentNode) tooltip.remove();
    }, 1500);
}

// Show success feedback
function showRemoveSuccess(button) {
    const originalText = button.textContent;
    button.textContent = '✓ Removed';
    button.style.backgroundColor = '#4caf50';
    button.style.color = 'white';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
    }, 1500);
}

function attachPlaceOrderListener(button, modal) {
    // Remove any existing listeners by cloning
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            console.log('Place Order clicked');
            console.log('Cart contents:', cart);
            
            if (cart.length > 0) {
                // Save cart to localStorage for the order form
                localStorage.setItem('pendingOrder', JSON.stringify(cart));
                localStorage.setItem('orderTotal', JSON.stringify(getCartTotals()));
                localStorage.setItem('autoFillOrder', 'true');
                
                console.log('Saved to localStorage:', {
                    pendingOrder: cart,
                    orderTotal: getCartTotals()
                });
                
                // Close the modal
                try { modal.close(); } catch (e) { /* ignore */ }
                
                // Redirect to checkout page
                const orderPage = 'order.html';
                window.location.href = orderPage;
            } else {
                // Show subtle tooltip instead of alert
                showRemoveTooltip(e.currentTarget, 'Cart is empty');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showRemoveTooltip(e.currentTarget, 'Error placing order');
        }
    });
}

