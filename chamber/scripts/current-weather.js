import { fetchForecast } from './forecast.js';


const currentTemp = document.querySelector('#current-temp');
const weatherIcon = document.querySelector('#weather-icon');
const condition = document.querySelector('#condition');
const high = document.querySelector('#high');
const low = document.querySelector('#low');
const humidity = document.querySelector('#humidity');
const sunriseEl = document.querySelector('#sunrise');
const sunsetEl = document.querySelector('#sunset');

const day1 = document.querySelector('#day1');
const day2 = document.querySelector('#day2');
const day3 = document.querySelector('#day3');

const mykey = 'dea7d385660914c914dfd7d319b0d3f3';
const mylat = '6.612829751528074';
const mylon = '3.3515704085315687';
const myunits = 'metric';
const myurl = `https://api.openweathermap.org/data/2.5/weather?lat=${mylat}&lon=${mylon}&units=${myunits}&appid=${mykey}`;

// Helper to format sunrise/sunset time
function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}


async function fetchCurrentWeather() {
  try {
    const response = await fetch(myurl);
    if (!response.ok) throw Error(await response.text());

    const data = await response.json();
    displayCurrentWeather(data);


    fetchForecast(mylat, mylon, myunits, mykey, [day1, day2, day3]);
  } catch (error) {
    console.log("Current weather error:", error);
  }
}

// Display current weather
function displayCurrentWeather(data) {
  currentTemp.textContent = `${Math.round(data.main.temp)}°C`;
  condition.textContent = data.weather[0].description;
  high.textContent = `${Math.round(data.main.temp_max)}°C`;
  low.textContent = `${Math.round(data.main.temp_min)}°C`;
  humidity.textContent = `${data.main.humidity}%`;
  sunriseEl.textContent = formatTime(data.sys.sunrise);
  sunsetEl.textContent = formatTime(data.sys.sunset);

  const iconsrc = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.innerHTML = `<img src="${iconsrc}" alt="${data.weather[0].description}">`;
}

// Run
fetchCurrentWeather();
