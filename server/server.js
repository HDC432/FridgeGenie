/**
 * Express server configuration and setup
 * @module server
 */

const express = require('express');
const cors = require('cors');
const ItemController = require('./controllers/itemController');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8083', 'http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.get('/items', ItemController.getAllItems);
app.get('/items/:id', ItemController.getItemById);
app.post('/items', ItemController.createItem);
app.put('/items/:id', ItemController.updateItem);
app.delete('/items/:id', ItemController.deleteItem);

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

/**
 * Start the server
 * @listens {number} port - The port number to listen on
 */
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 