const spotlightContainer = document.querySelector('#spotlight-container');
const membersUrl = "https://lsonsprofile.github.io/wdd231/chamber/data/members.json";

async function displaySpotlights() {
    if (!spotlightContainer) return;

    try {
        const response = await fetch(membersUrl);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const members = data.members;

        if (!members || members.length === 0) {
            spotlightContainer.innerHTML = '<p>No featured members available.</p>';
            return;
        }

        // Filter Gold or Silver members only
        const eligibleMembers = members.filter(member => {
            return member.membership_level === "Gold Partner" || member.membership_level === "Silver Partner";
        });

        const shuffled = eligibleMembers.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        spotlightContainer.innerHTML = '';

        selected.forEach(member => {
            let icon = '';
            switch (member.membership_level) {
                case "Silver Partner":
                    icon = "&#129352;";
                    break;
                case "Gold Partner":
                    icon = "&#129353;";
                    break;
            }

            const card = document.createElement('div');
            card.className = 'spotlight-card';
            card.innerHTML = `
                <span class="membership-badge ${member.membership_level.toLowerCase().replace(" ", "-")}">
                    ${member.membership_level} ${icon}
                </span>
                <img src="${member.logo}" alt="Logo of ${member.name}" class="member-logo" loading="lazy" width="300" height="200">
                <h3>${member.name}</h3>
                <div class="contact-info">
                    <p><img src="icons/location.png" alt="Address icon" class="icon"> ${member.address}</p>
                    <p><img src="icons/phone.png" alt="Phone icon" class="icon"> ${member.phone}</p>
                    <p><img src="icons/website.png" alt="Website icon" class="icon"> 
                        <a href="${member.website}" target="_blank" class="website-link">Visit Website</a>
                    </p>
                </div>
            `;
            spotlightContainer.appendChild(card);
        });

    } catch (error) {
        spotlightContainer.innerHTML = '<p style="padding:20px;">Unable to load spotlights at this time.</p>';
        console.error('Error fetching members:', error);
    }
}

window.addEventListener('DOMContentLoaded', displaySpotlights);
