const { favoriteRecipesContainer } = require('../config/database');

/**
 * Model class for managing user's favorite recipes
 * @class FavoriteRecipe
 */
class FavoriteRecipe {
    /**
     * Creates a new FavoriteRecipe instance
     * @param {Object} data - The favorite recipe data
     * @param {string} data.id - Unique identifier
     * @param {string} data.userId - The ID of the user
     * @param {string} data.recipeId - The ID of the recipe
     * @param {Object} data.recipeData - The recipe data
     * @param {Date} [data.createdAt] - Creation timestamp
     */
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.recipeId = data.recipeId;
        this.recipeData = data.recipeData;
        this.createdAt = new Date();
    }

    /**
     * Saves the favorite recipe to the database
     * @async
     * @returns {Promise<Object>} The saved favorite recipe
     * @throws {Error} If saving fails
     */
    async save() {
        try {
            console.log('Saving favorite recipe - Starting:', this);
            const { resource } = await favoriteRecipesContainer.items.create(this);
            console.log('Saving favorite recipe - Completed:', resource);
            return resource;
        } catch (error) {
            console.error('Error saving favorite recipe:', error);
            throw error;
        }
    }

    /**
     * Finds all favorite recipes for a user
     * @static
     * @async
     * @param {string} userId - The ID of the user
     * @returns {Promise<Array<Object>>} Array of favorite recipes
     * @throws {Error} If query fails
     */
    static async findByUserId(userId) {
        try {
            console.log('Finding user favorite recipes - Starting:', userId);
            const { resources } = await favoriteRecipesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            }).fetchAll();
            console.log('Finding user favorite recipes - Completed:', resources);
            return resources;
        } catch (error) {
            console.error('Error finding user favorite recipes:', error);
            throw error;
        }
    }

    /**
     * Checks if a recipe is already favorited by a user
     * @static
     * @async
     * @param {string} userId - The ID of the user
     * @param {string} recipeId - The ID of the recipe
     * @returns {Promise<Object>} Object containing isFavorite status and favoriteId
     * @throws {Error} If query fails
     */
    static async isFavorite(userId, recipeId) {
        try {
            console.log('Checking if recipe is favorited - Starting:', { userId, recipeId });
            const { resources } = await favoriteRecipesContainer.items.query({
                query: "SELECT * FROM c WHERE c.userId = @userId AND c.recipeId = @recipeId",
                parameters: [
                    { name: "@userId", value: userId },
                    { name: "@recipeId", value: recipeId }
                ]
            }).fetchAll();
            console.log('Checking if recipe is favorited - Completed:', resources.length > 0);
            return {
                isFavorite: resources.length > 0,
                favoriteId: resources.length > 0 ? resources[0].id : null
            };
        } catch (error) {
            console.error('Error checking if recipe is favorited:', error);
            throw error;
        }
    }

    /**
     * Adds a recipe to user's favorites
     * @static
     * @async
     * @param {string} userId - The ID of the user
     * @param {string} recipeId - The ID of the recipe
     * @param {Object} recipeData - The recipe data
     * @returns {Promise<Object>} The saved favorite recipe
     * @throws {Error} If recipe is already favorited or saving fails
     */
    static async addFavorite(userId, recipeId, recipeData) {
        try {
            console.log('Adding favorite - Starting:', { userId, recipeId });
            const { isFavorite } = await this.isFavorite(userId, recipeId);
            if (isFavorite) {
                throw new Error('Recipe is already favorited');
            }

            // Ensure ingredient quantities are valid numbers
            const processedRecipeData = {
                ...recipeData,
                id: recipeId,
                ingredients: recipeData.ingredients.map(ing => {
                    let quantity = 1;
                    if (typeof ing.quantity === 'number') {
                        quantity = ing.quantity;
                    } else if (typeof ing.quantity === 'string') {
                        const match = ing.quantity.match(/\d+(\.\d+)?/);
                        quantity = match ? parseFloat(match[0]) : 1;
                    }
                    // Ensure quantity is a valid positive number
                    quantity = Math.max(1, Math.floor(quantity));
                    return {
                        ...ing,
                        quantity: quantity
                    };
                })
            };

            const favorite = new FavoriteRecipe({
                id: crypto.randomUUID(),
                userId,
                recipeId,
                recipeData: processedRecipeData
            });
            const savedFavorite = await favorite.save();
            console.log('Adding favorite - Completed:', savedFavorite);
            return savedFavorite;
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    }

    /**
     * Removes a recipe from user's favorites
     * @static
     * @async
     * @param {string} userId - The ID of the user
     * @param {string} favoriteId - The ID of the favorite record
     * @returns {Promise<boolean>} True if removal was successful
     * @throws {Error} If favorite record not found or deletion fails
     */
    static async removeFavorite(userId, favoriteId) {
        try {
            console.log('Removing favorite - Starting:', { userId, favoriteId });
            
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
            console.log('Removing favorite - Completed');
            return true;
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    }
}

module.exports = FavoriteRecipe; 