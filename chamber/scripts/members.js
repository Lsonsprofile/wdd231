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
    const membership = document.createElement('h3');
    const address = document.createElement('p');
    const phone = document.createElement('p');
    const website = document.createElement('a');
    const portrait = document.createElement('img');
    const joindate = document.createElement('p');
    const services = document.createElement('p');

    name.textContent = member.name;
    industry.innerHTML = `<strong>Industry:</strong> ${member.industry}`
    address.innerHTML = `<strong>Address:</strong> ${member.address}`;
    phone.innerHTML = `<strong>Phone:</strong> ${member.phone}`;
    discription.innerHTML = `<strong>Description:</strong> ${member.description}`;
    joindate.innerHTML = `<strong>Joined:</strong> ${member.join_date}`;
    services.innerHTML = `<strong>Services:</strong> ${member.services}`;

    let icon = "";
    switch (member.membership_level) {
      case "Bronze Member":
        icon = "&#129351;";
        break;
      case "Silver Member":
        icon = "&#129352;";
        break;
      case "Gold Member":
        icon = "&#129353;";
        break;
    }
    membership.innerHTML = `<strong>Membership:</strong> ${member.membership_level} ${icon}`;

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

const table = document.querySelector('#membership-table');

const displayMembersTable = (members) => {
  table.innerHTML = `
    <table class="member-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Industry</th>
          <th>Membership</th>
          <th>Phone</th>
          <th>Address</th>
          <th>Website</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tbody = table.querySelector('tbody');

  members.forEach((member) => {
    let icon = "";
    switch (member.membership_level) {
      case "Bronze Member":
        icon = "&#129351;";
        break;
      case "Silver Member":
        icon = "&#129352;";
        break;
      case "Gold Member":
        icon = "&#129353;";
        break;
    }

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${member.name}</td>
      <td>${member.industry}</td>
      <td>${member.membership_level} ${icon}</td>
      <td>${member.phone}</td>
      <td>${member.address}</td>
      <td><a href="${member.website}" target="_blank">Visit</a></td>
    `;

    tbody.appendChild(row);
  });
};


async function getMemberData() {
  const response = await fetch(url);
  const data = await response.json();
  displayMembers(data.members);
  displayMembersTable(data.members);
}

if (gridBtn && listBtn) {

  gridBtn.addEventListener('click', () => {
    cards.style.display = 'grid';
    table.style.display = 'none';

    cards.classList.add('grid-view');
    cards.classList.remove('list-view');

    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
  });

  listBtn.addEventListener('click', () => {
    cards.style.display = 'none';
    table.style.display = 'block';

    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
  });

}

function updateLayoutForScreen() {
   if (window.innerWidth < 752) { 
       cards.style.display = 'grid';
       table.style.display = 'none';
       cards.classList.add('grid-view');
       cards.classList.remove('list-view');
       gridBtn?.classList.remove('active');
       listBtn?.classList.remove('active');
   }
}

window.addEventListener('resize', updateLayoutForScreen);

updateLayoutForScreen();



cards.style.display = 'grid';
table.style.display = 'none';

cards.classList.add('grid-view');
gridBtn.classList.add('active');

getMemberData();
