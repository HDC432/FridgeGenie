/**
 * @fileoverview Database configuration and container initialization for Cosmos DB
 * @requires @azure/cosmos
 */

const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Cosmos DB Configuration
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

// Initialize database connection
const database = cosmosClient.database('fridgegenie-db');

// Create or get containers
const usersContainer = database.container('users');
const familiesContainer = database.container('families');
const itemsContainer = database.container('items');
const healthProfilesContainer = database.container('healthProfiles');
const favoriteRecipesContainer = database.container('favoriteRecipes');

/**
 * Ensures all required containers exist in the database
 * Creates containers if they don't exist with appropriate partition keys
 * @async
 * @function ensureContainers
 * @throws {Error} If container creation fails
 */
async function ensureContainers() {
    try {
        console.log('Ensuring containers exist...');
        await database.containers.createIfNotExists({ 
            id: 'users',
            partitionKey: { paths: ['/id'] }
        });
        console.log('users container is ready');

        await database.containers.createIfNotExists({ 
            id: 'families',
            partitionKey: { paths: ['/id'] }
        });
        console.log('families container is ready');

        await database.containers.createIfNotExists({ 
            id: 'items',
            partitionKey: { paths: ['/familyId'] }
        });
        console.log('items container is ready');

        await database.containers.createIfNotExists({ 
            id: 'healthProfiles',
            partitionKey: { paths: ['/userId'] }
        });
        console.log('healthProfiles container is ready');

        await database.containers.createIfNotExists({ 
            id: 'favoriteRecipes',
            partitionKey: { paths: ['/userId'] }
        });
        console.log('favoriteRecipes container is ready');
    } catch (error) {
        console.error('Failed to ensure containers exist:', error);
        process.exit(1);
    }
}

// Execute container initialization immediately
ensureContainers();

/**
 * @exports {Object} Database containers
 * @property {Container} usersContainer - Container for user data
 * @property {Container} familiesContainer - Container for family data
 * @property {Container} itemsContainer - Container for item data
 * @property {Container} healthProfilesContainer - Container for health profile data
 * @property {Container} favoriteRecipesContainer - Container for favorite recipes data
 */
module.exports = {
    usersContainer,
    familiesContainer,
    itemsContainer,
    healthProfilesContainer,
    favoriteRecipesContainer
}; 