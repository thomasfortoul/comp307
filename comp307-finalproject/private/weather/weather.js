const weatherContainer = document.getElementById('weather');
const cityElement = document.getElementById('city');
const countryElement = document.getElementById('country');
const tempElement = document.getElementById('temperature');
const conditionElement = document.getElementById('condition');
const airQualityElement = document.getElementById('air-quality');
const UV = document.getElementById('air-quality');
const dayNightElement = document.getElementById('day-night');
const alertsElement = document.getElementById('alerts');
const descriptionElement = document.getElementById('description');
const locationImage = document.getElementById('location-image');
const weatherIcon = document.getElementById('weather-icon');
const title = document.getElementById('title');

const apiKey = '6ebf69ae5cc84e2b83e200844241012'
const query = 'London'

function myMap(lat, lng) {
    const mapProp = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 5,
    };
    const map = new google.maps.Map(document.getElementById("map"), mapProp);
    const marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
    });
    marker.setMap(map);
}

// Function to fetch air quality data from the API
async function fetchAirQualityData(lat, lon) {
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&hourly=european_aqi,european_aqi_pm2_5,european_aqi_pm10,european_aqi_nitrogen_dioxide,european_aqi_ozone,european_aqi_sulphur_dioxide`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      // Extracting the first value for each pollutant
      const pollutants = {
        pm2_5: data.hourly.european_aqi_pm2_5[0],
        pm10: data.hourly.european_aqi_pm10[0],
        nitrogen_dioxide: data.hourly.european_aqi_nitrogen_dioxide[0],
        ozone: data.hourly.european_aqi_ozone[0],
        sulphur_dioxide: data.hourly.european_aqi_sulphur_dioxide[0]
      };
  
      const aqiValue = data.hourly.european_aqi[0]; // Get the European AQI value
  
      // Update the AQI data
      setAqiData(aqiValue, pollutants);
  
    } catch (error) {
      console.error('Error fetching air quality data:', error);
    }
  }
  
  // Function to determine AQI category and color
  function getAqiCategory(aqi) {
      if (aqi <= 20) return { category: 'Good', color: '#add8e6' , guideline:'Enjoy outdoor activities as air quality is excellent. No special precautions are necessary for any groups, including sensitive individuals.'}; // Light Blue
      if (aqi <= 40) return { category: 'Fair', color: '#ffeb3b' , guideline:'Air quality is generally acceptable for most people. Those who are unusually sensitive to air pollution may consider reducing prolonged or heavy outdoor exertion.'};  
      if (aqi <= 60) return { category: 'Moderate', color: '#ff9800', guideline:'Consider reducing prolonged or intense outdoor activities, especially if you experience symptoms. People with respiratory or heart conditions, older adults, and children should be particularly cautious.'}; // Orange
      if (aqi <= 80) return { category: 'Poor', color: '#f4433', guideline:'Reduce prolonged or intense activities outdoors, especially if you experience symptoms like coughing or shortness of breath. People with heart or lung disease, older adults, and children should avoid prolonged or heavy exertion.'};
      if (aqi <= 100) return { category: 'Very Poor', color: '#d32f2f', guideline:'Avoid prolonged or intense outdoor activities and consider rescheduling outdoor events. People with respiratory or heart conditions, older adults, and children should stay indoors and keep activity levels low.'}; // Dark Red
      return { category: 'Extremely Poor', color: '#5d4037', guideline:'Stay indoors and keep windows closed to avoid exposure to highly polluted air. All individuals, especially sensitive groups, should avoid any outdoor physical activity and seek medical attention if experiencing respiratory or cardiovascular symptoms.'}; // Brown
  }
  
  // Set AQI data function, updated to accept dynamic input
  function setAqiData(aqiValue, pollutants) {
    const aqiCategoryData = getAqiCategory(aqiValue);
  
    // Update AQI modal background color
    const aqiModal = document.getElementById('aqiModal');
    aqiModal.style.backgroundColor = aqiCategoryData.color;
  
    // Update AQI value and category
    document.getElementById('aqiValue').innerText = `EAQI: ${aqiValue}`;
    document.getElementById('aqiCategory').innerText = aqiCategoryData.category;
    document.getElementById('healthRecommendation').innerText = aqiCategoryData.guideline;
  
    // Update pollutants data
    document.getElementById('pm2_5').innerText = pollutants.pm2_5;
    document.getElementById('pm10').innerText = pollutants.pm10;
    document.getElementById('nitrogen_dioxide').innerText = pollutants.nitrogen_dioxide;
    document.getElementById('ozone').innerText = pollutants.ozone;
    document.getElementById('sulphur_dioxide').innerText = pollutants.sulphur_dioxide;
  }


  
const fetchWeatherData = async () => {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}`);
        const data = await response.json();

        const lat = data.location.lat;
        const lon = data.location.lon;
        myMap(lat, lon);
        fetchAirQualityData(lat, lon);
        const locationName = data.location.name;
        const region = data.location.region;
        const country = data.location.country;
        const localtime = data.location.localtime;

        const temperatureC = data.current.temp_c;
        const temperatureF = data.current.temp_f;
        const conditionText = data.current.condition.text;
        const conditionIcon = data.current.condition.icon;
        const windSpeedKph = data.current.wind_kph;
        const windDirection = data.current.wind_dir;
        const humidity = data.current.humidity;
        const feelsLikeC = data.current.feelslike_c;
        const feelsLikeF = data.current.feelslike_f;
        const visibilityKm = data.current.vis_km;
        const uvIndex = data.current.uv;

        cityElement.innerHTML = locationName;
        title.innerHTML = 'Weather in ' + locationName;
        countryElement.innerHTML = country;
        tempElement.innerHTML = `${temperatureC}°C / ${temperatureF}°F`;
        conditionElement.innerHTML = conditionText;
        airQualityElement.innerHTML = `UV Index: ${uvIndex}`;
        dayNightElement.innerHTML = localtime.includes("AM") ? "Day" : "Night"; // Simple check for day/night based on local time
        descriptionElement.innerHTML = `Humidity: ${humidity}% | Wind: ${windSpeedKph} km/h ${windDirection} | Visibility: ${visibilityKm} km`;
        
        const weatherImg = document.createElement('img');
        weatherImg.src = `https:${conditionIcon}`;
        weatherImg.alt = conditionText;
        weatherIcon.innerHTML = ''; // Clear any previous content
        weatherIcon.appendChild(weatherImg);

        if (data.current.temp_c > 30) {
            weatherContainer.classList.add('warm');
        }
        // else if (data.current.temp_c >= 10) {
        //     weatherContainer.classList.add('cool');
        // }
        // else {
        //     weatherContainer.classList.add('cold');
        // }

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

fetchWeatherData();