// scripts/foodData.js
import { addToCart } from './cart.js';

const FOOD_URL = "https://lsonsprofile.github.io/wdd231/finalproject/data/food.json";
const STORAGE_KEY = 'dailyFeaturedItems';
const TIMESTAMP_KEY = 'dailyFeaturedTimestamp';
const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const FETCH_TIMEOUT = 5000; // 5 seconds

// Cache for star SVG paths to avoid hardcoding everywhere
const STAR_ASSETS = {
    full: 'images/star-fill.svg',
    half: 'images/star-half.svg',
    empty: 'images/star.svg',
    fallback: '⭐' // Text fallback if images fail to load
};

/**
 * Fetch and display featured food items
 */
// scripts/foodData.js

export async function displayFeaturedFood() {
    const container = document.querySelector("#featured-food");
    
    // FIX: Exit silently if container doesn't exist (not an error)
    if (!container) {
        // This is not an error - the page just doesn't have featured food section
        console.log('Featured food section not present on this page - skipping');
        return;
    }

    try {
        // Show loading state
        container.innerHTML = '<div class="loading-spinner" role="status">Loading delicious food...</div>';

        const foodItems = await fetchFoodWithTimeout();
        
        if (!foodItems || foodItems.length === 0) {
            container.innerHTML = '<p class="empty-message">No food items available at the moment.</p>';
            return;
        }

        // Get daily random items (cached for 24 hours)
        const randomFood = getDailyRandomItems(foodItems, 10);
        renderFoodItems(randomFood, container);

    } catch (error) {
        console.error("Error in displayFeaturedFood:", error);
        showFoodError(container);
    }
}

/**
 * Fetch food data with timeout and error handling
 */
async function fetchFoodWithTimeout() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(FOOD_URL, { 
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format received');
        }

        if (!Array.isArray(data.food)) {
            console.warn('Food data is not an array, using empty array');
            return [];
        }

        // Validate each food item has required properties
        return data.food.filter(validateFoodItem);

    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your internet connection.');
        }
        
        // Re-throw with user-friendly message
        throw new Error(`Failed to load menu: ${error.message}`);
    }
}

/**
 * Validate food item structure
 */
function validateFoodItem(item) {
    const required = ['id', 'name', 'price', 'category', 'image'];
    const missing = required.filter(field => !item[field]);
    
    if (missing.length > 0) {
        console.warn('Invalid food item - missing fields:', missing, item);
        return false;
    }
    
    // Validate types
    if (typeof item.id !== 'number' || 
        typeof item.name !== 'string' || 
        typeof item.price !== 'number' ||
        typeof item.category !== 'string') {
        console.warn('Invalid food item - wrong data types:', item);
        return false;
    }
    
    return true;
}

/**
 * Show error message with retry option
 */
