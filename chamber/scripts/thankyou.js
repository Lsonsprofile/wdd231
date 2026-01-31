const submittedDataDiv = document.querySelector("#submittedData");

const params = new URLSearchParams(window.location.search);

const firstName = params.get("firstName");
const lastName = params.get("lastName");
const email = params.get("email");
const phone = params.get("phone");
const organization = params.get("organization");
const orgTitle = params.get("orgTitle");
const description = params.get("description");
const membership = params.get("membership");
const timestamp = params.get("timestamp");

const membershipLabels = {
    np: "NP Membership",
    bronze: "Bronze Membership",
    silver: "Silver Membership",
    gold: "Gold Membership"
};

submittedDataDiv.innerHTML = `
    <div class="info-item">
        <span class="info-label">Name:</span>
        <span class="info-value">${firstName} ${lastName}</span>
    </div>

    <div class="info-item">
        <span class="info-label">Email:</span>
        <span class="info-value">${email}</span>
    </div>

    <div class="info-item">
        <span class="info-label">Phone:</span>
        <span class="info-value">${phone}</span>
    </div>

    <div class="info-item">
        <span class="info-label">Organization:</span>
        <span class="info-value">${organization}</span>
    </div>

    ${orgTitle ? `
    <div class="info-item">
        <span class="info-label">Organization Title:</span>
        <span class="info-value">${orgTitle}</span>
    </div>` : ""}

    ${description ? `
    <div class="info-item">
        <span class="info-label">Business Description:</span>
        <span class="info-value">${description}</span>
    </div>` : ""}

    <div class="info-item">
        <span class="info-label">Membership Level:</span>
        <span class="info-value membership-${membership}">
            ${membershipLabels[membership]}
        </span>
    </div>
    <div class="info-item">
    <span class="info-label">Submission Date & Time:</span>
    <span class="info-value">${timestamp}</span>
</div>
`;
