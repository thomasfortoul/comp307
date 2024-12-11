async function fetchClimateData() {
    try {
        const response = await fetch(
            'https://climate-api.open-meteo.com/v1/climate?latitude=52.52&longitude=13.41&start_date=1950-01-01&end_date=2050-12-31&models=EC_Earth3P_HR&daily=temperature_2m_max'
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

async function createTemperatureChart() {
    const climateData = await fetchClimateData();

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
                    text: 'Berlin Bi-Yearly Average Temperatures (1950-2050)'
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

createTemperatureChart();
