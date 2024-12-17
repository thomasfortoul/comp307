<?php
$locationData = isset($_GET['location']) ? $_GET['location'] : '';
$decodedLocationData = urldecode($locationData);

// Split the location data into individual components (city, admin region, country)
$locationArray = explode(',', $decodedLocationData);

// echo $locationArray;
// // Assign the components to variables
$city = isset($locationArray[0]) ? trim($locationArray[0]) : '';
$adminRegion = isset($locationArray[1]) ? trim($locationArray[1]) : '';
$country = isset($locationArray[2]) ? trim($locationArray[2]) : '';
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/regression@2.0.1/dist/regression.min.js"></script>
    <link href="../../assets/footer.css" rel="stylesheet" />
    <link href="../../assets/header.css" rel="stylesheet" />
    <link href="../../assets/sidebar.css" rel="stylesheet" />
    <link href="./styles.css" rel="stylesheet" />
    <title>Climate Compass</title>
  </head>
  <body>
    <!--HEADER-->
    <header>
      <div class="nav-container">
        <img
          src="../../assets/images/landingpagelogo.png"
          alt="Climate Compass logo"
          class="logo"
        />
        <nav class="nav-links" id="nav-links">
          <a href="../../public/landing/index.html">HOME</a>
          <a href="../../public/take-action/take-action.html">TAKE ACTION</a>
          <a href="../../public/about-us/about-us.html">ABOUT US</a>
          <a href="#" onclick="logOut()">LOG OUT</a>
        </nav>
        <button class="hamburger" id="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
    <!-- Main Section -->
  <div class="container">
    <!-- Location Section -->
    <div class="location">
      <div id="weather" class="weather-container">
        <div class="weather-header" id="title">Weather</div>
        <div class="weather-body">
            <div class="weather-info">
                <span id="city">City</span>
                <span id="country">Country</span>
            </div>
            <div class="weather-info">
                <span id="temperature">Temperature</span>
                <span id="condition">Condition</span>
            </div>
            <div class="weather-info">
                <span id="air-quality">Air Quality</span>
                <span id="day-night">Day/Night</span>
            </div>
            <div id="alerts" class="weather-info">Weather Alerts: None</div>
            <div class="location-description" id="description">Description</div>
        </div>
        <div class="modal-hover emoji" id="weather-icon">🌴</div>
    </div>

    <div class="map" id="map"></div>
    </div>

    <div class="section location">
        <div class="text">
            <h2>Long Term Temperature Information</h2>
            <h3>Insights</h3>
            <p class="insights" id="temperature-insights">
            </p>
            <p id="temperatureChartCaption">
              The data is obtained from Europe's EC_Earth3P_HR downscaled climate model, as part part of the IPCC CMIP6 project. A climate model is a computer simulation of the Earth's climate system that can be used to predict or recreate past climates.
            </p>
        </div>
        <div class="image-section">
            <canvas id="temperatureChart"></canvas>
        </div>
        <!-- <script src="graph.js"></script> -->
      </div>
      
    <!-- Pollution Information -->
    <div class="pollution">
        <div class="pollution-header">
            <h2>Pollution Metrics</h2>
        </div>
    
    <div class="modal-container">
        <!-- European AQI Modal -->
        <div class="modal-box" id="aqiModal">
          <div class="aqi-info">
            <p id="aqiValue"></p>
            <p id="aqiCategory"></p>
          </div>
          <p id="healthRecommendation"></p>
        </div>
    
        <!-- Pollutants List -->
        <div class="pollutants-list">
          <h4>Pollutants (μg/m³)</h4>
          <ul>
            <li>PM2.5: <span id="pm2_5"></span></li>
            <li>PM10: <span id="pm10"></span></li>
            <li>Nitrogen Dioxide: <span id="nitrogen_dioxide"></span></li>
            <li>Ozone: <span id="ozone"></span></li>
            <li>Sulphur Dioxide: <span id="sulphur_dioxide"></span></li>
          </ul>
        </div>
      </div>
      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDVVw3bv1QyeRK98fTbmNHsmenHTR2FHZ8&callback=myMap"></script>
      <script>
// Pass the PHP variable `city` to JavaScript
var city = "<?php echo $city; ?>";

// Log the city to the console for testing
console.log("City from PHP: " + city);

// Now you can use the `city` variable in your weather.js script
</script>
<script src="weather.js"></script>

    </div>

  <!-- Footer -->
  <div class="footer">
    At Climate Compass, we empower communities with data-driven insights to understand and navigate the impacts of climate change. <br>
    &copy; 2024 Climate Compass
  </div>
</body>
</html>
