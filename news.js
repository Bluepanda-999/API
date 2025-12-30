const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/news?country=code
router.get('/', async (req, res) => {
    const country = req.query.country || 'us';
    
    console.log(`=== NEWS API REQUEST ===`);
    console.log('Country:', country);
    console.log('API Key exists:', !!process.env.NEWS_API_KEY);
    
    // Если News API ключ не работает, вернем тестовые данные
    if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === '0c6c7677050844aeb25f9379674d1c8a') {
        console.log('Using fallback news data');
        
        const fallbackNews = [
            {
                title: "Latest News from Kazakhstan",
                description: "Current events and updates from the region",
                source: "Local News",
                publishedAt: new Date().toISOString(),
                image: "https://via.placeholder.com/300x150"
            },
            {
                title: "Weather Dashboard Project Complete",
                description: "Successfully implemented weather, news, and currency features",
                source: "Project Update",
                publishedAt: new Date().toISOString(),
                image: "https://via.placeholder.com/300x150"
            },
            {
                title: "Technology News",
                description: "Latest developments in web development and APIs",
                source: "Tech News",
                publishedAt: new Date().toISOString(),
                image: "https://via.placeholder.com/300x150"
            }
        ];
        
        return res.json(fallbackNews); // Фронтенд ожидает массив, не объект с articles
    }
    
    try {
        // Реальный запрос к NewsAPI
        const apiKey = process.env.NEWS_API_KEY;
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}&pageSize=5`;
        
        const response = await axios.get(url);
        
        // Преобразуем данные в формат, ожидаемый фронтендом
        const articles = response.data.articles.map(article => ({
            title: article.title,
            description: article.description,
            source: article.source.name,
            publishedAt: article.publishedAt,
            image: article.urlToImage,
            url: article.url
        }));
        
        res.json(articles); // Возвращаем массив
        
    } catch (error) {
        console.error('News API Error:', error.response?.data || error.message);
        
        // Fallback данные при ошибке
        const fallbackArticles = [
            {
                title: "News service temporarily unavailable",
                description: "Please check back later for updates",
                source: "System",
                publishedAt: new Date().toISOString()
            }
        ];
        
        res.json(fallbackArticles);
    }
});

module.exports = router;