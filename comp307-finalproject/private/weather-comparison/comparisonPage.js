
const locations = ['London', 'New York', 'Tokyo']; // Example locations
const apiKey = '6ebf69ae5cc84e2b83e200844241012'; // Weather API Key

// Function to fetch air quality data
const fetchAirQualityData = async (latitude, longitude) => {
    try {
        const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi&hourly=european_aqi,european_aqi_pm2_5,european_aqi_pm10,european_aqi_nitrogen_dioxide,european_aqi_ozone,european_aqi_sulphur_dioxide`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        const pollutants = {
            pm2_5: data.hourly.european_aqi_pm2_5[0],
            pm10: data.hourly.european_aqi_pm10[0],
            nitrogen_dioxide: data.hourly.european_aqi_nitrogen_dioxide[0],
            ozone: data.hourly.european_aqi_ozone[0],
            sulphur_dioxide: data.hourly.european_aqi_sulphur_dioxide[0],
            european_aqi: data.hourly.european_aqi[0]
        };

        return pollutants;
    } catch (error) {
        console.error('Error fetching air quality data:', error);
    }
};

// Function to fetch weather data and append pollutants
const fetchWeatherData = async (location) => {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`);
        const data = await response.json();

        const lat = data.location.lat;
        const lon = data.location.lon;

        const pollutants = await fetchAirQualityData(lat, lon);

        const locationData = {
            name: data.location.name,
            region: data.location.region,
            country: data.location.country,
            temperatureC: data.current.temp_c,
            temperatureF: data.current.temp_f,
            windSpeedKph: data.current.wind_kph,
            windDirection: data.current.wind_dir,
            humidity: data.current.humidity,
            pressureMb: data.current.pressure_mb,
            uvIndex: data.current.uv,
            pollutants: pollutants
        };

        return locationData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

// Function to create the table rows dynamically
const populateComparisonTable = async () => {
    const tableBody = document.getElementById('comparison-table-body');
    const tableHeaders = document.getElementById('table-headers');

    // Clear previous data
    tableBody.innerHTML = '';
    tableHeaders.innerHTML = '';

    // Create headers for each location
    locations.forEach(location => {
        const th = document.createElement('th');
        th.innerText = location;
        tableHeaders.appendChild(th);
    });

    // Create rows for each data type (Temperature, Wind, etc.)
    const dataCategories = ['Temperature', 'Wind', 'Humidity', 'Pressure', 'UV Index', 'Pollutants'];
    for (const category of dataCategories) {
        const row = document.createElement('tr');

        for (const location of locations) {
            const data = await fetchWeatherData(location);
            const td = document.createElement('td');
            
            switch (category) {
                case 'Temperature':
                    td.innerHTML = `${data.temperatureC}°C / ${data.temperatureF}°F`;
                    break;
                case 'Wind':
                    td.innerHTML = `${data.windSpeedKph} km/h ${data.windDirection}`;
                    break;
                case 'Humidity':
                    td.innerHTML = `${data.humidity}% Humidity`;
                    break;
                case 'Pressure':
                    td.innerHTML = `${data.pressureMb} mb`;
                    break;
                case 'UV Index':
                    td.innerHTML = `${data.uvIndex} UV Index`;
                    break;
                case 'Pollutants':
                    td.classList.add('pollutant-values');
                    td.innerHTML = `
                        <div class="pollutant-row">
                            eAQI: ${data.pollutants.european_aqi} AQI <br>
                            PM2.5: ${data.pollutants.pm2_5} µg/m³<br>
                            PM10: ${data.pollutants.pm10} µg/m³<br>
                            NO2: ${data.pollutants.nitrogen_dioxide} µg/m³<br>
                            Ozone: ${data.pollutants.ozone} µg/m³<br>
                            SO2: ${data.pollutants.sulphur_dioxide} µg/m³
                        </div>
                    `;
                    break;
            }
            
            row.appendChild(td);
        }

        tableBody.appendChild(row);
    }
};

// Initialize the table
populateComparisonTable();