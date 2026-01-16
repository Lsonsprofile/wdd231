const url = 'https://lsonsprofile.github.io/wdd231/chamber/data/members.json';
const card = document.querySelector('#membership-card');
const gridbtn = document.querySelector('#grid-btn');
const listbtn = document.querySelector('#list-btn');

const displayMembers = (members) => {
  cards.innerHTML = "";
  members.forEach(member => {
    const card = document.createElement('section');
    card.classList.add('member-card');

    const name = document.createElement('h2');
    const industry = document.createElement('p');
    const membership = document.createElement('p');
    const description = document.createElement('p');
    const services = document.createElement('p');
    const address = document.createElement('p');
    const phone = document.createElement('p');
    const website = document.createElement('a');
    const image = document.createElement('img');

    name.textContent = member.name;
    industry.textContent = `Industry: ${member.industry}`;
    membership.textContent = `Membership Level: ${member.membership_level}`;
    description.textContent = member.description;
    services.textContent = `Services: ${member.services.join(', ')}`;
    address.textContent = `Address: ${member.address}`;
    phone.textContent = `Phone: ${member.phone}`;

    website.textContent = "Visit Website";
    website.href = member.website;
    website.target = "_blank";

    image.src = member.image;
    image.alt = member.name;
    image.loading = "lazy";
    image.width = 300;
    image.height = 200;

    card.appendChild(name);
    card.appendChild(image);
    card.appendChild(industry);
    card.appendChild(membership);
    card.appendChild(description);
    card.appendChild(services);
    card.appendChild(address);
    card.appendChild(phone);
    card.appendChild(website);

    cards.appendChild(card);
  });
};

async function getMemberData() {
  const response = await fetch('members.json');
  const data = await response.json();
  displayMembers(data.members);
}

gridBtn.addEventListener('click', () => {
  cards.classList.add('grid-view');
  cards.classList.remove('list-view');
});

listBtn.addEventListener('click', () => {
  cards.classList.add('list-view');
  cards.classList.remove('grid-view');
});

getMemberData();