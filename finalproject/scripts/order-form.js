// scripts/order-form.js

const DELIVERY_FEE = 500;
const REQUIRED_FIELDS = ['fullName', 'phone', 'email', 'address'];
const NOTIFICATION_DURATION = 5000; // 5 seconds
const AUTO_SAVE_DELAY = 1000; // 1 second

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeOrderForm();
});


function initializeOrderForm() {
    try {
        // Set timestamp
        setTimestamp();
        
        // Load cart data (will show empty state if no cart)
        loadCartData();
        
        // Check for auto-fill notification
        checkAutoFillNotification();
        
        // Load saved customer data
        loadCustomerData();
        
        // Setup payment method toggle
        setupPaymentToggle();
        
        // Setup form submission
        setupFormSubmission();
        
        // Setup input formatting
        setupInputFormatting();
        
        // Setup auto-save
        setupAutoSave();
        
        console.log('Order form initialized successfully');
    } catch (error) {
        console.error('Error initializing order form:', error);
        showErrorMessage('Failed to initialize order form. Please refresh the page.');
    }
}

function setTimestamp() {
    const timestampInput = document.getElementById('timestamp');
    if (timestampInput) {
        timestampInput.value = new Date().toISOString();
    }
}

function loadCartData() {
    try {
        // Try pendingOrder first
        const pendingOrder = localStorage.getItem('pendingOrder');
        
        if (pendingOrder) {
            const cart = safeJSONParse(pendingOrder);
            if (cart && Array.isArray(cart) && cart.length > 0) {
                loadCartFromData(cart);
                return;
            }
        }
        
        // Fallback to foodCart
        const foodCart = localStorage.getItem('foodCart');
        if (foodCart) {
            const cart = safeJSONParse(foodCart);
            if (cart && Array.isArray(cart) && cart.length > 0) {
                loadCartFromData(cart);
                return;
            }
        }
        
        // No cart data found - show empty cart message in summary
        showEmptyCartSummary();
        
    } catch (error) {
        console.error('Error loading cart data:', error);
        showEmptyCartSummary();
    }
}

// Safe JSON parser with error handling
function safeJSONParse(str, fallback = null) {
    try {
        return JSON.parse(str) || fallback;
    } catch {
        return fallback;
    }
}

function loadCartFromData(cart) {
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        showEmptyCartSummary();
        return;
    }

    const orderSummaryDiv = document.getElementById('orderSummaryItems');
    if (!orderSummaryDiv) return;

    let subtotal = 0;
    let itemsHTML = '';

    cart.forEach(item => {
        // Validate item data
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
        const itemTotal = price * quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="summary-item">
                <span>${escapeHtml(item.name || 'Item')} x${quantity}</span>
                <span>₦${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });

    const total = subtotal + DELIVERY_FEE;

    // Update DOM elements
    orderSummaryDiv.innerHTML = itemsHTML;
    
    updateElementText('subtotalAmount', `₦${subtotal.toLocaleString()}`);
    updateElementText('totalAmount', `₦${total.toLocaleString()}`);
    
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.innerHTML = `PLACE ORDER – ₦${total.toLocaleString()}`;
        placeOrderBtn.disabled = false;
    }
}

function showEmptyCartSummary() {
    const orderSummaryDiv = document.getElementById('orderSummaryItems');
    if (!orderSummaryDiv) return;

    orderSummaryDiv.innerHTML = `
        <div class="summary-item empty-cart-item">
            <span>Your cart is empty</span>
        </div>
        <div class="summary-item browse-link-item">
            <a href="menu.html" class="browse-menu-link">Browse Menu</a>
        </div>
    `;

    updateElementText('subtotalAmount', '₦0');
    updateElementText('totalAmount', `₦${DELIVERY_FEE}`);
    
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.innerHTML = 'ADD ITEMS TO CART';
        placeOrderBtn.disabled = true;
    }
}

