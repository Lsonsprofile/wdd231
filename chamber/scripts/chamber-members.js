const spotlightContainer = document.querySelector('#spotlight-container');
const membersUrl = "https://lsonsprofile.github.io/wdd231/chamber/data/chamber-members.json";

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
                <img src="${member.image}" alt="Logo of ${member.name}" class="member-logo" loading="lazy">
                <h4>${member.name}</h4>
                <div class="contact-info">
                    <p><img src="images/location-dot-solid-full.svg" alt="Address icon" class="icon"> ${member.address}</p>
                    <p><img src="images/phone-solid-full.svg" alt="Phone icon" class="icon"> ${member.phone}</p>
                    <p><img src="images/earth-africa-solid-full.svg" alt="Website icon" class="icon"> 
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
