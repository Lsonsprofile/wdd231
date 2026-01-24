export async function fetchForecast(mylat, mylon, myunits, mykey, dayElements) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${mylat}&lon=${mylon}&units=${myunits}&appid=${mykey}`;

  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) throw Error(await response.text());

    const data = await response.json();
    displayForecastByWeekday(data, dayElements);

  } catch (error) {
    console.log("Forecast error:", error);
  }
}

function displayForecastByWeekday(data, dayElements) {
  
  const dailyMap = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
    if (!dailyMap[date]) dailyMap[date] = [];
    dailyMap[date].push(item.main.temp);
  });


  const forecastDates = Object.keys(dailyMap).slice(0, 3);

  forecastDates.forEach((dateStr, index) => {
    const temps = dailyMap[dateStr];
    const high = Math.max(...temps);
    const low = Math.min(...temps);

    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

    if (dayElements[index]) {
      dayElements[index].innerHTML = `<span class="forecast-day">${weekday}</span>: ${Math.round(high)}°C / ${Math.round(low)}°C`;
    }
  });
}
