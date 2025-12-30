require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const weatherRoutes = require('./routes/weather');
const newsRoutes = require('./routes/news');
const currencyRoutes = require('./routes/currency');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Debug endpoint to check environment variables
app.get('/api/debug-env', (req, res) => {
    console.log('=== DEBUG ENV ENDPOINT CALLED ===');
    console.log('PORT:', process.env.PORT);
    console.log('OPENWEATHER_API_KEY exists:', !!process.env.OPENWEATHER_API_KEY);
    console.log('OPENWEATHER_API_KEY length:', process.env.OPENWEATHER_API_KEY?.length);
    
    res.json({
        server_status: 'running',
        environment_variables: {
            PORT: process.env.PORT || 'Not set (using default 3000)',
            OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY 
                ? `Set (${process.env.OPENWEATHER_API_KEY.length} characters)` 
                : 'NOT SET - THIS IS THE PROBLEM!',
            OPENWEATHER_API_KEY_preview: process.env.OPENWEATHER_API_KEY 
                ? `${process.env.OPENWEATHER_API_KEY.substring(0, 8)}...` 
                : 'No key',
            NEWS_API_KEY: process.env.NEWS_API_KEY ? 'Set' : 'Not set',
            EXCHANGERATE_API_KEY: process.env.EXCHANGERATE_API_KEY ? 'Set' : 'Not set'
        },
        current_directory: __dirname,
        project_root: require('path').join(__dirname, '..'),
        timestamp: new Date().toISOString()
    });
});

// Simple test endpoint that works even without .env
app.get('/api/test-simple', (req, res) => {
    res.json({
        message: 'Server is working!',
        endpoint: '/api/test-simple',
        timestamp: new Date().toISOString(),
        test: 'If you see this, Express server is running correctly'
    });
});

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/currency', currencyRoutes);

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});