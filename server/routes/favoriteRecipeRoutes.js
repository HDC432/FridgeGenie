const express = require('express');
const router = express.Router();
const favoriteRecipeController = require('../controllers/favoriteRecipeController');
const auth = require('../middleware/auth');

// 获取用户收藏的菜谱
router.get('/', auth, favoriteRecipeController.getFavorites);

// 添加收藏
router.post('/', auth, favoriteRecipeController.addFavorite);

// 取消收藏
router.delete('/:favoriteId', auth, favoriteRecipeController.removeFavorite);

// 检查是否已收藏
router.get('/:recipeId/check', auth, favoriteRecipeController.checkFavorite);

module.exports = router; 