// cartData.js
export const foodDataUrl = "https://lsonsprofile.github.io/wdd231/finalproject/data/food.json";

export let cart = [];

// Fetch food items
export async function fetchFoodData() {
   try {
      const response = await fetch(foodDataUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data.food || [];
   } catch (err) {
      console.error("Error fetching food data:", err);
      return [];
   }
}

// Add item to cart
export function addToCart(item) {
   const existing = cart.find(i => i.id === item.id);
   if (existing) {
      existing.quantity += 1;
   } else {
      cart.push({ ...item, quantity: 1, selected: false });
   }
}

// Remove selected items
export function removeSelectedItems() {
   cart = cart.filter(item => !item.selected);
}

// Calculate totals
export function calculateTotals() {
   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
   const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
   return { totalItems, totalPrice };
}
