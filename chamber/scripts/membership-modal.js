const dialogBox   = document.querySelector("#membershipDialog");
const dialogText  = document.querySelector("#dialogText");
const closeButton = document.querySelector("#closeButton");


const infoButtons = document.querySelectorAll(".info-btn");

infoButtons.forEach(button => {
  button.addEventListener("click", () => {
    dialogBox.showModal();

    const modalType = button.dataset.modal;

    if (modalType === "modal-np") {
      dialogText.innerHTML = `
        <h3>NP Membership Benefits</h3>
        <ul>
          <li>No membership fee</li>
          <li>Community networking events</li>
          <li>Access to chamber resources</li>
          <li>Recognition as a community partner on the Chamber website</li>
          <li>Monthly newsletter Emails</li>
        </ul>
      `;
    }

    if (modalType === "modal-bronze") {
      dialogText.innerHTML = `
        <h3>Bronze Membership Benefits</h3>
        <ul>
          <li>NP Membership Benefits</li>
          <li>Business directory listing</li>
          <li>Event discounts</li>
          <li>Basic advertising opportunities</li>
          <li>Business profile featured in the monthly e-newsletter</li>
          <li>Access to member-to-member discount program</li>
        </ul>
      `;
    }

    if (modalType === "modal-silver") {
      dialogText.innerHTML = `
        <h3>Silver Membership Benefits</h3>
        <ul>
          <li>All Bronze Membership Benefits</li>
          <li>Advanced training workshops</li>
          <li>Enhanced visibility in directory</li>
          <li>Business mentorship program</li>
        </ul>
      `;
    }

    if (modalType === "modal-gold") {
      dialogText.innerHTML = `
        <h3>Gold Membership Benefits</h3>
        <ul>
          <li>All Silver Membership Benefits</li>
          <li>Premium advertising</li>
          <li>Featured business placement (monthly)</li>
          <li>VIP access to all events</li>
          <li>Exclusive networking opportunities</li>
          <li>Priority support and consultation</li>
        </ul>
      `;
    }
  });
});


closeButton.addEventListener("click", () => {
  dialogBox.close();
});

