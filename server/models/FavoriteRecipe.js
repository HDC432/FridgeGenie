const { favoriteRecipesContainer } = require('../config/database');

class FavoriteRecipe {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.recipeId = data.recipeId;
        this.recipeData = data.recipeData;
        this.createdAt = new Date();
    }

    // Save favorite recipe
    async save() {
        try {
            console.log('Saving favorite recipe - Start:', this);
            const { resource } = await favoriteRecipesContainer.items.create(this);
            console.log('Saving favorite recipe - Complete:', resource);
            return resource;
        } catch (error) {
            console.error('Error saving favorite recipe:', error);
            throw error;
        }
    }

    // Find user's favorite recipes
    static async findByUserId(userId) {
        try {
            console.log('Finding user favorite recipes - Start:', userId);
            const { resources } = await favoriteRecipesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            console.log('Finding user favorite recipes - Complete:', resources);
            return resources;
        } catch (error) {
            console.error('Error finding user favorite recipes:', error);
            throw error;
        }
    }

    // Check if recipe is favorited
    static async isFavorite(userId, recipeId) {
        try {
            console.log('Checking if recipe is favorited - Start:', { userId, recipeId });
            const { resources } = await favoriteRecipesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId AND c.recipeId = @recipeId",
                parameters: [
                    { name: "@userId", value: userId },
                    { name: "@recipeId", value: recipeId }
                ]
            }).fetchAll();
            console.log('Checking if recipe is favorited - Complete:', resources.length > 0);
            return {
                isFavorite: resources.length > 0,
                favoriteId: resources.length > 0 ? resources[0].id : null
            };
        } catch (error) {
            console.error('Error checking if recipe is favorited:', error);
            throw error;
        }
    }

    // Add to favorites
    static async addFavorite(userId, recipeId, recipeData) {
        try {
            console.log('Adding to favorites - Start:', { userId, recipeId });
            const { isFavorite } = await this.isFavorite(userId, recipeId);
            if (isFavorite) {
                throw new Error('Recipe already in favorites');
            }

            // Ensure ingredient quantities are numbers
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
            console.log('Adding to favorites - Complete:', savedFavorite);
            return savedFavorite;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
        }
    }

    // Remove from favorites
    static async removeFavorite(userId, favoriteId) {
        try {
            console.log('Removing from favorites - Start:', { userId, favoriteId });
            
            // First check if record exists
            const { resources } = await favoriteRecipesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId AND c.id = @favoriteId",
                parameters: [
                    { name: "@userId", value: userId },
                    { name: "@favoriteId", value: favoriteId }
                ]
            }).fetchAll();

            console.log('Query results:', resources);

            if (resources.length === 0) {
                throw new Error('Favorite record not found');
            }

            // If record found, delete it
            const record = resources[0];
            console.log('Preparing to delete record:', record);
            
            // Use userId as partition key for deletion
            await favoriteRecipesContainer.item(favoriteId, userId).delete();
            console.log('Removing from favorites - Complete');
            return true;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        }
    }
}

module.exports = FavoriteRecipe; 