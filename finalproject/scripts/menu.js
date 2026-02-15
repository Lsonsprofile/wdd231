// scripts/menu.js

import { addToCart, getCartItemCount } from './cart.js';
import { createCartModal, renderCartModal } from './cartModal.js';

// Constants
const FOOD_URL = "https://lsonsprofile.github.io/wdd231/finalproject/data/food.json";
const FAVORITES_STORAGE_KEY = 'menuFavorites';
const ITEMS_PER_LOAD = 18;
const FILTER_DEBOUNCE_DELAY = 300; // ms
const IMAGE_PLACEHOLDER = 'https://placehold.co/300x200?text=Food';

// State
let allItems = [];
let filteredItems = [];
let favorites = loadFavorites();
let visibleCount = ITEMS_PER_LOAD;
let currentCategory = "All";
let filterTimeout = null;

// DOM Elements - will be initialized in DOMContentLoaded
let grid = null;
let viewMoreBtn = null;
let categoryBar = null;
let favTrigger = null;
let favMenu = null;
let favCountSpan = null;
let favListContainer = null;
let cartButton = null;
let cartBadge = null;
let modalContainer = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initializeDOMElements();
        if (!grid) return; // Exit if grid not found
        
        await initializeModal();
        await loadFood();
        setupEventListeners();
        updateBadge();
        
        // Listen for cart updates
        document.addEventListener('cartUpdated', updateBadge);
        
        console.log('Menu initialized successfully');
    } catch (error) {
        console.error('Error initializing menu:', error);
        showErrorMessage('Failed to initialize menu. Please refresh the page.');
    }
});

function initializeDOMElements() {
    grid = document.querySelector('#menuItemsGrid');
    viewMoreBtn = document.querySelector('#loadMoreBtn');
    categoryBar = document.querySelector('#categoryFilterBar');
    favTrigger = document.querySelector('#favoritesToggleBtn');
    favMenu = document.querySelector('#favoritesDropdown');
    favCountSpan = document.querySelector('#favoritesCount');
    favListContainer = document.querySelector('#favoritesList');
    cartButton = document.querySelector('#shopcart');
    cartBadge = document.querySelector('#cart-counter-bubble');
    modalContainer = document.querySelector('#shoppingCartModal');
}

async function initializeModal() {
    if (modalContainer) {
        createCartModal(modalContainer);
    }
}

function loadFavorites() {
    try {
        const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
    }
}

