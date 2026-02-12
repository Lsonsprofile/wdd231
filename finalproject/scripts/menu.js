const url =
  "https://lsonsprofile.github.io/wdd231/finalproject/data/food.json";


async function getFoodData() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    // your JSON uses "food"
    if (data.food && data.food.length) {

      // randomly pick only 4
      const randomFood = getRandomItems(data.food, 4);

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
  const container = document.getElementById("featured-food");

  foodArray.forEach(item => {
    const card = document.createElement("article");
    card.classList.add("food-card");

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <h3>${item.name}</h3>
      <p class="category">${item.category}</p>
      <p class="price">₦${item.price}</p>
      <p class="rating">
        ${getStars(item.rating)} (${item.rating})</p>
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
