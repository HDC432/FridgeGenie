const { CosmosClient } = require('@azure/cosmos');

// Cosmos DB 配置
const cosmosClient = new CosmosClient({
    endpoint: 'https://fridgegenie-db.documents.azure.com:443/',
    key: 'WOKhsjYMsn4pDid4n9tqZwKV2foZdqbZRPSaKIX68vsI5TtbEy70OqPZgvDn1fh85PL8gVgOjzW8ACDbQO8xHQ=='
});

const database = cosmosClient.database('fridgegenie-db');
const usersContainer = database.container('users');
const familiesContainer = database.container('families');
const itemsContainer = database.container('items');

module.exports = {
    usersContainer,
    familiesContainer,
    itemsContainer
}; 