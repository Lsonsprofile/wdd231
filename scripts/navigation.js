const navigationButton = document.querySelector("#ham-btn");
const navlinks = document.querySelector("#nav-bar");

navigationButton.addEventListener("click", () => {
    navigationButton.classList.toggle("show");
    navlinks.classList.toggle("show");
})

