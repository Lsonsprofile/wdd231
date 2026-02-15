// scripts/cart.js
// Load cart from localStorage or initialize empty array
export let cart = [];

// Initialize cart on module load
try {
    cart = loadCartFromStorage();
} catch (error) {
    console.error('Failed to initialize cart:', error);
    cart = [];
}

// Function to load cart from localStorage with error handling
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('foodCart');
        if (!savedCart) return [];
        
        const parsedCart = JSON.parse(savedCart);
        // Validate that parsedCart is an array
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // If corrupted, remove it
        localStorage.removeItem('foodCart');
        return [];
    }
}

// Function to save cart to localStorage with error handling
function saveCartToStorage() {
    try {
        localStorage.setItem('foodCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
        // Could be storage full - notify user
        alert('Unable to save cart. Local storage might be full.');
    }
}

// Validate item structure
function isValidItem(item) {
    return item && 
           typeof item === 'object' && 
           typeof item.id === 'number' && 
           typeof item.name === 'string' && 
           typeof item.price === 'number' && 
           (!item.quantity || typeof item.quantity === 'number');
}

// Add an item to cart
export function addToCart(item) {
    // Validate item
    if (!isValidItem(item)) {
        console.error('Invalid item structure:', item);
        return false;
    }

    try {
        const existing = cart.find(cartItem => cartItem.id === item.id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({ 
                ...item, 
                quantity: 1, 
                selected: false 
            });
        }
        saveCartToStorage();
        dispatchCartUpdate();
        return true;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        return false;
    }
}

// Remove selected items
export function removeSelectedItems() {
    try {
        console.log('🔧 removeSelectedItems STARTED');
        console.log('Current cart before removal:', JSON.stringify(cart));
        
        // Log which items are selected
        const selectedItems = cart.filter(item => item.selected);
        console.log('Selected items to remove:', selectedItems.map(item => ({
            id: item.id,
            name: item.name,
            selected: item.selected
        })));
        
        const initialLength = cart.length;
        console.log('Initial cart length:', initialLength);
        
        // Filter out selected items
        const newCart = cart.filter(item => {
            const keep = !item.selected;
            console.log(`Item "${item.name}": selected=${item.selected}, keep=${keep}`);
            return keep;
        });
        
        console.log('New cart after filter:', JSON.stringify(newCart));
        console.log('New cart length:', newCart.length);
        
        // Update cart
        cart.length = 0; // Clear the array
        newCart.forEach(item => cart.push(item)); // Add filtered items
        
        if (cart.length !== initialLength) {
            console.log('💾 Saving to localStorage...');
            saveCartToStorage();
            
            console.log('📢 Dispatching cartUpdated event...');
            dispatchCartUpdate();
            
            // Dispatch a second time after a tiny delay to ensure all listeners get it
            setTimeout(() => {
                console.log('📢 Dispatching second cartUpdated event...');
                dispatchCartUpdate();
            }, 50);
            
            console.log('✅ Selected items removed successfully');
        } else {
            console.log('⚠️ No items were removed - cart length unchanged');
        }
        
        console.log('🔧 removeSelectedItems FINISHED');
        
    } catch (error) {
        console.error('❌ Error removing selected items:', error);
    }
}

// Update quantity of a cart item
export function updateQuantity(id, action) {
    try {
        const item = cart.find(item => item.id === Number(id));
        if (!item) return;

        const oldQuantity = item.quantity;
        
        if (action === 'plus') {
            item.quantity += 1;
        }
        if (action === 'minus') {
            item.quantity = Math.max(1, item.quantity - 1);
        }
        
        // Only save if quantity actually changed
        if (oldQuantity !== item.quantity) {
            saveCartToStorage();
            dispatchCartUpdate();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Toggle checkbox selection
export function toggleSelectItem(id) {
    try {
        console.log(`🔘 toggleSelectItem called for ID: ${id} (type: ${typeof id})`);
        console.log('Current cart before toggle:', JSON.stringify(cart.map(item => ({
            id: item.id,
            name: item.name,
            selected: item.selected
        }))));
        
        // Convert id to number for comparison
        const numericId = Number(id);
        console.log(`Looking for item with ID: ${numericId}`);
        
        const item = cart.find(item => item.id === numericId);
        
        if (item) {
            console.log(`Found item: ${item.name}, current selected: ${item.selected}`);
            
            // Toggle the selected property
            item.selected = !item.selected;
            
            console.log(`Toggled to: ${item.selected}`);
            console.log('Updated cart:', JSON.stringify(cart.map(item => ({
                id: item.id,
                name: item.name,
                selected: item.selected
            }))));
            
            // Save to localStorage
            saveCartToStorage();
            
            // Dispatch update event
            dispatchCartUpdate();
            
            console.log('✅ toggleSelectItem completed successfully');
        } else {
            console.log(`❌ Item with ID ${numericId} not found in cart`);
            console.log('Available IDs:', cart.map(item => item.id));
        }
    } catch (error) {
        console.error('Error toggling item selection:', error);
    }
}

// Get totals with validation
export function getCartTotals() {
    try {
        const totalItems = cart.reduce((sum, item) => {
            const qty = typeof item.quantity === 'number' ? item.quantity : 0;
            return sum + qty;
        }, 0);
        
        const totalPrice = cart.reduce((sum, item) => {
            const price = typeof item.price === 'number' ? item.price : 0;
            const qty = typeof item.quantity === 'number' ? item.quantity : 0;
            return sum + (price * qty);
        }, 0);
        
        return { totalItems, totalPrice };
    } catch (error) {
        console.error('Error calculating cart totals:', error);
        return { totalItems: 0, totalPrice: 0 };
    }
}

// Get cart item count for badge
export function getCartItemCount() {
    try {
        return cart.reduce((sum, item) => {
            return sum + (typeof item.quantity === 'number' ? item.quantity : 0);
        }, 0);
    } catch (error) {
        console.error('Error getting cart count:', error);
        return 0;
    }
}

// Clear entire cart (after order placement)
export function clearCart() {
    try {
        cart = [];
        saveCartToStorage();
        dispatchCartUpdate();
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Get order history (from localStorage)
export function getOrderHistory() {
    try {
        const orders = localStorage.getItem('orders');
        return orders ? JSON.parse(orders) : [];
    } catch (error) {
        console.error('Error loading order history:', error);
        return [];
    }
}

// Save order to history
export function saveOrderToHistory(orderData) {
    try {
        if (!orderData || typeof orderData !== 'object') {
            throw new Error('Invalid order data');
        }
        
        const orders = getOrderHistory();
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
    } catch (error) {
        console.error('Error saving order to history:', error);
    }
}

// Get a specific order by ID
export function getOrderById(orderId) {
    try {
        const orders = getOrderHistory();
        return orders.find(order => order.orderId === orderId);
    } catch (error) {
        console.error('Error finding order:', error);
        return null;
    }
}

// Helper function to dispatch cart update event
function dispatchCartUpdate() {
    try {
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
        console.error('Error dispatching cart update event:', error);
    }
}



