const url = 'https://byui-cse.github.io/cse-ww-program/data/latter-day-prophets.json';
const cards = document.querySelector('#cards');

const displayProphets = (prophets) => {
  prophets.forEach((prophet) => {
    const card = document.createElement('section');
    card.classList.add('prophet-card');
    const fullName = document.createElement('h2');
    const birthDate = document.createElement('p');
    birthDate.classList.add('birth-date');
    const deathDate = document.createElement('p');
    const length = document.createElement('p');
    const order = document.createElement('p');
    const birthPlace = document.createElement('p');
    const children = document.createElement('p');
    const portrait = document.createElement('img');

    fullName.textContent = `${prophet.name} ${prophet.lastname}`;
    birthDate.textContent = `Birth Date: ${prophet.birthdate}`;
    deathDate.textContent = `Death: ${prophet.death}`;
    length.textContent = `Years as Prophet: ${prophet.length}`;
    order.textContent = `Order: ${prophet.order}`;
    birthPlace.textContent = `Birthplace: ${prophet.birthplace}`;
    children.textContent = `Children: ${prophet.numofchildren}`;

    portrait.setAttribute('src', prophet.imageurl);
    portrait.setAttribute('alt', `Portrait of ${prophet.name} ${prophet.lastname}`);
    portrait.setAttribute('loading', 'lazy');
    portrait.setAttribute('width', '340');
    portrait.setAttribute('height', '440');

    card.appendChild(fullName);
    card.appendChild(portrait);
    card.appendChild(birthDate);
    card.appendChild(deathDate);
    card.appendChild(length);
    card.appendChild(order);
    card.appendChild(birthPlace);
    card.appendChild(children);
    cards.appendChild(card);
  });
};

async function getProphetData() {
  const response = await fetch(url);
  const data = await response.json();
  displayProphets(data.prophets);
}

getProphetData();
