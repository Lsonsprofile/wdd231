const navigationButton = document.querySelector("#ham-btn");
const navlinks = document.querySelector(".navbar");

navigationButton.addEventListener("click", () => {
    navigationButton.classList.toggle("show");
    navlinks.classList.toggle("show");
})

