const express = require('express');
const router = express.Router();
const favoriteRecipeController = require('../controllers/favoriteRecipeController');
const auth = require('../middleware/auth');

// Get user's favorite recipes
router.get('/', auth, favoriteRecipeController.getFavorites);

// Add favorite
router.post('/', auth, favoriteRecipeController.addFavorite);

// Remove favorite
router.delete('/:favoriteId', auth, favoriteRecipeController.removeFavorite);

// Check if recipe is favorited
router.get('/:recipeId/check', auth, favoriteRecipeController.checkFavorite);

module.exports = router; 