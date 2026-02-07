const banner = document.getElementById("visitBanner");
const text = document.getElementById("visitText");
const closeBtn = document.getElementById("visitClose");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const lastVisit = localStorage.getItem("lastVisit");
const now = Date.now();

let message = "";

if (!lastVisit) {
  message = "Welcome! Let us know if you have any questions.";
} else {
  const daysBetween = Math.floor((now - lastVisit) / MS_PER_DAY);

  if (daysBetween < 1) {
    message = "Back so soon! Awesome!";
  } else if (daysBetween === 1) {
    message = "You last visited 1 day ago.";
  } else {
    message = `You last visited ${daysBetween} days ago.`;
  }
}

text.textContent = message;

setTimeout(() => {
  banner.classList.add("show");
}, 200);

localStorage.setItem("lastVisit", now);

closeBtn.addEventListener("click", () => {
  banner.classList.remove("show");
});
