// js/cart.js

// Load cart from localStorage or initialize empty array
export const cart = loadCartFromStorage();

// Function to load cart from localStorage
function loadCartFromStorage() {
  const savedCart = localStorage.getItem('foodCart');
  return savedCart ? JSON.parse(savedCart) : [];
}

// Function to save cart to localStorage
function saveCartToStorage() {
  localStorage.setItem('foodCart', JSON.stringify(cart));
}

// Add an item to cart
export function addToCart(item) {
  const existing = cart.find(cartItem => cartItem.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1, selected: false });
  }
  saveCartToStorage(); // Save to localStorage
  document.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Remove selected items
export function removeSelectedItems() {
  for (let i = cart.length - 1; i >= 0; i--) {
    if (cart[i].selected) cart.splice(i, 1);
  }
  saveCartToStorage(); // Save to localStorage
  document.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Update quantity of a cart item
export function updateQuantity(id, action) {
  const item = cart.find(item => item.id == id);
  if (!item) return;

  if (action === 'plus') {
    item.quantity += 1;
  }
  if (action === 'minus') {
    item.quantity = Math.max(1, item.quantity - 1);
  }
  saveCartToStorage(); // Save to localStorage
  document.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Toggle checkbox selection
export function toggleSelectItem(id) {
  const item = cart.find(item => item.id == id);
  if (item) {
    item.selected = !item.selected;
    saveCartToStorage(); // Save to localStorage
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  }
}

// Get totals
export function getCartTotals() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
}

// Get cart item count for badge
export function getCartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Clear entire cart (after order placement)
export function clearCart() {
  cart.length = 0; // Empty the array
  saveCartToStorage();
  document.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Get order history (from localStorage)
export function getOrderHistory() {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
}

// Save order to history
export function saveOrderToHistory(orderData) {
  const orders = getOrderHistory();
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Get a specific order by ID
export function getOrderById(orderId) {
  const orders = getOrderHistory();
  return orders.find(order => order.orderId === orderId);
}