function showFoodError(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-message" role="alert" style="text-align: center; padding: 2rem;">
            <p style="font-size: 2rem; margin-bottom: 1rem;">⚠️</p>
            <p style="margin-bottom: 1rem;">Failed to load menu. Please check your connection.</p>
            <button onclick="window.location.reload()" 
                    style="padding: 0.75rem 1.5rem; 
                           background: #e85d04; 
                           color: white; 
                           border: none; 
                           border-radius: 4px; 
                           cursor: pointer;
                           font-size: 1rem;
                           transition: background 0.3s;">
                Try Again
            </button>
        </div>
    `;
}

/**
 * Randomly pick N items from an array, cached for 24 hours
 */
function getDailyRandomItems(array, count) {
    try {
        // Validate inputs
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }

        const now = Date.now();
        const storedTimestamp = localStorage.getItem(TIMESTAMP_KEY);
        const storedItems = localStorage.getItem(STORAGE_KEY);

        // Check if we have valid cached items
        if (storedTimestamp && storedItems) {
            try {
                const timeDiff = now - parseInt(storedTimestamp, 10);
                const parsedItems = JSON.parse(storedItems);
                
                if (timeDiff < ONE_DAY && Array.isArray(parsedItems) && parsedItems.length > 0) {
                    return parsedItems;
                }
            } catch (e) {
                console.warn('Failed to parse cached items, generating new ones');
                // Clear corrupted cache
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(TIMESTAMP_KEY);
            }
        }

        // Generate new random set
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(count, array.length));

        // Cache the new set
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
            localStorage.setItem(TIMESTAMP_KEY, now.toString());
        } catch (e) {
            console.warn('Failed to cache featured items:', e);
        }

        return selected;

    } catch (error) {
        console.error('Error in getDailyRandomItems:', error);
        // Fallback: return random items without caching
        return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
    }
}

/**
 * Render food cards in the container
 */
function renderFoodItems(foodArray, container) {
    if (!container || !Array.isArray(foodArray)) return;

    container.innerHTML = ''; // Clear container

    foodArray.forEach(item => {
        try {
            const card = createFoodCard(item);
            container.appendChild(card);
        } catch (error) {
            console.error('Error creating food card for item:', item, error);
        }
    });
}

/**
 * Create individual food card element
 */
function createFoodCard(item) {
    const card = document.createElement("div");
    card.classList.add("food-card");
    card.setAttribute('data-item-id', item.id);

    // Handle image error
    const handleImageError = (img) => {
        img.onerror = null; // Prevent infinite loop
        img.src = 'https://placehold.co/300x200?text=' + encodeURIComponent(item.name);
        img.alt = `${item.name} - Image unavailable`;
    };

    card.innerHTML = `
        <div class="image-wrapper">
            <p class="category-ribbon">${escapeHtml(item.category)}</p>
            <img src="${escapeHtml(item.image)}" 
                 alt="${escapeHtml(item.name)}" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='https://placehold.co/300x200?text=${encodeURIComponent(item.name)}';">
            <p class="price-tag">₦${item.price.toLocaleString()}</p>
        </div>
        <div class="content-wrapper">
            <h3>${escapeHtml(item.name)}</h3>
            <p class="rating" aria-label="Rating: ${item.rating || 0} out of 5 stars">
                ${getStars(item.rating || 0)}
            </p>
        </div>
        <button class="add-to-cart"
                data-id="${item.id}"
                data-name="${escapeHtml(item.name)}"
                data-price="${item.price}"
                data-image="${escapeHtml(item.image)}"
                data-category="${escapeHtml(item.category)}"
                data-rating="${item.rating || 0}"
                aria-label="Add ${escapeHtml(item.name)} to cart">
            Add to Cart
        </button>
    `;

    // Add event listener to the button
    const addButton = card.querySelector('.add-to-cart');
    if (addButton) {
        addButton.addEventListener('click', handleAddToCart);
    }

    return card;
}

/**
 * Handle add to cart button click
 */
function handleAddToCart(event) {
    const button = event.currentTarget;
    
    try {
        const item = {
            id: parseInt(button.dataset.id, 10),
            name: button.dataset.name,
            price: parseInt(button.dataset.price, 10),
            image: button.dataset.image,
            category: button.dataset.category,
            rating: parseFloat(button.dataset.rating) || 0,
            quantity: 1
        };

        // Validate item before adding
        if (!item.id || !item.name || !item.price) {
            throw new Error('Invalid item data');
        }

        const success = addToCart(item);
        
        if (success) {
            showAddToCartFeedback(button);
        } else {
            alert('Failed to add item to cart. Please try again.');
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

/**
 * Generate star icons for rating
 */
function getStars(rating) {
    try {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += `<img src="${STAR_ASSETS.full}" 
                          alt="Full star" 
                          class="star-icon" 
                          loading="lazy">`;
        }

        if (hasHalfStar) {
            stars += `<img src="${STAR_ASSETS.half}" 
                          alt="Half star" 
                          class="star-icon" 
                          loading="lazy">`;
        }

        for (let i = 0; i < emptyStars; i++) {
            stars += `<img src="${STAR_ASSETS.empty}" 
                          alt="Empty star" 
                          class="star-icon" 
                          loading="lazy">`;
        }

        return stars;
    } catch (error) {
        console.error('Error generating stars:', error);
        return STAR_ASSETS.fallback.repeat(5);
    }
}


/**
 * Show temporary feedback on Add to Cart button
 */
function showAddToCartFeedback(button) {
    if (!button) return;

    const originalText = button.textContent;
    const originalDisabled = button.disabled;
    
    // Disable button and show feedback
    button.disabled = true;
    button.classList.add('feedback');
    button.textContent = '✓ Added!';

    // Restore button after delay
    setTimeout(() => {
        button.disabled = originalDisabled;
        button.classList.remove('feedback');
        button.textContent = originalText;
    }, 1000);
}

/**
 * Simple HTML escape function to prevent XSS
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Export for testing if needed
export { validateFoodItem, getDailyRandomItems };