const modified = new Date(document.lastModified); 
document.getElementById("lastModified").textContent = modified.toLocaleString();

const currentYear = new Date().getFullYear();
document.getElementById("year").textContent = currentYear;
