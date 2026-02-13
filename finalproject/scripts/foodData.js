// js/foodData.js
import { addToCart } from './cart.js';

const FOOD_URL = "https://lsonsprofile.github.io/wdd231/finalproject/data/food.json";

/**
 * Fetch and display featured food items
 */
export async function displayFeaturedFood() {
  const container = document.querySelector("#featured-food");
  if (!container) return;

  try {
    const response = await fetch(FOOD_URL);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    if (!data.food || data.food.length === 0) {
      container.innerHTML = '<p>No food items available.</p>';
      return;
    }

    // Get 10 random items
    const randomFood = getRandomItems(data.food, 10);
    renderFoodItems(randomFood, container);

  } catch (error) {
    console.error("Error fetching food data:", error);
    container.innerHTML = '<p>Failed to load food items. Please try again later.</p>';
  }
}

/**
 * Randomly pick N items from an array
 */
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Render food cards in the container
 */
function renderFoodItems(foodArray, container) {
  container.innerHTML = ''; // Clear container

  foodArray.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("food-card");

    card.innerHTML = `
      <div class="image-wrapper">
        <p class="category-ribbon">${item.category}</p>
        <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://placehold.co/300x200'">
        <p class="price-tag">₦${item.price.toLocaleString()}</p>
      </div>
      <div class="content-wrapper">
        <h3>${item.name}</h3>
        <p class="rating">${getStars(item.rating)} (${item.rating})</p>
      </div>
      <button class="add-to-cart"
        data-id="${item.id}"
        data-name="${item.name}"
        data-price="${item.price}"
        data-image="${item.image}"
        data-category="${item.category}"
        data-rating="${item.rating}">
        Add to Cart
      </button>
    `;

    container.appendChild(card);
  });

  // Attach event listeners to Add to Cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const item = {
        id: parseInt(e.target.dataset.id),
        name: e.target.dataset.name,
        price: parseInt(e.target.dataset.price),
        image: e.target.dataset.image,
        category: e.target.dataset.category,
        rating: parseFloat(e.target.dataset.rating),
        quantity: 1
      };
      addToCart(item);

      // Optional: quick feedback animation
      showAddToCartFeedback(button);
    });
  });
}

/**
 * Generate star icons for rating
 */
function getStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '';
  stars += '<img src="images/star-fill.svg">'.repeat(fullStars);
  if (hasHalfStar) stars += '<img src="images/star-half.svg">';
  stars += '<img src="images/star.svg">'.repeat(emptyStars);

  return stars;
}

/**
 * Brief "Added" feedback for user
 */
function showAddToCartFeedback(button) {
  const originalText = button.textContent;
  
  // Just add a class for color change
  // Width/height stay the same because they're from the original CSS
  button.classList.add('feedback');
  button.textContent = '✓ Added!';

  setTimeout(() => {
    button.classList.remove('feedback');
    button.textContent = originalText;
  }, 1000);
}
