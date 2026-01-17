const url = 'https://lsonsprofile.github.io/wdd231/chamber/data/members.json';
const cards = document.querySelector('#membership-card');
const gridBtn = document.querySelector('#grid-btn');
const listBtn = document.querySelector('#list-btn');

const displayMembers = (members) => {
  members.forEach((member) => {
    const card = document.createElement('section');
    card.classList.add('member-card');

    const name = document.createElement('h2');
    const industry = document.createElement('p');
    const discription = document.createElement('p');
    const membership = document.createElement('p');
    const address = document.createElement('p');
    const phone = document.createElement('p');
    const website = document.createElement('a');
    const portrait = document.createElement('img');
    const joindate = document.createElement('p');
    const services = document.createElement('p');

    name.textContent = member.name;
    industry.innerHTML = `<strong>Industry:</strong> ${member.industry}`
    membership.innerHTML = `<strong>Membership:</strong> ${member.membership_level}`
    address.innerHTML = `<strong>Address:</strong> ${member.address}`;
    phone.innerHTML = `<strong>Phone:</strong> ${member.phone}`;
    discription.innerHTML = `<strong>Description:</strong> ${member.description}`;
    joindate.innerHTML = `<strong>Joined:</strong> ${member.join_date}`;
    services.innerHTML = `<strong>Services:</strong> ${member.services}`;

    website.innerHTML = `<strong>Website:</strong> ${member.website}`
    website.href = member.website;
    website.target = "_blank";

    portrait.setAttribute('src', member.image);
    portrait.setAttribute('alt', `Logo of ${member.name}`);
    portrait.setAttribute('loading', 'lazy');
    portrait.setAttribute('width', '300');
    portrait.setAttribute('height', '200');

    card.appendChild(name);
    card.appendChild(portrait);
    card.appendChild(industry);
    card.appendChild(discription);
    card.appendChild(membership);
    card.appendChild(address);
    card.appendChild(phone);
    card.appendChild(joindate);
    card.appendChild(website);
    card.appendChild(services);

    cards.appendChild(card);
  });
};

async function getMemberData() {
  const response = await fetch(url);
  const data = await response.json();
  displayMembers(data.members);
}

gridBtn.addEventListener('click', () => {
  cards.classList.add('grid-view');
  cards.classList.remove('list-view');
  gridBtn.classList.add('active');
  listBtn.classList.remove('active');
});

listBtn.addEventListener('click', () => {
  cards.classList.add('list-view');
  cards.classList.remove('grid-view');
  listBtn.classList.add('active');
  gridBtn.classList.remove('active');
});


cards.classList.add('grid-view');
gridBtn.classList.add('active');

getMemberData();
