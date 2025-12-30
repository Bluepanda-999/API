const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/weather?city=Almaty
router.get('/', async (req, res) => {
    const city = req.query.city || 'Almaty';
    
    console.log(`=== WEATHER API REQUEST ===`);
    console.log('City:', city);
    console.log('API Key exists:', !!process.env.OPENWEATHER_API_KEY);
    
    if (!process.env.OPENWEATHER_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=en`;
        
        console.log('Making request to OpenWeather API...');
        const response = await axios.get(url);
        
        // Форматируем данные так, как ожидает фронтенд
        const weatherData = {
            city: response.data.name,
            country: response.data.sys.country,
            temperature: Math.round(response.data.main.temp),
            feels_like: Math.round(response.data.main.feels_like),
            description: response.data.weather[0].description,
            condition: response.data.weather[0].main,
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            wind_speed: response.data.wind.speed,
            windSpeed: response.data.wind.speed, // дублируем для совместимости
            rain: response.data.rain ? response.data.rain['3h'] || 0 : 0,
            icon: response.data.weather[0].icon,
            coordinates: {
                lat: response.data.coord.lat,
                lon: response.data.coord.lon
            },
            lat: response.data.coord.lat, // дублируем для совместимости
            lon: response.data.coord.lon  // дублируем для совместимости
        };
        
        console.log('Weather data prepared for:', weatherData.city);
        console.log('Temperature:', weatherData.temperature + '°C');
        
        res.json(weatherData);
        
    } catch (error) {
        console.error('Weather API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'City not found' });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch weather data',
            details: error.response?.data || error.message 
        });
    }
});

module.exports = router;