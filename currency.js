const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get exchange rates
router.get('/', async (req, res) => {
    try {
        const { base = 'KZT' } = req.query;

        const apiKey = process.env.EXCHANGERATE_API_KEY;
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;

        const response = await axios.get(url);
        
        const currencyData = {
            base: response.data.base_code,
            last_updated: response.data.time_last_update_utc,
            rates: {
                USD: response.data.conversion_rates.USD,
                EUR: response.data.conversion_rates.EUR,
                RUB: response.data.conversion_rates.RUB,
                CNY: response.data.conversion_rates.CNY
            }
        };

        res.json(currencyData);
    } catch (error) {
        console.error('Currency API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch currency data' });
    }
});

module.exports = router;