const currentTemp = document.querySelector('#current-temp');
const weatherIcon = document.querySelector('#weather-icon');
const captionDesc = document.querySelector('figcaption');
const condition = document.querySelector('#condition');
const high = document.querySelector('#high');
const low = document.querySelector('#low');
const humidity = document.querySelector('#humidity');
const sunriseEl = document.querySelector('#sunrise');
const sunsetEl = document.querySelector('#sunset');


const mykey = 'dea7d385660914c914dfd7d319b0d3f3';
const mylat = '6.612829751528074';
const mylon = '3.3515704085315687';
const myunits = 'metric';
const myurl = `https://api.openweathermap.org/data/2.5/weather?lat=${mylat}&lon=${mylon}&units=${myunits}&appid=${mykey}`;

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}


async function apiFetch() {
  try {
    const response = await fetch(myurl);
    if (response.ok) {
      const data = await response.json();
      console.log(data); // testing output
      displayResults(data);
    } else {
      throw Error(await response.text());
    }
  } catch (error) {
    console.log(error);
  }
}

apiFetch();



function displayResults(data) {
  currentTemp.innerHTML = `${data.main.temp}&deg;C`;

  const iconsrc = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const desc = data.weather[0].description;

  weatherIcon.setAttribute('src', iconsrc);
  weatherIcon.setAttribute('alt', desc);
  captionDesc.textContent = desc;

  condition.textContent = desc;
  high.textContent = data.main.temp_max;
  low.textContent = data.main.temp_min;
  humidity.textContent = data.main.humidity;
  sunriseEl.textContent = formatTime(data.sys.sunrise);
  sunsetEl.textContent = formatTime(data.sys.sunset);
}
