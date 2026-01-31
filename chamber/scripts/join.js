const form = document.querySelector("form"); 
  const timestampInput = document.querySelector("#timestamp");

  form.addEventListener("submit", () => {
    const now = new Date();
    timestampInput.value = now.toLocaleString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
  });