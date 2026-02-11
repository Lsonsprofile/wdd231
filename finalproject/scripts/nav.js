const nav = document.querySelector(".navigation-bar");
const openBtn = document.querySelector("#menu-openbtn");
const closeBtn = document.querySelector("#menuToggle");
const overlay = document.querySelector(".nav-overlay");

openBtn.addEventListener("click", () => {
   nav.classList.add("open");
   overlay.classList.add("active");
});

closeBtn.addEventListener("click", () => {
   nav.classList.remove("open");
   overlay.classList.remove("active");
});


overlay.addEventListener("click", () => {
   nav.classList.remove("open");
   overlay.classList.remove("active");
});