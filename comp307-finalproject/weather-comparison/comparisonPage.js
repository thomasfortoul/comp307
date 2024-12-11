// Assuming multiple locations are selected from the dashboard
const locations = ['London', 'New York', 'Tokyo']; // Example location list, this would be dynamic

const apiKey = '6ebf69ae5cc84e2b83e200844241012'; // Weather API Key

// Example of how to fetch and display weather and pollutants for multiple locations
const fetchWeatherData = async (location) => {
  try {
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`);
    const data = await response.json();

    const locationData = {
      name: data.location.name,
      region: data.location.region,
      country: data.location.country,
      lat: data.location.lat,
      lon: data.location.lon,
      temperatureC: data.current.temp_c,
      temperatureF: data.current.temp_f,
      condition: data.current.condition.text,
      windSpeedKph: data.current.wind_kph,
      windDirection: data.current.wind_dir,
      humidity: data.current.humidity,
      pressureMb: data.current.pressure_mb,
      uvIndex: data.current.uv,
      pollutants: {
        pm2_5: 22, // Hardcoded example pollutants, replace with actual API data if available
        pm10: 13,
        nitrogen_dioxide: 8,
        ozone: 11,
        sulphur_dioxide: 1
      }
    };

    return locationData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

// Function to create the table rows dynamically
const populateComparisonTable = async () => {
  const tableBody = document.getElementById('comparison-table-body'); // Assuming a <tbody> exists in your HTML for the table

  // Clear any previous data
  tableBody.innerHTML = '';

  for (const location of locations) {
    const data = await fetchWeatherData(location);

    // Create the row for this location
    const row = document.createElement('tr');

    // Location Name
    const locationCell = document.createElement('td');
    locationCell.innerText = `${data.name}, ${data.region}, ${data.country}`;
    row.appendChild(locationCell);

    // Temperature
    const tempCell = document.createElement('td');
    tempCell.innerText = `${data.temperatureC}°C / ${data.temperatureF}°F`;
    row.appendChild(tempCell);

    // Wind Speed
    const windCell = document.createElement('td');
    windCell.innerText = `${data.windSpeedKph} km/h ${data.windDirection}`;
    row.appendChild(windCell);

    // Humidity
    const humidityCell = document.createElement('td');
    humidityCell.innerText = `${data.humidity}%`;
    row.appendChild(humidityCell);

    // Pressure
    const pressureCell = document.createElement('td');
    pressureCell.innerText = `${data.pressureMb} mb`;
    row.appendChild(pressureCell);

    // UV Index
    const uvCell = document.createElement('td');
    uvCell.innerText = `${data.uvIndex}`;
    row.appendChild(uvCell);

    // Pollutants (Example PM2.5, PM10, NO2, etc.)
    const pollutantsCell = document.createElement('td');
    pollutantsCell.innerHTML = `
      PM2.5: ${data.pollutants.pm2_5} µg/m³<br>
      PM10: ${data.pollutants.pm10} µg/m³<br>
      NO2: ${data.pollutants.nitrogen_dioxide} µg/m³<br>
      Ozone: ${data.pollutants.ozone} µg/m³<br>
      SO2: ${data.pollutants.sulphur_dioxide} µg/m³
    `;
    row.appendChild(pollutantsCell);

    // Append row to the table body
    tableBody.appendChild(row);
  }
};

// Initialize the comparison table
populateComparisonTable();