function saveFavorites() {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

async function loadFood() {
    if (!grid) return;
    
    try {
        grid.innerHTML = '<p class="loading" role="status">Loading menu...</p>';
        
        const response = await fetchWithTimeout(FOOD_URL);
        const data = await response.json();
        
        // Validate data structure
        if (!data || !Array.isArray(data.food)) {
            throw new Error('Invalid data format');
        }
        
        // Filter out invalid items
        allItems = data.food.filter(validateFoodItem);
        
        if (allItems.length === 0) {
            grid.innerHTML = '<p class="empty">No menu items available.</p>';
            return;
        }
        
        applyFilter(true);
        
    } catch (error) {
        console.error('Error loading food:', error);
        grid.innerHTML = `
            <div class="error" role="alert">
                <p>Menu unavailable. Please try again.</p>
                <button onclick="location.reload()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

function validateFoodItem(item) {
    const required = ['id', 'name', 'price', 'category', 'image'];
    const hasRequired = required.every(field => item[field] !== undefined);
    
    if (!hasRequired) {
        console.warn('Invalid food item:', item);
        return false;
    }
    
    // Validate types
    return (
        typeof item.id === 'number' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        typeof item.category === 'string'
    );
}

function shuffleArray(array) {
    try {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    } catch (error) {
        console.error('Error shuffling array:', error);
        return [...array]; // Return copy without shuffling
    }
}

function normalize(str) {
    try {
        return str?.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[\/&]/g, '') || '';
    } catch {
        return '';
    }
}

function handleImageError(e) {
    const img = e.target;
    img.onerror = null; // Prevent infinite loop
    img.src = IMAGE_PLACEHOLDER;
    img.alt = 'Food image unavailable';
}

function applyFilter(shouldShuffle = true) {
    try {
        visibleCount = ITEMS_PER_LOAD;
        
        let items = currentCategory === "All"
            ? [...allItems]
            : allItems.filter(item => 
                normalize(item.category) === normalize(currentCategory)
            );
        
        if (shouldShuffle) {
            items = shuffleArray(items);
        }
        
        filteredItems = items;
        render();
        
    } catch (error) {
        console.error('Error applying filter:', error);
    }
}

function applyFilterDebounced() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => applyFilter(true), FILTER_DEBOUNCE_DELAY);
}

function createMenuItemCard(item) {
    const isFavorite = favorites.includes(item.id);
    const escapedName = escapeHtml(item.name);
    const escapedCategory = escapeHtml(item.category);
    
    return `
        <article class="food-card" data-item-id="${item.id}">
            <div class="card-img-container">
                <img src="${escapeHtml(item.image)}" 
                     alt="${escapedName}" 
                     loading="lazy" 
                     class="food-image"
                     onerror="this.onerror=null; this.src='${IMAGE_PLACEHOLDER}';">
            </div>

            <div class="card-info">
                <h3 class="food-name">${escapedName}</h3>
                <p class="food-category">${escapedCategory}</p>
                <p class="food-price">₦${item.price.toLocaleString()}</p>
            </div>

            <div class="card-actions">
                <button class="icon-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                        data-item-id="${item.id}"
                        aria-label="${isFavorite ? 'Remove from' : 'Add to'} favorites">
                    ♥
                </button>
                <button class="icon-btn cart-add-btn" 
                        data-item-id="${item.id}"
                        aria-label="Add to cart">
                    🛒
                </button>
            </div>
        </article>
    `;
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function render() {
    if (!grid) return;
    
    try {
        const toShow = filteredItems.slice(0, visibleCount);
        
        if (!toShow.length) {
            grid.innerHTML = '<p class="empty">No items found in this category.</p>';
            return;
        }
        
        grid.innerHTML = toShow.map(createMenuItemCard).join('');
        
        // Add image error handlers
        document.querySelectorAll('.food-image').forEach(img => {
            img.addEventListener('error', handleImageError);
        });
        
        // Update view more button visibility
        if (viewMoreBtn) {
            viewMoreBtn.style.display = visibleCount >= filteredItems.length ? 'none' : 'inline-block';
        }
        
    } catch (error) {
        console.error('Error rendering menu:', error);
        grid.innerHTML = '<p class="error">Error displaying menu items.</p>';
    }
}

function setupEventListeners() {
    try {
        // View more button
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', handleViewMore);
        }
        
        // Category filter
        if (categoryBar) {
            categoryBar.addEventListener('click', handleCategoryClick);
        }
        
        // Grid interactions (favorite and cart buttons)
        if (grid) {
            grid.addEventListener('click', handleGridClick);
        }
        
        // Favorites toggle
        if (favTrigger) {
            favTrigger.addEventListener('click', handleFavoritesToggle);
        }
        
        // Cart button
        if (cartButton) {
            cartButton.addEventListener('click', handleCartClick);
        }
        
        // Close favorites menu when clicking outside
        window.addEventListener('click', handleOutsideClick);
        
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

function handleViewMore() {
    try {
        visibleCount += ITEMS_PER_LOAD;
        render();
    } catch (error) {
        console.error('Error loading more items:', error);
    }
}

function handleCategoryClick(e) {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    
    try {
        // Update active state
        categoryBar.querySelectorAll('.filter-pill').forEach(b => 
            b.classList.remove('active-filter')
        );
        btn.classList.add('active-filter');
        
        // Update category and filter
        currentCategory = btn.dataset.group;
        applyFilterDebounced();
        
    } catch (error) {
        console.error('Error handling category click:', error);
    }
}

function handleGridClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    try {
        const id = Number(btn.dataset.itemId);
        if (!id) return;
        
        if (btn.classList.contains('favorite-btn')) {
            toggleFavorite(id, btn);
        }
        
        if (btn.classList.contains('cart-add-btn')) {
            handleAddToCart(id, btn);
        }
        
    } catch (error) {
        console.error('Error handling grid click:', error);
    }
}

function toggleFavorite(id, btn) {
    try {
        const index = favorites.indexOf(id);
        
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(id);
        }
        
        saveFavorites();
        
        // Update UI
        btn.classList.toggle('active');
        
        if (favCountSpan) {
            favCountSpan.textContent = favorites.length;
        }
        
        renderFavoritesList();
        
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

function handleAddToCart(id, btn) {
    try {
        const item = allItems.find(f => f.id === id);
        if (!item) {
            console.error('Item not found:', id);
            return;
        }
        
        const success = addToCart(item);
        
        if (success) {
            showAddFeedback(btn);
        } else {
            alert('Failed to add item to cart. Please try again.');
        }
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

function showAddFeedback(btn) {
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "✓";
    btn.setAttribute('aria-label', 'Added to cart');
    
    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = original;
        btn.setAttribute('aria-label', 'Add to cart');
    }, 800);
}

function handleFavoritesToggle(e) {
    e.stopPropagation();
    
    try {
        if (favMenu) {
            favMenu.classList.toggle('show');
            renderFavoritesList();
        }
    } catch (error) {
        console.error('Error toggling favorites menu:', error);
    }
}

function renderFavoritesList() {
    if (!favListContainer) return;
    
    try {
        if (!favorites.length) {
            favListContainer.innerHTML = '<p class="empty-fav">No favorites yet.</p>';
            return;
        }
        
        const favItems = allItems.filter(i => favorites.includes(i.id));
        
        // Group by category
        const grouped = favItems.reduce((acc, item) => {
            const cat = item.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});
        
        favListContainer.innerHTML = Object.entries(grouped)
            .map(([cat, list]) => `
                <div class="fav-group">
                    <h4>${escapeHtml(cat)}</h4>
                    ${list.map(i => `
                        <div class="fav-item-name">${escapeHtml(i.name)}</div>
                    `).join('')}
                </div>
            `).join('');
            
    } catch (error) {
        console.error('Error rendering favorites list:', error);
        favListContainer.innerHTML = '<p class="error">Error loading favorites.</p>';
    }
}

function handleCartClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
        const dialogModal = document.querySelector('.cart-modal');
        if (!dialogModal) {
            console.warn('Cart modal not found');
            return;
        }
        
        renderCartModal(dialogModal);
        dialogModal.showModal();
        
    } catch (error) {
        console.error('Error opening cart:', error);
        alert('Failed to open cart. Please try again.');
    }
}

function handleOutsideClick() {
    try {
        if (favMenu && favMenu.classList.contains('show')) {
            favMenu.classList.remove('show');
        }
    } catch (error) {
        console.error('Error handling outside click:', error);
    }
}

function updateBadge() {
    try {
        if (!cartBadge) return;
        
        const count = getCartItemCount();
        cartBadge.textContent = count;
        
        // Update visibility based on count
        cartBadge.style.display = count > 0 ? 'inline' : 'none';
        
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

function showErrorMessage(message) {
    if (!grid) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.style.cssText = `
        background: #dc3545;
        color: white;
        padding: 1rem;
        margin: 1rem;
        border-radius: 4px;
        text-align: center;
    `;
    errorDiv.textContent = message;
    
    grid.prepend(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }
});