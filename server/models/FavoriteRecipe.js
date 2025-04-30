const { favoriteRecipesContainer } = require('../config/database');

class FavoriteRecipe {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.recipeId = data.recipeId;
        this.recipeData = data.recipeData;
        this.createdAt = new Date();
    }

    // 保存收藏的菜谱
    async save() {
        try {
            console.log('保存收藏菜谱 - 开始:', this);
            const { resource } = await favoriteRecipesContainer.items.create(this);
            console.log('保存收藏菜谱 - 完成:', resource);
            return resource;
        } catch (error) {
            console.error('保存收藏菜谱错误:', error);
            throw error;
        }
    }

    // 查找用户收藏的菜谱
    static async findByUserId(userId) {
        try {
            console.log('查找用户收藏菜谱 - 开始:', userId);
            const { resources } = await favoriteRecipesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            console.log('查找用户收藏菜谱 - 完成:', resources);
            return resources;
        } catch (error) {
            console.error('查找用户收藏菜谱错误:', error);
            throw error;
        }
    }

    // 检查是否已收藏
    static async isFavorite(userId, recipeId) {
        try {
            console.log('检查是否已收藏 - 开始:', { userId, recipeId });
            const { resources } = await favoriteRecipesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId AND c.recipeId = @recipeId",
                parameters: [
                    { name: "@userId", value: userId },
                    { name: "@recipeId", value: recipeId }
                ]
            }).fetchAll();
            console.log('检查是否已收藏 - 完成:', resources.length > 0);
            return {
                isFavorite: resources.length > 0,
                favoriteId: resources.length > 0 ? resources[0].id : null
            };
        } catch (error) {
            console.error('检查是否已收藏错误:', error);
            throw error;
        }
    }

    // 添加收藏
    static async addFavorite(userId, recipeId, recipeData) {
        try {
            console.log('添加收藏 - 开始:', { userId, recipeId });
            const { isFavorite } = await this.isFavorite(userId, recipeId);
            if (isFavorite) {
                throw new Error('已经收藏过该菜谱');
            }

            // 确保食材数量是数字类型
            const processedRecipeData = {
                ...recipeData,
                id: recipeId,
                ingredients: recipeData.ingredients.map(ing => ({
                    ...ing,
                    quantity: parseInt(ing.quantity) || 1
                }))
            };

            const favorite = new FavoriteRecipe({
                id: crypto.randomUUID(),
                userId,
                recipeId,
                recipeData: processedRecipeData
            });
            const savedFavorite = await favorite.save();
            console.log('添加收藏 - 完成:', savedFavorite);
            return savedFavorite;
        } catch (error) {
            console.error('添加收藏错误:', error);
            throw error;
        }
    }

    // 取消收藏
    static async removeFavorite(userId, favoriteId) {
        try {
            console.log('取消收藏 - 开始:', { userId, favoriteId });
            
            // 先查询记录是否存在
            const { resources } = await favoriteRecipesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId AND c.id = @favoriteId",
                parameters: [
                    { name: "@userId", value: userId },
                    { name: "@favoriteId", value: favoriteId }
                ]
            }).fetchAll();

            console.log('查询结果:', resources);

            if (resources.length === 0) {
                throw new Error('未找到收藏记录');
            }

            // 如果找到记录，则删除
            const record = resources[0];
            console.log('准备删除记录:', record);
            
            // 使用userId作为分区键来删除
            await favoriteRecipesContainer.item(favoriteId, userId).delete();
            console.log('取消收藏 - 完成');
            return true;
        } catch (error) {
            console.error('取消收藏错误:', error);
            throw error;
        }
    }
}

module.exports = FavoriteRecipe; 