const url = 'https://byui-cse.github.io/cse-ww-program/data/latter-day-prophets.json';
const cards = document.querySelector('#cards');

async function getProphetData() {
  const response = await fetch(url);
  const data = await response.json();
  console.table(data.prophets); // ✅ This shows data in the console

  // Display each prophet in the #cards div
  data.prophets.forEach(prophet => {
    const card = document.createElement('section');
    const h2 = document.createElement('h2');
    const birth = document.createElement('p');
    const place = document.createElement('p');
    const portrait = document.createElement('img');

    h2.textContent = `${prophet.name} ${prophet.lastname}`;
    birth.textContent = `Date of Birth: ${prophet.birthdate}`;
    place.textContent = `Place of Birth: ${prophet.birthplace}`;
    portrait.setAttribute('src', prophet.imageurl);
    portrait.setAttribute('alt', `Portrait of ${prophet.name} ${prophet.lastname}`);
    portrait.setAttribute('loading', 'lazy');

    card.appendChild(h2);
    card.appendChild(birth);
    card.appendChild(place);
    card.appendChild(portrait);
    cards.appendChild(card);
  });
}

getProphetData();