// Helper to safely update element text
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// HTML escape helper
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function checkAutoFillNotification() {
    try {
        const autoFill = localStorage.getItem('autoFillOrder');
        if (autoFill === 'true') {
            showNotification('✨ Your cart has been loaded automatically');
            localStorage.removeItem('autoFillOrder');
        }
    } catch (error) {
        console.error('Error checking auto-fill notification:', error);
    }
}

function showNotification(message) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'auto-fill-notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
            <span>${escapeHtml(message)}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; 
                           border: none; 
                           color: white; 
                           font-size: 1.2rem; 
                           cursor: pointer;
                           padding: 0 0.5rem;"
                    aria-label="Close notification">✕</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, NOTIFICATION_DURATION);
}

function loadCustomerData() {
    try {
        const savedCustomer = localStorage.getItem('customerProfile');
        if (!savedCustomer) return;

        const customer = safeJSONParse(savedCustomer, {});
        if (!customer || typeof customer !== 'object') return;

        // Safely populate form fields
        setInputValue('fullName', customer.fullName);
        setInputValue('phone', customer.phoneNumber);
        setInputValue('email', customer.emailAddress);
        setInputValue('address', customer.deliveryAddress);

    } catch (error) {
        console.error('Error loading customer data:', error);
    }
}

// Helper to safely set input value
function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input && value && typeof value === 'string') {
        input.value = value;
    }
}

function saveCustomerData() {
    try {
        const customerData = {
            fullName: getInputValue('fullName'),
            phoneNumber: getInputValue('phone'),
            emailAddress: getInputValue('email'),
            deliveryAddress: getInputValue('address')
        };
        
        // Only save if at least one field has content
        const hasContent = Object.values(customerData).some(value => value && value.trim());
        
        if (hasContent) {
            localStorage.setItem('customerProfile', JSON.stringify(customerData));
        }
    } catch (error) {
        console.error('Error saving customer data:', error);
    }
}

// Helper to safely get input value
function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
}

function setupPaymentToggle() {
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const cardContainer = document.getElementById('cardDetailsContainer');
    const bankContainer = document.getElementById('bankDetailsContainer');

    if (!paymentRadios.length || !cardContainer || !bankContainer) {
        console.log('Payment elements not found - may be added later');
        return; // Exit silently, no error
    }

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            try {
                const isCard = this.value === 'card';
                const isBank = this.value === 'bank';
                
                cardContainer.style.display = isCard ? 'block' : 'none';
                bankContainer.style.display = isBank ? 'block' : 'none';
                
                // Toggle required attributes for card fields
                toggleCardFieldsRequired(isCard);
            } catch (error) {
                console.error('Error toggling payment method:', error);
            }
        });
    });

    // Trigger initial state
    const checkedRadio = document.querySelector('input[name="payment"]:checked');
    if (checkedRadio) {
        const event = new Event('change');
        checkedRadio.dispatchEvent(event);
    }
}

function toggleCardFieldsRequired(required) {
    const cardFields = ['cardNumber', 'expiry', 'cvc'];
    cardFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.required = required;
        }
    });
}

function setupFormSubmission() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    try {
        // Validate cart
        const cart = getCartFromStorage();
        if (!cart || cart.length === 0) {
            alert('Your cart is empty. Please add items before ordering.');
            window.location.href = 'menu.html';
            return;
        }

        // Validate required fields
        if (!validateRequiredFields()) {
            return;
        }

        // Validate payment method
        if (!validatePaymentMethod()) {
            return;
        }

        // Calculate totals
        const subtotal = calculateSubtotal(cart);
        const total = subtotal + DELIVERY_FEE;

        // Create order
        const order = createOrder(cart, subtotal, total);

        // Save order data
        await saveOrder(order);

        // Clear cart and redirect
        clearOrderData();
        
        // Show success message and redirect
        showOrderSuccess(order.orderId);

    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error placing your order. Please try again.');
    }
}

function getCartFromStorage() {
    try {
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
            return safeJSONParse(pendingOrder, []);
        }
        
        const foodCart = localStorage.getItem('foodCart');
        if (foodCart) {
            return safeJSONParse(foodCart, []);
        }
        
        return [];
    } catch (error) {
        console.error('Error getting cart from storage:', error);
        return [];
    }
}

