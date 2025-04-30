const FavoriteRecipe = require('../models/FavoriteRecipe');

class FavoriteRecipeController {
    // 获取用户收藏的菜谱
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

    // 添加收藏
    async addFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { recipeId, recipeData } = req.body;

            if (!recipeId || !recipeData) {
                return res.status(400).json({
                    success: false,
                    message: '请提供菜谱ID和数据'
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

    // 取消收藏
    async removeFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { favoriteId } = req.params;

            await FavoriteRecipe.removeFavorite(userId, favoriteId);
            res.json({
                success: true,
                message: '取消收藏成功'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // 检查是否已收藏
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