const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Cosmos DB 配置
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const database = cosmosClient.database('fridgegenie-db');
const usersContainer = database.container('users');
const familiesContainer = database.container('families');
const itemsContainer = database.container('items');

module.exports = {
    client: cosmosClient,
    database,
    usersContainer,
    familiesContainer,
    itemsContainer
}; 