function validateRequiredFields() {
    for (let fieldId of REQUIRED_FIELDS) {
        const input = document.getElementById(fieldId);
        if (!input || !input.value.trim()) {
            if (input) input.focus();
            
            const fieldName = fieldId.replace(/([A-Z])/g, ' $1').toLowerCase();
            alert(`Please fill in ${fieldName}`);
            return false;
        }
    }
    return true;
}

function validatePaymentMethod() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
        alert('Please select a payment method');
        return false;
    }

    if (paymentMethod.value === 'card') {
        return validateCardDetails();
    }

    return true;
}

function validateCardDetails() {
    const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry')?.value;
    const cvc = document.getElementById('cvc')?.value;

    if (!cardNumber || cardNumber.length < 16) {
        alert('Please enter a valid card number');
        return false;
    }

    if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
        alert('Please enter a valid expiry date (MM/YY)');
        return false;
    }

    if (!cvc || cvc.length < 3) {
        alert('Please enter a valid CVC');
        return false;
    }

    return true;
}

function calculateSubtotal(cart) {
    return cart.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
        return sum + (price * quantity);
    }, 0);
}

function createOrder(cart, subtotal, total) {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';
    
    return {
        orderId: generateOrderId(),
        orderDate: new Date().toISOString(),
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        customer: {
            name: getInputValue('fullName'),
            phone: getInputValue('phone'),
            email: getInputValue('email'),
            address: getInputValue('address'),
            deliveryTime: document.getElementById('deliveryTime')?.value || 'asap',
            instructions: document.getElementById('instructions')?.value || ''
        },
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        deliveryFee: DELIVERY_FEE,
        total: total,
        status: 'pending'
    };
}

function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}

async function saveOrder(order) {
    try {
        // Save customer data
        saveCustomerData();

        // Save to order history
        const orders = getOrderHistory();
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        console.log('Order saved successfully:', order.orderId);
    } catch (error) {
        console.error('Error saving order:', error);
        throw new Error('Failed to save order');
    }
}

function getOrderHistory() {
    try {
        const orders = localStorage.getItem('orders');
        return orders ? JSON.parse(orders) : [];
    } catch (error) {
        console.error('Error loading order history:', error);
        return [];
    }
}

function clearOrderData() {
    try {
        localStorage.removeItem('foodCart');
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('orderTotal');
        localStorage.removeItem('autoFillOrder');
        
        // Dispatch cart update event
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
        console.error('Error clearing order data:', error);
    }
}

function showOrderSuccess(orderId) {
    // Redirect to thank you page without alert
    window.location.href = 'thankyou.html?id=' + encodeURIComponent(orderId);
}

function setupInputFormatting() {
    // Card number formatting
    const cardInput = document.getElementById('cardNumber');
    if (cardInput) {
        cardInput.addEventListener('input', formatCardNumber);
    }

    // Expiry formatting
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiry);
    }

    // CVC formatting
    const cvcInput = document.getElementById('cvc');
    if (cvcInput) {
        cvcInput.addEventListener('input', formatNumeric);
    }

    // Phone formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    e.target.value = formatted;
}

function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
        e.target.value = value;
    }
}

function formatNumeric(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3 && value.length <= 7) {
        e.target.value = value.slice(0, 3) + ' ' + value.slice(3);
    } else if (value.length > 7) {
        e.target.value = value.slice(0, 3) + ' ' + value.slice(3, 7) + ' ' + value.slice(7, 11);
    } else {
        e.target.value = value;
    }
}

function setupAutoSave() {
    REQUIRED_FIELDS.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('input', debounce(saveCustomerData, AUTO_SAVE_DELAY));
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showErrorMessage(message) {
    const container = document.getElementById('notificationContainer') || document.body;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.style.cssText = 'background: #dc3545; color: white; padding: 1rem; margin: 1rem; border-radius: 4px;';
    errorDiv.textContent = message;
    container.prepend(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}