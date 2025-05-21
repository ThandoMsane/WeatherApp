// Add event listener to the search button
document.getElementById('search').addEventListener('click', getWeather);

// Function to get weather data
async function getWeather() {
    // Get the city name from the input field
    const cityName = document.getElementById('city-input').value;
    const apiKey = '666870de26711278a94168fe4b6cc0aa';

    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

    try {
        // Check if cache file exists and is valid
        const cacheData = await checkCache(cityName);
        if (cacheData) {
            displayWeather(cacheData);
        } else {
            // Fetch the coordinates of the city
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();

            if (geoData.length > 0) {
                const { lat, lon } = geoData[0]; // Get latitude and longitude

                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

                const weatherResponse = await fetch(weatherUrl);
                const weatherData = await weatherResponse.json();

                displayWeather(weatherData);
                saveToFile(cityName, lat, lon, weatherData);
            } else {
                // Display message if city not found
                document.getElementById('weather-data').innerText = 'City not found';
            }
        }
    } catch (error) {
        // Handle errors
        console.error('Error fetching data:', error);
        document.getElementById('weather-data').innerText = 'Error fetching data';
    }
}

// Function to display the weather data
function displayWeather(data) {
    document.getElementById('city-name').innerText = data.name;
    document.getElementById('temperature').innerText = `Temperature: ${data.main.temp}°C`;
    document.getElementById('description').innerText = `Description: ${data.weather[0].description}`;

    const temp = data.main.temp;
    const weatherIcon = document.getElementById('weather-icon');

    if (temp < 15) {
        document.body.className = 'cold';
        weatherIcon.src = 'cold-icon.png'; // Path to cold icon
    } else {
        document.body.className = 'hot';
        weatherIcon.src = 'hot-icon.png'; // Path to hot icon
    }

    weatherIcon.style.display = 'block';
}

// Function to save weather data to a JSON file
function saveToFile(cityName, lat, lon, weatherData) {
    const fileName = `${cityName}-${lat}-${lon}.json`;
    const fileContent = JSON.stringify({
        timestamp: new Date().toISOString(),
        data: weatherData
    }, null, 4);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

// Function to check cache file
async function checkCache(cityName) {
    const cacheFileName = `${cityName}.json`;
    const cacheFile = await fetch(cacheFileName).then(response => response.ok ? response.json() : null).catch(() => null);

    if (cacheFile) {
        const cacheTime = new Date(cacheFile.timestamp);
        const currentTime = new Date();
        const ageInMinutes = (currentTime - cacheTime) / (1000 * 60);

        if (ageInMinutes <= 180) {
            return cacheFile.data;
        }
    }
    return null;
}
