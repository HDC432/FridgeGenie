const FavoriteRecipe = require('../models/FavoriteRecipe');

class FavoriteRecipeController {
    // Get user's favorite recipes
    async getFavorites(req, res) {
        try {
            const userId = req.user.id;
            const favorites = await FavoriteRecipe.findByUserId(userId);
            res.json({
                success: true,
                data: favorites
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Add favorite
    async addFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { recipeId, recipeData } = req.body;

            if (!recipeId || !recipeData) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide recipe ID and data'
                });
            }

            const favorite = await FavoriteRecipe.addFavorite(userId, recipeId, recipeData);
            res.json({
                success: true,
                data: favorite
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Remove favorite
    async removeFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { favoriteId } = req.params;

            await FavoriteRecipe.removeFavorite(userId, favoriteId);
            res.json({
                success: true,
                message: 'Successfully removed from favorites'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Check if recipe is favorited
    async checkFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { recipeId } = req.params;

            const result = await FavoriteRecipe.isFavorite(userId, recipeId);
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new FavoriteRecipeController(); 