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
const timeElement = document.getElementById('time');

const apiKey = '6ebf69ae5cc84e2b83e200844241012'

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

// Function to fetch settings from the server
function fetchSettings() {
    fetch("./get_settings.php", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(
                "Network response was not ok " + response.statusText
            );
        }
        return response.json();
    })
    .then((data) => {
        // Merge user settings with default settings
        settings = { ...settings, ...data };

        // Apply the settings to the UI or functions
        console.log("Settings fetched:", settings);

        // Fetch weather data now that settings are available
        fetchWeatherData("Montreal", settings);
    })
    .catch((error) => {
        console.error("Error fetching settings:", error);
    });
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
  
  async function fetchClimateData(lat, lon) {
    try {
        const response = await fetch(
            `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}&start_date=1950-01-01&end_date=2050-12-31&models=EC_Earth3P_HR&daily=temperature_2m_max`
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching climate data:', error);
        return null;
    }
}

const formatTime12Hour = (time) => {
    const [date, timePart] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    return `${date} ${hours}:${minutes} ${period}`;
};

function averageByBiYear(times, temperatures) {
    const biYearlyData = {};

    times.forEach((dateString, index) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const period = date.getMonth() < 6 ? 'H1' : 'H2'; // H1 for Jan-Jun, H2 for Jul-Dec
        const periodKey = `${year}-${period}`;
        const temperature = temperatures[index];

        if (!biYearlyData[periodKey]) {
            biYearlyData[periodKey] = {
                total: temperature,
                count: 1
            };
        } else {
            biYearlyData[periodKey].total += temperature;
            biYearlyData[periodKey].count++;
        }
    });

    const biYearlyAverages = Object.entries(biYearlyData).map(([periodKey, data]) => ({
        period: periodKey,
        averageTemp: data.total / data.count
    }));

    return biYearlyAverages.sort((a, b) => a.period.localeCompare(b.period));
}

function calculateTrendline(data) {
    // Prepare data for regression (x is index, y is temperature)
    const regressionData = data.map((point, index) => [index, point.averageTemp]);
    
    // Use linear regression
    const result = regression.linear(regressionData);
    
    // Generate trendline points
    return data.map((point, index) => ({
        period: point.period,
        trendTemp: result.predict(index)[1]
    }));
}

function calculateStatistics(biYearlyData, trendlineData) {
    // Calculate Slope (rate of increase)
    const firstPoint = trendlineData[0].trendTemp;
    const lastPoint = trendlineData[trendlineData.length - 1].trendTemp;
    const slope = (lastPoint - firstPoint) / (trendlineData.length - 1);
    
    // Maximum temperature
    const maxTemperature = Math.max(...biYearlyData.map(d => d.averageTemp));
    
    // Predicted final temperature (for 2050)
    const predictedFinalTemp = trendlineData[trendlineData.length - 1].trendTemp;

    return {
        slope,
        maxTemperature,
        predictedFinalTemp
    };
}

async function createTemperatureChart(lat, lon, city) {
    const climateData = await fetchClimateData(lat, lon);

    if (!climateData || !climateData.daily || !climateData.daily.time || !climateData.daily.temperature_2m_max) {
        document.body.innerHTML += '<p>Failed to load climate data</p>';
        return;
    }

    // Average temperatures by bi-yearly periods
    let biYearlyData = averageByBiYear(
        climateData.daily.time, 
        climateData.daily.temperature_2m_max
    );

    // Remove first and last data points (incomplete averages)
    biYearlyData = biYearlyData.slice(1, -2);

    // Calculate trendline
    const trendlineData = calculateTrendline(biYearlyData);

    // Calculate statistics
    const { slope, maxTemperature, predictedFinalTemp } = calculateStatistics(biYearlyData, trendlineData);

    // Display insights
    document.getElementById('temperature-insights').innerHTML += `
        <p class="insights">
            “Emissions have continued to rise - albeit at a slowing rate - and it will be impossible” to stay below 1.5C with “no or limited overshoot” without stronger climate action this decade.
            \n
            Over the past 50 years, the temperature has increased at an estimated average rate of ${slope.toFixed(2)}°C per bi-year.
            The maximum estimated temperature during this period was ${maxTemperature.toFixed(2)}°C.
            The predicted final temperature in 2050 is ${predictedFinalTemp.toFixed(2)}°C.
        </p>
    `;
    
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: biYearlyData.map(d => d.period),
            datasets: [
                {
                    label: 'Bi-Yearly Average Temperature (°C)',
                    data: biYearlyData.map(d => d.averageTemp),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Temperature Trendline',
                    data: trendlineData.map(d => d.trendTemp),
                    borderColor: 'red',
                    borderWidth: 2,
                    fill: false,
                    type: 'line' // Ensures trendline is correctly rendered
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${city} Bi-Yearly Average Temperatures (1950-2050)`
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year-Half'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Average Temperature (°C)'
                    }
                }
            }
        }
    });
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

const fetchWeatherData = async (city, settings) => {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
        const data = await response.json();
        
        const lat = data.location.lat;
        const lon = data.location.lon;
        myMap(lat, lon);
        fetchAirQualityData(lat, lon);
        createTemperatureChart(lat, lon, city);
        const locationName = data.location.name;
        const region = data.location.region;
        const country = data.location.country;
        const localtime = data.location.localtime;

        const temperatureC = data.current.temp_c;
        const temperatureF = data.current.temp_f;
        const conditionText = data.current.condition.text;
        const conditionIcon = data.current.condition.icon;
        const windSpeedKph = data.current.wind_kph;
        const windSpeedMph = data.current.wind_mph;
        const windDirection = data.current.wind_dir;
        const humidity = data.current.humidity;
        const visibilityKm = data.current.vis_km;
        const visibilityMiles = data.current.vis_miles;
        const uvIndex = data.current.uv;

        // Apply temperature setting
        const temperature = settings.temperature === "Celsius" 
            ? `${temperatureC}°C` 
            : `${temperatureF}°F`;

        // Apply wind speed setting
        const windSpeed = settings.windSpeed === "km/h" 
            ? `${windSpeedKph} km/h` 
            : `${windSpeedMph} mph`;

        // Apply distance setting for visibility
        const visibility = settings.distance === "km" 
            ? `${visibilityKm} km` 
            : `${visibilityMiles} miles`;


        // Format local time based on time preference
        localtime = settings.timePreference === "12-hour" 
            ? formatTime12Hour(localtime) 
            : localtime;

        // Update UI elements
        cityElement.innerHTML = locationName;
        title.innerHTML = 'Weather in ' + locationName;
        countryElement.innerHTML = country;
        tempElement.innerHTML = temperature;
        conditionElement.innerHTML = conditionText;
        airQualityElement.innerHTML = `UV Index: ${uvIndex}`;
        dayNightElement.innerHTML = localtime.includes("AM") || localtime.includes("PM") ? "Day" : "Night";
        descriptionElement.innerHTML = `Humidity: ${humidity}% | Wind: ${windSpeed} ${windDirection} | Visibility: ${visibility}`;
        timeElement.innerHTML = `Local Time: ${localtime} (last updated)`;

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

// Fetch the weather data for the city
fetchSettings();
fetchWeatherData(city);
