// Store the selected elements that we are going to use.
const navbutton = document.querySelector('#ham-btn');

// Toggle the 'show' class on click
navbutton.addEventListener('click', () => {
    navbutton.classList.toggle('show');
});

const navBar = document.querySelector('#nav-bar');
navbutton.addEventListener('click', () => {
  navbutton.classList.toggle('show'); 
  navBar.classList.toggle('show');  
});

const modified = new Date(document.lastModified); document.getElementById("lastModified").textContent = modified.toLocaleString();