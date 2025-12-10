// Weather App JavaScript
// API Configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const cityName = document.getElementById('cityName');
const date = document.getElementById('date');
const description = document.getElementById('description');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weatherIcon');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecastContainer');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Main Functions
function handleSearch() {
    const city = searchInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    fetchWeatherData(city);
    searchInput.value = '';
}

function fetchWeatherData(city) {
    const currentWeatherUrl = `${API_BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`;
    
    fetch(currentWeatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            fetchForecastData(data.coord.lat, data.coord.lon);
            clearError();
        })
        .catch(error => {
            showError(error.message);
        });
}

function fetchForecastData(lat, lon) {
    const forecastUrl = `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
        });
}

function displayCurrentWeather(data) {
    const current = data.main;
    const weather = data.weather[0];
    
    // Update city name and date
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    date.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update weather description and temperature
    description.textContent = weather.main;
    temp.textContent = Math.round(current.temp);
    
    // Update weather icon
    const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = weather.description;
    
    // Update weather details
    feelsLike.textContent = `${Math.round(current.feels_like)}°C`;
    humidity.textContent = `${current.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${current.pressure} hPa`;
}

function displayForecast(forecastList) {
    // Get forecast for next 5 days (one entry per day at noon)
    const dailyForecasts = {};
    
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Only keep one forecast per day (take the one closest to noon)
        if (!dailyForecasts[day] || 
            Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[day].dt * 1000).getHours() - 12)) {
            dailyForecasts[day] = forecast;
        }
    });
    
    // Clear existing forecast cards
    forecastContainer.innerHTML = '';
    
    // Display up to 5 days
    Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
        const forecastCard = createForecastCard(forecast);
        forecastContainer.appendChild(forecastCard);
    });
}

function createForecastCard(forecast) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    const date = new Date(forecast.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const temp = Math.round(forecast.main.temp);
    const icon = forecast.weather[0].icon;
    const description = forecast.weather[0].main;
    
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    card.innerHTML = `
        <div class="forecast-date">${dayName}<br>${dayDate}</div>
        <img class="forecast-icon" src="${iconUrl}" alt="${description}">
        <div class="forecast-temp">${temp}°C</div>
        <div class="forecast-description">${description}</div>
    `;
    
    return card;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function clearError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

// Initialize app
window.addEventListener('load', () => {
    console.log('Weather App Loaded');
    // You can set a default city here
    // fetchWeatherData('London');
});