const url =
  "https://lsonsprofile.github.io/wdd231/finalproject/data/food.json";


async function getFoodData() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.food && data.food.length) {

      const randomFood = getRandomItems(data.food, 10);

      displayFood(randomFood);
    }

  } catch (error) {
    console.error("Error fetching food data:", error);
  }
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displayFood(foodArray) {
  const container = document.querySelector("#featured-food");

  foodArray.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("food-card");

    card.innerHTML = `
    <div class="image-wrapper">
      <p class="category-ribbon">${item.category}</p>
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <p class="price-tag">₦${item.price}</p>
    </div>
    <div class="content-wrapper">
      <h3>${item.name}</h3>
      
      <p class="rating">
        ${getStars(item.rating)} (${item.rating})</p>
    </div>
    <button class="add-to-cart" data-id="${item.id}">Add to Cart
    </button>

    `;

    container.appendChild(card);
  });
}

function getStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = "";

  stars += '<img src="images/star-fill.svg">'.repeat(fullStars);
  if (hasHalfStar) {
    stars += '<img src="images/star-half.svg">';
  }
  stars += '<img src="images/star.svg">'.repeat(emptyStars);
  return stars;
}

getFoodData();
