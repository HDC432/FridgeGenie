const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database('FridgeGenieDB');
const container = database.container('Items');

module.exports = {
    client,
    database,
    container
}; 