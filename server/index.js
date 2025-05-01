/**
 * Main server file for the FridgeGenie application
 * @module server/index
 */

const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const familyRoutes = require('./routes/familyRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const favoriteRecipeRoutes = require('./routes/favoriteRecipeRoutes');
require('dotenv').config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// User routes
app.use('/users', userRoutes);

// Family routes
app.use('/families', familyRoutes);

// Item routes
app.use('/items', itemRoutes);

// Health check routes
app.use('/health', healthRoutes);

// Favorite recipes routes
app.use('/favorites', favoriteRecipeRoutes);

/**
 * Error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 