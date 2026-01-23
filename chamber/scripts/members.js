const url = 'https://lsonsprofile.github.io/wdd231/chamber/data/members.json';
const cards = document.querySelector('#membership-card');
const listContainer = document.querySelector('#membership-list');
const gridBtn = document.querySelector('#grid-btn');
const listBtn = document.querySelector('#list-btn');

const displayMembers = (members) => {
  members.forEach((member) => {
    const card = document.createElement('div');
    card.classList.add('member-card');

    const name = document.createElement('h2');
    const industry = document.createElement('p');
    const discription = document.createElement('p');
    const membership = document.createElement('h3');
    const address = document.createElement('p');
    const phone = document.createElement('p');
    const website = document.createElement('a');
    const portrait = document.createElement('img');
    const joindate = document.createElement('p');
    const services = document.createElement('p');

    name.textContent = member.name;
    industry.innerHTML = `<strong>Industry:</strong> ${member.industry}`;
    address.innerHTML = `<strong>Address:</strong> ${member.address}`;
    phone.innerHTML = `<strong>Phone:</strong> ${member.phone}`;
    discription.innerHTML = `<strong>Description:</strong> ${member.description}`;
    joindate.innerHTML = `<strong>Joined:</strong> ${member.join_date}`;
    services.innerHTML = `<strong>Services:</strong> ${member.services}`;

    let icon = "";
    switch (member.membership_level) {
      case "Basic Member":
        icon = "&#129351;";
        break;
      case "Silver Partner":
        icon = "&#129352;";
        break;
      case "Gold Partner":
        icon = "&#129353;";
        break;
    }
    membership.innerHTML = `<strong>Membership:</strong> ${member.membership_level} ${icon}`;

    website.innerHTML = `<strong>Website:</strong> ${member.website}`;
    website.href = member.website;
    website.target = "_blank";

    portrait.setAttribute('src', member.image);
    portrait.setAttribute('alt', `Logo of ${member.name}`);
    portrait.setAttribute('loading', 'lazy');
    portrait.setAttribute('width', '300');
    portrait.setAttribute('height', '200');

    card.appendChild(name);
    card.appendChild(portrait);
    card.appendChild(membership);
    card.appendChild(industry);
    card.appendChild(discription);
    card.appendChild(address);
    card.appendChild(phone);
    card.appendChild(joindate);
    card.appendChild(website);
    card.appendChild(services);

    cards.appendChild(card);
  });
};

const displayMembersList = (members) => {
  listContainer.innerHTML = `
    <div class="list-header">
      <div>Name</div>
      <div>Industry</div>
      <div>Description</div>
      <div>Membership</div>
      <div>Address</div>
      <div>Phone</div>
      <div>Joined Date</div>
      <div>Services</div>
      <div>Website</div>
    </div>
  `;

  members.forEach((member) => {
    let icon = "";
    switch (member.membership_level) {
      case "Basic Member":
        icon = "&#129351;";
        break;
      case "Silver Partner":
        icon = "&#129352;";
        break;
      case "Gold Partner":
        icon = "&#129353;";
        break;
    }

    const listItem = document.createElement('div');
    listItem.classList.add('list-item');
    
    listItem.innerHTML = `
      <div class="list-cell" data-label="Name:"><strong>${member.name}</strong></div>
      <div class="list-cell" data-label="Industry:">${member.industry}</div>
      <div class="list-cell" data-label="Description:">${member.description}</div>
      <div class="list-cell" data-label="Membership:">${member.membership_level} ${icon}</div>
      <div class="list-cell" data-label="Address:">${member.address}</div>
      <div class="list-cell" data-label="Phone:">${member.phone}</div>
      <div class="list-cell" data-label="Joined:">${member.join_date}</div>
      <div class="list-cell" data-label="Services:">${member.services}</div>
      <div class="list-cell" data-label="Website:">
        <a href="${member.website}" target="_blank" class="website-link">Visit Website</a>
      </div>
    `;

    listContainer.appendChild(listItem);
  });
};

async function getMemberData() {
  const response = await fetch(url);
  const data = await response.json();
  displayMembers(data.members);
  displayMembersList(data.members);
}

if (gridBtn && listBtn) {
  gridBtn.addEventListener('click', () => {
    cards.style.display = 'grid';
    listContainer.style.display = 'none';
    
    cards.classList.add('grid-view');
    
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
  });

  listBtn.addEventListener('click', () => {
    cards.style.display = 'none';
    listContainer.style.display = 'block';
    
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
  });
}


cards.style.display = 'grid';
listContainer.style.display = 'none';
cards.classList.add('grid-view');

if (gridBtn) {
  gridBtn.classList.add('active');
}
if (listBtn) {
  listBtn.classList.remove('active');
}

getMemberData();