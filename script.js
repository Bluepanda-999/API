// Global variables
let map;
let marker;

// Initialize map
function initMap(lat = 43.2220, lon = 76.8512) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lon], 10);
    }

    // Clear existing marker
    if (marker) {
        map.removeLayer(marker);
    }

    // Add new marker
    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`Latitude: ${lat}<br>Longitude: ${lon}`)
        .openPopup();
}

// Fetch weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
}

// Fetch news data
async function fetchNews(countryCode) {
    try {
        const response = await fetch(`/api/news?country=${countryCode}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
}

// Fetch currency data
async function fetchCurrency(base = 'KZT') {
    try {
        const response = await fetch(`/api/currency?base=${base}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching currency:', error);
        throw error;
    }
}

// Display weather data
function displayWeather(data) {
    const weatherInfo = document.getElementById('weatherInfo');
    
    const weatherHTML = `
        <div class="weather-item">
            <h3>Temperature</h3>
            <p>${data.temperature}°C</p>
        </div>
        <div class="weather-item">
            <h3>Feels Like</h3>
            <p>${data.feels_like}°C</p>
        </div>
        <div class="weather-item">
            <h3>Condition</h3>
            <p>${data.description}</p>
            <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.description}" style="width: 50px; height: 50px;">
        </div>
        <div class="weather-item">
            <h3>Humidity</h3>
            <p>${data.humidity}%</p>
        </div>
        <div class="weather-item">
            <h3>Pressure</h3>
            <p>${data.pressure} hPa</p>
        </div>
        <div class="weather-item">
            <h3>Wind Speed</h3>
            <p>${data.wind_speed} m/s</p>
        </div>
        <div class="weather-item">
            <h3>Rain (3h)</h3>
            <p>${data.rain} mm</p>
        </div>
        <div class="weather-item">
            <h3>Location</h3>
            <p>${data.city}, ${data.country}</p>
        </div>
        <div class="weather-item">
            <h3>Coordinates</h3>
            <p>Lat: ${data.coordinates.lat}<br>Lon: ${data.coordinates.lon}</p>
        </div>
    `;
    
    weatherInfo.innerHTML = weatherHTML;
    
    // Update map
    initMap(data.coordinates.lat, data.coordinates.lon);
    
    return data.country;
}

// Display news data
function displayNews(news) {
    const newsContainer = document.getElementById('newsContainer');
    
    if (news.length === 0) {
        newsContainer.innerHTML = '<div class="loading">No news available for this country</div>';
        return;
    }
    
    const newsHTML = news.map(article => `
        <div class="news-item">
            <h3>${article.title}</h3>
            ${article.description ? `<p>${article.description}</p>` : ''}
            <p><small>Source: ${article.source} | ${article.publishedAt}</small></p>
            ${article.image ? `<img src="${article.image}" alt="${article.title}" style="max-width: 100%; border-radius: 5px; margin-top: 10px;">` : ''}
        </div>
    `).join('');
    
    newsContainer.innerHTML = newsHTML;
}

// Display currency data
function displayCurrency(currencyData) {
    const currencyInfo = document.getElementById('currencyInfo');
    
    const currencyHTML = `
        <div class="currency-item">
            <h3>Base Currency</h3>
            <p>${currencyData.base}</p>
        </div>
        <div class="currency-item">
            <h3>USD</h3>
            <p>${currencyData.rates.USD.toFixed(4)}</p>
        </div>
        <div class="currency-item">
            <h3>EUR</h3>
            <p>${currencyData.rates.EUR.toFixed(4)}</p>
        </div>
        <div class="currency-item">
            <h3>RUB</h3>
            <p>${currencyData.rates.RUB.toFixed(4)}</p>
        </div>
        <div class="currency-item">
            <h3>CNY</h3>
            <p>${currencyData.rates.CNY.toFixed(4)}</p>
        </div>
    `;
    
    currencyInfo.innerHTML = `
        <p style="margin-bottom: 15px; color: #666;">Last updated: ${currencyData.last_updated}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
            ${currencyHTML}
        </div>
    `;
}

// Main function to load all data
async function loadDashboard(city = 'Almaty') {
    try {
        // Show loading states
        document.getElementById('weatherInfo').innerHTML = '<div class="loading">Loading weather...</div>';
        document.getElementById('newsContainer').innerHTML = '<div class="loading">Loading news...</div>';
        document.getElementById('currencyInfo').innerHTML = '<div class="loading">Loading currency...</div>';

        // Fetch weather data
        const weatherData = await fetchWeather(city);
        
        // Get country code from weather data
        const countryCode = weatherData.country.toLowerCase();
        
        // Display weather
        displayWeather(weatherData);
        
        // Fetch and display news
        try {
            const newsData = await fetchNews(countryCode);
            displayNews(newsData);
        } catch (newsError) {
            document.getElementById('newsContainer').innerHTML = '<div class="error">Failed to load news</div>';
        }
        
        // Fetch and display currency (using country's currency)
        try {
            const currencyData = await fetchCurrency('KZT');
            displayCurrency(currencyData);
        } catch (currencyError) {
            document.getElementById('currencyInfo').innerHTML = '<div class="error">Failed to load currency data</div>';
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('weatherInfo').innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

// Event Listeners
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        loadDashboard(city);
    }
});

document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            loadDashboard(city);
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMap(); 
    loadDashboard('Almaty');
});